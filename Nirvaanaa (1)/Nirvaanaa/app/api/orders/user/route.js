import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    const orders = await Order.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error('User orders API error:', error);
    return NextResponse.json({ error: 'Failed to fetch user orders' }, { status: 500 });
  }
}
