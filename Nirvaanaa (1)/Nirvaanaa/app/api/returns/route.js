import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Return from '@/models/Return';
import Order from '@/models/Order';
import Product from '@/models/Product';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const isAdmin = session.user.role === 'admin';

    let query = {};
    
    // If not admin, only show user's returns
    if (!isAdmin) {
      query.userId = session.user.id;
    }
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const returns = await Return.find(query)
      .populate('orderId', 'orderNumber total status createdAt')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ returns });
  } catch (error) {
    console.error('Error fetching returns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch returns' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();
    const body = await request.json();
    const { orderId, items, returnReason } = body;

    if (!orderId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Order ID and items are required' },
        { status: 400 }
      );
    }

    if (!returnReason) {
      return NextResponse.json(
        { error: 'Return reason is required' },
        { status: 400 }
      );
    }

    // Verify order belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if order is eligible for return (within 30 days and not already returned)
    const orderDate = new Date(order.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    if (orderDate < thirtyDaysAgo) {
      return NextResponse.json(
        { error: 'Order is not eligible for return (more than 30 days old)' },
        { status: 400 }
      );
    }

    // Check if return already exists for this order
    const existingReturn = await Return.findOne({ orderId });
    if (existingReturn) {
      return NextResponse.json(
        { error: 'Return request already exists for this order' },
        { status: 400 }
      );
    }

    // Validate items against order
    const orderItemIds = order.items.map(item => item.productId.toString());
    for (const returnItem of items) {
      if (!orderItemIds.includes(returnItem.productId)) {
        return NextResponse.json(
          { error: 'Invalid item for return' },
          { status: 400 }
        );
      }

      const orderItem = order.items.find(item => item.productId.toString() === returnItem.productId);
      if (returnItem.quantity > orderItem.quantity) {
        return NextResponse.json(
          { error: 'Return quantity cannot exceed ordered quantity' },
          { status: 400 }
        );
      }
    }

    // Create return request
    const returnRequest = new Return({
      orderId,
      userId: session.user.id,
      items,
      returnReason,
      status: 'pending',
    });

    await returnRequest.save();

    // Populate the return with order and user details
    await returnRequest.populate('orderId', 'orderNumber total status createdAt');
    await returnRequest.populate('userId', 'name email');

    return NextResponse.json({ 
      message: 'Return request submitted successfully',
      return: returnRequest 
    });
  } catch (error) {
    console.error('Error creating return:', error);
    return NextResponse.json(
      { error: 'Failed to create return request' },
      { status: 500 }
    );
  }
}
