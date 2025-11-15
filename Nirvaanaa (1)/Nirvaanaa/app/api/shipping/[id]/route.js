import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Shipping from '@/models/Shipping';

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

    const shippingMethod = await Shipping.findById(id);

    if (!shippingMethod) {
      return NextResponse.json(
        { error: 'Shipping method not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ method: shippingMethod });
  } catch (error) {
    console.error('Error fetching shipping method:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shipping method' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();
    const { id } = params;
    const body = await request.json();

    const shippingMethod = await Shipping.findById(id);
    if (!shippingMethod) {
      return NextResponse.json(
        { error: 'Shipping method not found' },
        { status: 404 }
      );
    }

    // If this is set as default, unset other defaults
    if (body.isDefault) {
      await Shipping.updateMany({ _id: { $ne: id } }, { isDefault: false });
    }

    const updatedMethod = await Shipping.findByIdAndUpdate(
      id,
      body,
      { new: true }
    );

    return NextResponse.json({ 
      message: 'Shipping method updated successfully',
      method: updatedMethod 
    });
  } catch (error) {
    console.error('Error updating shipping method:', error);
    return NextResponse.json(
      { error: 'Failed to update shipping method' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();
    const { id } = params;

    const shippingMethod = await Shipping.findById(id);
    if (!shippingMethod) {
      return NextResponse.json(
        { error: 'Shipping method not found' },
        { status: 404 }
      );
    }

    await Shipping.findByIdAndDelete(id);

    return NextResponse.json({ 
      message: 'Shipping method deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting shipping method:', error);
    return NextResponse.json(
      { error: 'Failed to delete shipping method' },
      { status: 500 }
    );
  }
}
