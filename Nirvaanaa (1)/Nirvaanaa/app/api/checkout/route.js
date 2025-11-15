import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Order from '@/models/Order';
import Shipping from '@/models/Shipping';
import Razorpay from 'razorpay';
import { rateLimit } from '@/lib/rateLimit';

// Initialize Razorpay client
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
  // Apply rate limiting
  const rateLimitResponse = await rateLimit(request, 'payment');
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: 'Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your environment variables.' },
        { status: 500 }
      );
    }

    await dbConnect();
    const body = await request.json();
    const { items, shippingAddress, shipping: shippingBody, billingAddress, shippingMethod = 'Standard Shipping', paymentMethod } = body;

    // Accept either shippingAddress or shipping
    const shipping = shippingAddress || shippingBody;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart items are required' }, { status: 400 });
    }

    if (!shipping) {
      return NextResponse.json({ error: 'Shipping address is required' }, { status: 400 });
    }

    // Normalize incoming item references to productId
    const normalizedItems = items.map(i => ({
      ...i,
      productId: i.productId || i.id || i._id,
    }));

    const productIds = normalizedItems.map(item => item.productId).filter(Boolean);
    if (productIds.length !== normalizedItems.length) {
      return NextResponse.json({ error: 'Invalid cart items' }, { status: 400 });
    }

    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== productIds.length) {
      return NextResponse.json({ error: 'Some products not found' }, { status: 400 });
    }

    // Calculate totals and validate stock
    let subtotal = 0;
    let totalDiscount = 0;
    const orderItems = [];

    for (const item of normalizedItems) {
      const product = products.find(p => p._id.toString() === item.productId);

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 400 }
        );
      }

      if (!product.published) {
        return NextResponse.json(
          { error: `Product ${product.title} is not available` },
          { status: 400 }
        );
      }

      if (typeof product.stock === 'number' && product.stock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${product.title}` }, { status: 400 });
      }

      const discountPct = typeof product.discount === 'number' ? product.discount : 0;
      const effectivePrice = Math.round((product.price * (1 - discountPct / 100)) || 0);

      const itemTotal = effectivePrice * item.quantity;
      const itemOriginalTotal = (product.price || 0) * item.quantity;
      subtotal += itemTotal;
      totalDiscount += Math.max(0, itemOriginalTotal - itemTotal);

      orderItems.push({
        productId: product._id,
        name: product.title || product.name,
        image: Array.isArray(product.images) ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url || '') : (product.mainImage || ''),
        price: effectivePrice,
        originalPrice: product.price,
        discount: discountPct,
        quantity: item.quantity,
        sku: product.sku,
        colorVariant: item.colorVariant || null,
      });
    }

    // Calculate shipping and tax
    let shippingCost = 100;
    let gstPercent = 18;
    let estimatedDays = 5;
    
    if (shippingMethod) {
      const shippingMethodDoc = await Shipping.findOne({ 
        name: shippingMethod,
        isActive: true 
      });
      
      if (shippingMethodDoc) {
        shippingCost = shippingMethodDoc.cost || 100;
        gstPercent = shippingMethodDoc.gstPercent || 18;
        if (shippingMethodDoc.estimatedDays) {
          if (typeof shippingMethodDoc.estimatedDays === 'object' && shippingMethodDoc.estimatedDays.max) {
            estimatedDays = shippingMethodDoc.estimatedDays.max;
          } else if (typeof shippingMethodDoc.estimatedDays === 'number') {
            estimatedDays = shippingMethodDoc.estimatedDays;
          }
        }
      }
    }
    
    const tax = Math.round((subtotal + shippingCost) * gstPercent / 100);
    const total = Math.round((subtotal + shippingCost + tax - totalDiscount) * 100); // Convert to paise

    // Create order in database
    const order = new Order({
      userId: session.user.id,
      items: orderItems,
      subtotal,
      tax,
      shipping: shippingCost,
      discount: totalDiscount,
      total: (subtotal + shippingCost + tax - totalDiscount),
      currency: 'INR',
      paymentMethod: 'razorpay',
      shippingAddress: shipping || shippingAddress,
      billingAddress: billingAddress || shipping || shippingAddress,
      shippingMethod: {
        name: shippingMethod,
        estimatedDays: estimatedDays,
      },
    });

    await order.save();

    // Create Razorpay order
    const razorpayOrderOptions = {
      amount: total, // Amount in paise
      currency: 'INR',
      receipt: order.orderNumber || order._id.toString(),
      notes: {
        orderId: order._id.toString(),
        userId: session.user.id,
        shipping: JSON.stringify(shipping || {}),
        paymentMethod: paymentMethod || 'card',
      },
    };

    const razorpayOrder = await razorpay.orders.create(razorpayOrderOptions);

    // Update order with Razorpay order ID
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    // Return order details for frontend
    return NextResponse.json({ 
      id: razorpayOrder.id, 
      orderId: order._id,
      amount: total,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout order' },
      { status: 500 }
    );
  }
}
