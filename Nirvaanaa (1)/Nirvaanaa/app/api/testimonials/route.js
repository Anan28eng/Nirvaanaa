import dbConnect from '@/lib/mongodb';
import Testimonial from '@/models/Testimonials';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { emitToAdmin, emitToAll } from '@/lib/socket';

export async function GET(req) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    
    if (productId) {
      // Get reviews for a specific product
      const testimonials = await Testimonial.find({ product: productId })
        .populate('user', 'name email profileImage')
        .sort({ createdAt: -1 });
      
      return new Response(JSON.stringify({ testimonials }), { status: 200 });
    } else {
      // Get all reviews (admin only)
      const session = await getServerSession(authOptions);
      if (!session?.user || session.user.role !== 'admin') {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
      }
      
      const testimonials = await Testimonial.find()
        .populate('product', 'title mainImage')
        .populate('user', 'name email')
        .sort({ createdAt: -1 });
      
      return new Response(JSON.stringify({ testimonials }), { status: 200 });
    }
  } catch (err) {
    console.error('GET /api/testimonials error', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function POST(req) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const body = await req.json();
    const { productId, rating, comment } = body;

    // Check if user already reviewed this product
    const existingTestimonial = await Testimonial.findOne({ 
      user: session.user.id, 
      product: productId 
    });

    if (existingTestimonial) {
      return new Response(JSON.stringify({ error: 'You have already submitted a testimonial for this product' }), { status: 400 });
    }

    // Create new review
    const testimonial = new Testimonial({
      product: productId,
      user: session.user.id,
      rating,
      comment: comment?.trim() || '',
      verified: true // Auto-verify for now
    });

    await testimonial.save();
    await testimonial.populate('user', 'name email profileImage');

    // Update product average rating
    await updateProductRating(productId);
    try {
      const updated = await Product.findById(productId).lean();
      emitToAdmin('product-changed', { action: 'updated', product: updated });
      emitToAll('product-changed', { action: 'updated', product: updated });
    } catch(e) {}

    return new Response(JSON.stringify({ testimonial }), { status: 201 });
  } catch (err) {
    console.error('POST /api/testimonials error', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function PUT(req) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const body = await req.json();
                    const { testimonialId, rating, comment } = body;

    let query = { _id: testimonialId, user: session.user.id };
    // Admin can edit any review
    if (session.user.role === 'admin') {
      query = { _id: testimonialId };
    }
    const testimonial = await Testimonial.findOne(query);

    if (!testimonial) {
      return new Response(JSON.stringify({ error: 'Testimonial not found' }), { status: 404 });
    }

    testimonial.rating = rating;
    testimonial.comment = comment?.trim() || '';
    await testimonial.save();

    // Update product average rating
    await updateProductRating(testimonial.product);
    try {
      const updated = await Product.findById(testimonial.product).lean();
      emitToAdmin('product-changed', { action: 'updated', product: updated });
      emitToAll('product-changed', { action: 'updated', product: updated });
    } catch(e) {}

    return new Response(JSON.stringify({ testimonial }), { status: 200 });
  } catch (err) {
    console.error('PUT /api/testimonials error', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function DELETE(req) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const testimonialId = searchParams.get('id');

    let findQuery = { _id: testimonialId, user: session.user.id };
    if (session.user.role === 'admin') {
      findQuery = { _id: testimonialId };
    }
    const testimonial = await Testimonial.findOne(findQuery);

    if (!testimonial) {
      return new Response(JSON.stringify({ error: 'Testimonial not found' }), { status: 404 });
    }

    const productId = testimonial.product;
    await Testimonial.findByIdAndDelete(testimonialId);

    // Update product average rating
    await updateProductRating(productId);
    try {
      const updated = await Product.findById(productId).lean();
      emitToAdmin('product-changed', { action: 'updated', product: updated });
      emitToAll('product-changed', { action: 'updated', product: updated });
    } catch(e) {}

    return new Response(JSON.stringify({ message: 'Testimonial deleted successfully' }), { status: 200 });
  } catch (err) {
    console.error('DELETE /api/testimonials error', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// Helper function to update product average rating and count on Product.ratings
async function updateProductRating(productId) {
  try {
    const testimonials = await Testimonial.find({ product: productId });
    const totalRating = testimonials.reduce((sum, testimonial) => sum + testimonial.rating, 0);
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

// Admin response to a review
export async function PATCH(req) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    const body = await req.json();
    const { testimonialId, adminResponse } = body;
            const testimonial = await Testimonial.findById(testimonialId);
    if (!testimonial) return new Response(JSON.stringify({ error: 'Testimonial not found' }), { status: 404 });
    testimonial.adminResponse = adminResponse || '';
    await testimonial.save();
    await testimonial.populate('user', 'name email profileImage');
    return new Response(JSON.stringify({ testimonial }), { status: 200 });
    
  } catch (err) {
    console.error('PATCH /api/testimonials error', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }}