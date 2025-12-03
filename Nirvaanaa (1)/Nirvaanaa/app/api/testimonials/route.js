import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Testimonial from '@/models/Testimonials';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { emitToAdmin, emitToAll } from '@/lib/socket';

// GET: public fetch for a product's testimonials when `productId` query present.
// If no `productId` is supplied, this route returns all testimonials only for admins.
export async function GET(req) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (productId) {
      const testimonials = await Testimonial.find({ product: productId })
        .populate('user', 'name image profileImage role')
        .sort({ createdAt: -1 })
        .lean();

      return NextResponse.json({ testimonials });
    }

    // No productId => admin listing
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const testimonials = await Testimonial.find()
      .populate('product', 'title mainImage')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ testimonials });
  } catch (err) {
    console.error('GET /api/testimonials error', err?.message || err);
    if (err?.stack) console.error(err.stack);
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
  }
}

export async function POST(req) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { productId, rating, comment } = body;

    const existing = await Testimonial.findOne({ user: session.user.id, product: productId });
    if (existing) return NextResponse.json({ error: 'You have already submitted a testimonial for this product' }, { status: 400 });

    const testimonial = new Testimonial({
      product: productId,
      user: session.user.id,
      rating,
      comment: comment?.trim() || '',
      verified: true
    });

    await testimonial.save();
    await testimonial.populate('user', 'name email profileImage');

    // Update ratings on product
    await updateProductRating(productId);
    try {
      const updated = await Product.findById(productId).lean();
      emitToAdmin('product-changed', { action: 'updated', product: updated });
      emitToAll('product-changed', { action: 'updated', product: updated });
    } catch (e) {}

    return NextResponse.json({ testimonial }, { status: 201 });
  } catch (err) {
    console.error('POST /api/testimonials error', err?.message || err);
    if (err?.stack) console.error(err.stack);
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 });
  }
}

export async function PUT(req) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { testimonialId, rating, comment } = body;

    let query = { _id: testimonialId, user: session.user.id };
    if (session.user.role === 'admin') query = { _id: testimonialId };

    const testimonial = await Testimonial.findOne(query);
    if (!testimonial) return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });

    testimonial.rating = rating;
    testimonial.comment = comment?.trim() || '';
    await testimonial.save();

    await updateProductRating(testimonial.product);
    try {
      const updated = await Product.findById(testimonial.product).lean();
      emitToAdmin('product-changed', { action: 'updated', product: updated });
      emitToAll('product-changed', { action: 'updated', product: updated });
    } catch (e) {}

    return NextResponse.json({ testimonial });
  } catch (err) {
    console.error('PUT /api/testimonials error', err?.message || err);
    if (err?.stack) console.error(err.stack);
    return NextResponse.json({ error: 'Failed to update testimonial' }, { status: 500 });
  }
}

export async function DELETE(req) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const testimonialId = searchParams.get('id');

    let findQuery = { _id: testimonialId, user: session.user.id };
    if (session.user.role === 'admin') findQuery = { _id: testimonialId };

    const testimonial = await Testimonial.findOne(findQuery);
    if (!testimonial) return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });

    const productId = testimonial.product;
    await Testimonial.findByIdAndDelete(testimonialId);
    await updateProductRating(productId);
    try {
      const updated = await Product.findById(productId).lean();
      emitToAdmin('product-changed', { action: 'updated', product: updated });
      emitToAll('product-changed', { action: 'updated', product: updated });
    } catch (e) {}

    return NextResponse.json({ message: 'Testimonial deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/testimonials error', err?.message || err);
    if (err?.stack) console.error(err.stack);
    return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 });
  }
}

export async function PATCH(req) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { testimonialId, adminResponse } = body;
    const testimonial = await Testimonial.findById(testimonialId);
    if (!testimonial) return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });

    testimonial.adminResponse = adminResponse || '';
    await testimonial.save();
    await testimonial.populate('user', 'name email profileImage');
    return NextResponse.json({ testimonial });
  } catch (err) {
    console.error('PATCH /api/testimonials error', err?.message || err);
    if (err?.stack) console.error(err.stack);
    return NextResponse.json({ error: 'Failed to patch testimonial' }, { status: 500 });
  }
}

// Helper to recalc and persist product rating summary
async function updateProductRating(productId) {
  try {
    const testimonials = await Testimonial.find({ product: productId });
    const totalRating = testimonials.reduce((s, t) => s + (t.rating || 0), 0);
    const averageRating = testimonials.length > 0 ? totalRating / testimonials.length : 0;
    const testimonialCount = testimonials.length;

    await Product.findByIdAndUpdate(productId, {
      'ratings.average': Math.round(averageRating * 10) / 10,
      'ratings.count': testimonialCount,
    });
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
}