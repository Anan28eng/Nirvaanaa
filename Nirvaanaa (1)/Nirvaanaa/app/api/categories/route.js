import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET() {
  try {
    await dbConnect();
    
    // Get category counts with product counts
    const categoryCounts = await Product.aggregate([
      { $match: { published: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Map to frontend-friendly format
    const categories = categoryCounts.map(cat => ({
      id: cat._id,
      name: cat._id.charAt(0).toUpperCase() + cat._id.slice(1).replace('-', ' '),
      count: cat.count
    }));

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
