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
    .limit(10);

    // Transform testimonials to match the expected format for TestimonialsSection
    const transformedTestimonials = featuredTestimonials.map(testimonial => ({
      id: testimonial._id,
      name: testimonial.user.name || 'Anonymous',
      role: 'Customer', // Default role since we don't store user roles
      image: testimonial.user.profileImage || '/images/default-avatar.jpg',
      rating: testimonial.rating,
      text: testimonial.comment,
      location: 'India', // Default location since we don't store user location
      product: {
        title: testimonial.product.title,
        category: testimonial.product.category
      },
      createdAt: testimonial.createdAt,
      verified: testimonial.verified
    }));

    // Calculate stats
    const totalTestimonials = await Testimonial.countDocuments({ verified: true });
    const averageRating = await Testimonial.aggregate([
      { $match: { verified: true } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    const stats = {
      averageRating: averageRating[0]?.avgRating ? Math.round(averageRating[0].avgRating * 10) / 10 : 4.9,
      totalCustomers: totalTestimonials,
      satisfactionRate: '98%', // Could be calculated based on 4+ star ratings
      customerSupport: '24/7'
    };

    return Response.json({ 
      testimonials: transformedTestimonials,
      stats 
    });
  } catch (error) {
    console.error('Featured testimonials API error:', error);
    return Response.json(
      { error: 'Failed to fetch featured testimonials' },
      { status: 500 }
    );
  }
}
