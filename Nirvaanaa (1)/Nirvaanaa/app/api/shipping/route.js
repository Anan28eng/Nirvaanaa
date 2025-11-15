import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Shipping from '@/models/Shipping';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === 'admin';
    
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const orderTotal = parseFloat(searchParams.get('orderTotal')) || 0;
    const weight = parseFloat(searchParams.get('weight')) || 0;
    const dimensions = searchParams.get('dimensions') ? JSON.parse(searchParams.get('dimensions')) : null;

    if (orderTotal > 0) {
      // Calculate shipping for specific order
      const shippingCalculation = await Shipping.calculateShipping(orderTotal, weight, dimensions);
      return NextResponse.json({ 
        shipping: shippingCalculation,
        methods: await Shipping.findActive()
      });
    }

    // Return all shipping methods (admin) or active methods (user)
    const methods = isAdmin 
      ? await Shipping.find().sort({ cost: 1 })
      : await Shipping.findActive();

    return NextResponse.json({ methods });
  } catch (error) {
    console.error('Error fetching shipping methods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shipping methods' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();
    const body = await request.json();
    const { name, description, cost, estimatedDays, freeShippingThreshold, applicableRegions, weightLimit, dimensionsLimit, gstPercent } = body;

    if (!name || !cost || !estimatedDays) {
      return NextResponse.json(
        { error: 'Name, cost, and estimated days are required' },
        { status: 400 }
      );
    }

    // If this is set as default, unset other defaults
    if (body.isDefault) {
      await Shipping.updateMany({}, { isDefault: false });
    }

    const shippingMethod = new Shipping({
      name,
      description,
      cost,
      estimatedDays,
      freeShippingThreshold,
      applicableRegions,
      weightLimit,
      dimensionsLimit,
      isActive: body.isActive !== false,
      isDefault: body.isDefault || false,
      gstPercent: typeof gstPercent === 'number' ? gstPercent : undefined,
    });

    await shippingMethod.save();

    return NextResponse.json({ 
      message: 'Shipping method created successfully',
      method: shippingMethod 
    });
  } catch (error) {
    console.error('Error creating shipping method:', error);
    return NextResponse.json(
      { error: 'Failed to create shipping method' },
      { status: 500 }
    );
  }
}
