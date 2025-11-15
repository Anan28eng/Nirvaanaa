import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Return from '@/models/Return';
import Product from '@/models/Product';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();
    const { id } = params;

    const returnRequest = await Return.findById(id)
      .populate('orderId', 'orderNumber total status createdAt')
      .populate('userId', 'name email');

    if (!returnRequest) {
      return NextResponse.json(
        { error: 'Return request not found' },
        { status: 404 }
      );
    }

    // Check if user is admin or owns the return
    if (session.user.role !== 'admin' && returnRequest.userId._id.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({ return: returnRequest });
  } catch (error) {
    console.error('Error fetching return:', error);
    return NextResponse.json(
      { error: 'Failed to fetch return request' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();
    const { id } = params;
    const body = await request.json();
    const { status, adminNotes, trackingNumber } = body;

    const returnRequest = await Return.findById(id);
    if (!returnRequest) {
      return NextResponse.json(
        { error: 'Return request not found' },
        { status: 404 }
      );
    }

    // Update return request
    const updateData = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;

    const updatedReturn = await Return.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('orderId', 'orderNumber total status createdAt')
     .populate('userId', 'name email');

    // If return is approved and completed, restore stock
    if (status === 'completed') {
      for (const item of returnRequest.items) {
        try {
          await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { stock: item.quantity } }
          );
        } catch (err) {
          console.error('Failed to restore stock for', item.productId, err);
        }
      }
    }

    return NextResponse.json({ 
      message: 'Return request updated successfully',
      return: updatedReturn 
    });
  } catch (error) {
    console.error('Error updating return:', error);
    return NextResponse.json(
      { error: 'Failed to update return request' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();
    const { id } = params;

    const returnRequest = await Return.findById(id);
    if (!returnRequest) {
      return NextResponse.json(
        { error: 'Return request not found' },
        { status: 404 }
      );
    }

    await Return.findByIdAndDelete(id);

    return NextResponse.json({ 
      message: 'Return request deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting return:', error);
    return NextResponse.json(
      { error: 'Failed to delete return request' },
      { status: 500 }
    );
  }
}
