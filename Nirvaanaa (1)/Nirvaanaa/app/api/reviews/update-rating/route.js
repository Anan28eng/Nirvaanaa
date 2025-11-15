import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Review from '@/models/Review';
import Product from '@/models/Product';

export async function POST(request) {
  try {
    await dbConnect();
    const review = await request.json();

    // Save the review
    const newReview = await Review.create(review);

    // Update product rating
    const reviews = await Review.find({ productId: review.productId });
    const totalRating = reviews.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = totalRating / reviews.length;

    await Product.findByIdAndUpdate(review.productId, {
      ratings: {
        average: averageRating,
        count: reviews.length
      }
    });

    return NextResponse.json({ 
      success: true, 
      review: newReview,
      newRating: {
        average: averageRating,
        count: reviews.length
      }
    });
  } catch (error) {
    console.error('Error updating rating:', error);
    return NextResponse.json({ error: 'Failed to update rating' }, { status: 500 });
  }
}
