import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET() {
  try {
    await dbConnect();
    
    // Get tag counts with product counts
    const tagCounts = await Product.aggregate([
      { $match: { published: true } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Map to frontend-friendly format
    const tags = tagCounts.map(tag => ({
      id: tag._id,
      name: tag._id.charAt(0).toUpperCase() + tag._id.slice(1),
      count: tag.count
    }));

    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Tags API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}
