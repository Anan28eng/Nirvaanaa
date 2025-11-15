import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TagDiscount from '@/models/TagDiscount';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    await dbConnect();
    const discounts = await TagDiscount.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ discounts });
  } catch (e) {
    console.error('List tag discounts error:', e);
    return NextResponse.json({ error: 'Failed to list tag discounts' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const body = await request.json();
    const { tag, percent, active = true } = body;
    if (!tag || typeof percent !== 'number') {
      return NextResponse.json({ error: 'tag and percent required' }, { status: 400 });
    }
    const saved = await TagDiscount.findOneAndUpdate(
      { tag: tag.toLowerCase().trim() },
      { tag: tag.toLowerCase().trim(), percent, active, createdBy: session.user.id },
      { upsert: true, new: true }
    );
    return NextResponse.json({ discount: saved }, { status: 201 });
  } catch (e) {
    console.error('Create tag discount error:', e);
    return NextResponse.json({ error: 'Failed to save tag discount' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');
    if (!tag) return NextResponse.json({ error: 'tag required' }, { status: 400 });
    await TagDiscount.findOneAndDelete({ tag: tag.toLowerCase().trim() });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Delete tag discount error:', e);
    return NextResponse.json({ error: 'Failed to delete tag discount' }, { status: 500 });
  }
}


