import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Order from '@/models/Order';
import Shipping from '@/models/Shipping';
import Razorpay from 'razorpay';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(request) {
  // Apply rate limiting
  const rateLimitResponse = await rateLimit(request, 'payment');
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Guard against missing Razorpay keys
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: 'Razorpay is not configured. Payments are disabled in this environment.' },
        { status: 503 }
      );
    }

    // Initialize Razorpay client only when keys exist
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    await dbConnect();
    const body = await request.json();
    const { items, shippingAddress, shipping: shippingBody, billingAddress, shippingMethod = 'Standard Shipping' } = body;

    const shipping = shippingAddress || shippingBody;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart items are required' }, { status: 400 });
    }
    if (!shipping) {
      return NextResponse.json({ error: 'Shipping address is required' }, { status: 400 });
    }

    // Normalize items
    const normalizedItems = items.map(i => ({
      ...i,
      productId: i.productId || i.id || i._id,
    }));
    const productIds = normalizedItems.map(item => item.productId).filter(Boolean);
    const products = await Product.find({ _id: { $in: productIds } });
    if (products.length !== productIds.length) {
      return NextResponse.json({ error: 'Some products not found' }, { status: 400 });
    }

    // Calculate totals
    let subtotal = 0;
    let totalDiscount = 0;
    const orderItems = [];
    for (const item of normalizedItems) {
      const product = products.find(p => p._id.toString() === item.productId);
      if (!product || !product.published) {
        return NextResponse.json({ error: `Product ${item.productId} not available` }, { status: 400 });
      }
      if (typeof product.stock === 'number' && product.stock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${product.title}` }, { status: 400 });
      }
      const discountPct = typeof product.discount === 'number' ? product.discount : 0;
      const effectivePrice = Math.round(product.price * (1 - discountPct / 100));
      subtotal += effectivePrice * item.quantity;
      totalDiscount += (product.price * item.quantity) - (effectivePrice * item.quantity);
      orderItems.push({
        productId: product._id,
        name: product.title,
        price: effectivePrice,
        originalPrice: product.price,
        discount: discountPct,
        quantity: item.quantity,
      });
    }

    // Shipping & tax
    let shippingCost = 100;
    let gstPercent = 18;
    let estimatedDays = 5;
    const shippingMethodDoc = await Shipping.findOne({ name: shippingMethod, isActive: true });
    if (shippingMethodDoc) {
      shippingCost = shippingMethodDoc.cost || shippingCost;
      gstPercent = shippingMethodDoc.gstPercent || gstPercent;
      estimatedDays = typeof shippingMethodDoc.estimatedDays === 'number'
        ? shippingMethodDoc.estimatedDays
        : estimatedDays;
    }
    const tax = Math.round((subtotal + shippingCost) * gstPercent / 100);
    const total = Math.round((subtotal + shippingCost + tax - totalDiscount) * 100); // paise

    // Save order
    const order = new Order({
      userId: session.user.id,
      items: orderItems,
      subtotal,
      tax,
      shipping: shippingCost,
      discount: totalDiscount,
      total: subtotal + shippingCost + tax - totalDiscount,
      currency: 'INR',
      paymentMethod: 'razorpay',
      status: 'pending',
      shippingAddress: shipping,
      billingAddress: billingAddress || shipping,
      shippingMethod: { name: shippingMethod, estimatedDays },
    });
    await order.save();

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: total,
      currency: 'INR',
      receipt: order._id.toString(),
      notes: { orderId: order._id.toString(), userId: session.user.id },
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    return NextResponse.json({
      orderId: order._id.toString(),
      razorpayOrderId: razorpayOrder.id,
      amount: total,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create checkout order' }, { status: 500 });
  }
}

