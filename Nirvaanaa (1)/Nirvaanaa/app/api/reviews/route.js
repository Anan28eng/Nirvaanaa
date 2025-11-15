import dbConnect from '@/lib/mongodb';
import Review from '@/models/Review';
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
      const reviews = await Review.find({ product: productId })
        .populate('user', 'name email profileImage')
        .sort({ createdAt: -1 });
      
      return new Response(JSON.stringify({ reviews }), { status: 200 });
    } else {
      // Get all reviews (admin only)
      const session = await getServerSession(authOptions);
      if (!session?.user || session.user.role !== 'admin') {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
      }
      
      const reviews = await Review.find()
        .populate('product', 'title mainImage')
        .populate('user', 'name email')
        .sort({ createdAt: -1 });
      
      return new Response(JSON.stringify({ reviews }), { status: 200 });
    }
  } catch (err) {
    console.error('GET /api/reviews error', err);
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
    const existingReview = await Review.findOne({ 
      user: session.user.id, 
      product: productId 
    });

    if (existingReview) {
      return new Response(JSON.stringify({ error: 'You have already reviewed this product' }), { status: 400 });
    }

    // Create new review
    const review = new Review({
      product: productId,
      user: session.user.id,
      rating,
      comment: comment?.trim() || '',
      verified: true // Auto-verify for now
    });

    await review.save();
    await review.populate('user', 'name email profileImage');

    // Update product average rating
    await updateProductRating(productId);
    try {
      const updated = await Product.findById(productId).lean();
      emitToAdmin('product-changed', { action: 'updated', product: updated });
      emitToAll('product-changed', { action: 'updated', product: updated });
    } catch(e) {}

    return new Response(JSON.stringify({ review }), { status: 201 });
  } catch (err) {
    console.error('POST /api/reviews error', err);
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
    const { reviewId, rating, comment } = body;

    let query = { _id: reviewId, user: session.user.id };
    // Admin can edit any review
    if (session.user.role === 'admin') {
      query = { _id: reviewId };
    }
    const review = await Review.findOne(query);

    if (!review) {
      return new Response(JSON.stringify({ error: 'Review not found' }), { status: 404 });
    }

    review.rating = rating;
    review.comment = comment?.trim() || '';
    await review.save();

    // Update product average rating
    await updateProductRating(review.product);
    try {
      const updated = await Product.findById(review.product).lean();
      emitToAdmin('product-changed', { action: 'updated', product: updated });
      emitToAll('product-changed', { action: 'updated', product: updated });
    } catch(e) {}

    return new Response(JSON.stringify({ review }), { status: 200 });
  } catch (err) {
    console.error('PUT /api/reviews error', err);
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
    const reviewId = searchParams.get('id');

    let findQuery = { _id: reviewId, user: session.user.id };
    if (session.user.role === 'admin') {
      findQuery = { _id: reviewId };
    }
    const review = await Review.findOne(findQuery);

    if (!review) {
      return new Response(JSON.stringify({ error: 'Review not found' }), { status: 404 });
    }

    const productId = review.product;
    await Review.findByIdAndDelete(reviewId);

    // Update product average rating
    await updateProductRating(productId);
    try {
      const updated = await Product.findById(productId).lean();
      emitToAdmin('product-changed', { action: 'updated', product: updated });
      emitToAll('product-changed', { action: 'updated', product: updated });
    } catch(e) {}

    return new Response(JSON.stringify({ message: 'Review deleted successfully' }), { status: 200 });
  } catch (err) {
    console.error('DELETE /api/reviews error', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// Helper function to update product average rating and count on Product.ratings
async function updateProductRating(productId) {
  try {
    const reviews = await Review.find({ product: productId });
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    const reviewCount = reviews.length;

    await Product.findByIdAndUpdate(productId, {
      'ratings.average': Math.round(averageRating * 10) / 10,
      'ratings.count': reviewCount,
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
    const { reviewId, adminResponse } = body;
    const review = await Review.findById(reviewId);
    if (!review) return new Response(JSON.stringify({ error: 'Review not found' }), { status: 404 });
    review.adminResponse = adminResponse || '';
    await review.save();
    await review.populate('user', 'name email profileImage');
    return new Response(JSON.stringify({ review }), { status: 200 });
  } catch (err) {
    console.error('PATCH /api/reviews error', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
