import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Testimonial from '@/models/Testimonials';
import Product from '@/models/Product';

export async function GET() {
  try {
    await dbConnect();

    // Get featured testimonials (highest rated, verified, with comments)
    const featuredTestimonials = await Testimonial.find({
      verified: true,
      comment: { $exists: true, $ne: '' },
      rating: { $gte: 4 }
    })
      .populate('user', 'name email profileImage')
      .populate('product', 'title mainImage category')
      .sort({ rating: -1, createdAt: -1 })
      .limit(10)
      .lean();

    // Transform testimonials to match expected frontend shape
    const transformed = featuredTestimonials.map((t) => ({
      id: t._id,
      name: t.user?.name || 'Anonymous',
      role: t.user?.role || 'Customer',
      image: t.user?.profileImage || t.user?.image || '/images/default-avatar.jpg',
      rating: t.rating,
      text: t.comment,
      product: t.product ? { title: t.product.title, category: t.product.category } : null,
      createdAt: t.createdAt,
      verified: t.verified
    }));

    const totalTestimonials = await Testimonial.countDocuments({ verified: true });
    const agg = await Testimonial.aggregate([
      { $match: { verified: true } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    const averageRating = agg?.[0]?.avgRating ? Math.round(agg[0].avgRating * 10) / 10 : null;

    const stats = {
      averageRating,
      totalCustomers: totalTestimonials
    };

    return NextResponse.json({ testimonials: transformed, stats });
  } catch (err) {
    console.error('[api/testimonials/featured] error:', err?.message || err);
    if (err?.stack) console.error(err.stack);
    return NextResponse.json({ error: 'Failed to fetch featured testimonials' }, { status: 500 });
  }
}
