'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Star, MessageCircle, ThumbsUp, Edit, Trash2 } from 'lucide-react';
import { useAdminStore } from '@/lib/stores';

export default function ProductTestimonials({ productId, onTestimonialChange }) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  
  // Get store functions for updating product ratings
  const { updateProduct } = useAdminStore();

  // Fetch testimonials
  const { data: testimonialsData, isLoading } = useQuery({
    queryKey: ['testimonials', productId],
    queryFn: async () => {
      const res = await fetch(`/api/testimonials?productId=${productId}`);
      if (!res.ok) throw new Error('Failed to fetch testimonials');
      return res.json();
    },
    enabled: !!productId,
  });

  const testimonials = testimonialsData?.testimonials || [];
        const ratingsCount = testimonials.length;

  // Function to update product ratings in store
  const updateProductRatings = (testimonials) => {
    if (testimonials.length === 0) return;
    
    const averageRating = testimonials.reduce((sum, testimonial) => sum + testimonial.rating, 0) / testimonials.length;
    const ratingsCount = testimonials.length;
    
    updateProduct(productId, {
      ratings: {
        average: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        count: ratingsCount
      }
    });
  };

  // Update product ratings when reviews change
  useEffect(() => {
        if (testimonials.length > 0) {
      updateProductRatings(testimonials);
    }
  }, [testimonials, productId, updateProduct]);

  // Create/Update review mutation
  const testimonialMutation = useMutation({
    mutationFn: async (testimonialData) => {
      const url = editingTestimonial ? '/api/testimonials' : '/api/testimonials';
      const method = editingTestimonial ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...testimonialData,
          ...(editingTestimonial && { testimonialId: editingTestimonial._id })
        }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save testimonial');
      }
      
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['testimonials', productId]);
      if (onTestimonialChange) onTestimonialChange();
      
      // Update product ratings in store
      if (data?.testimonials) {
        updateProductRatings(data.testimonials);
      }
      
      setShowTestimonialForm(false);
      setEditingTestimonial(null);
      setRating(0);
      setComment('');
      toast.success(editingTestimonial ? 'Testimonial updated successfully!' : 'Testimonial submitted successfully!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Delete review mutation
    const deleteTestimonialMutation = useMutation({
    mutationFn: async (testimonialId) => {
      const res = await fetch(`/api/testimonials?id=${testimonialId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete testimonial');
      }
      
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['testimonials', productId]);
      if (onTestimonialChange) onTestimonialChange();
      
      // Update product ratings in store
      if (data?.testimonials) {
        updateProductRatings(data.testimonials);
      }
      
      toast.success('Testimonial deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Admin reply mutation
  const replyMutation = useMutation({
    mutationFn: async ({ testimonialId, adminResponse }) => {
      const res = await fetch('/api/testimonials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testimonialId, adminResponse }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to reply to testimonial');
      }
      return res.json();
    },
    onSuccess: () => {
            queryClient.invalidateQueries(['testimonials', productId]);
      if (onTestimonialChange) onTestimonialChange();
      toast.success('Reply posted');
    },
    onError: (e) => toast.error(e.message),
  });

  // Check if user has already reviewed
  const userTestimonial = testimonials.find(testimonial => testimonial.user._id === session?.user?.id);

  const handleSubmitTestimonial = (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    testimonialMutation.mutate({
      productId,
      rating,
      comment,
    });
  };

  const handleEditTestimonial = (testimonial) => {
        setEditingTestimonial(testimonial);
    setRating(testimonial.rating);
    setComment(testimonial.comment);
    setShowTestimonialForm(true);
  };

  const handleDeleteTestimonial = (testimonialId) => {
    if (confirm('Are you sure you want to delete this testimonial?')) {
      deleteTestimonialMutation.mutate(testimonialId);
    }
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => onRatingChange(star) : undefined}
            className={`${
              interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
            } transition-transform`}
            disabled={!interactive}
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Testimonials Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Customer Testimonials ({ratingsCount})
        </h3>
        
        {session?.user && !userTestimonial && (
          <button
            onClick={() => setShowTestimonialForm(true)}
            className="px-4 py-2 bg-[#bfae9e] text-white rounded-lg hover:bg-[#7c6a58] transition-colors"
          >
            Write a Testimonial
          </button>
        )}
      </div>

      {/* Review Form */}
      {showTestimonialForm && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-800 mb-4">
            {editingTestimonial ? 'Edit Your Testimonial' : 'Write a Testimonial'}
          </h4>
          
          <form onSubmit={handleSubmitTestimonial} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating *
              </label>
              {renderStars(rating, true, setRating)}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Let us know your experience with this product...
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#bfae9e] focus:border-transparent"
                rows="4"
                maxLength="1000"
              />
              <p className="text-xs text-gray-500 mt-1">
                {comment.length}/1000 characters
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={testimonialMutation.isPending}
                className="px-6 py-2 bg-[#bfae9e] text-white rounded-lg hover:bg-[#7c6a58] transition-colors disabled:opacity-50"
              >
                {testimonialMutation.isPending ? 'Saving...' : 'Submit Testimonial'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowTestimonialForm(false);
                  setEditingTestimonial(null);
                  setRating(0);
                  setComment('');
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {testimonials.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No testimonials yet. Be the first to submit a testimonial for this product!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {testimonials.map((testimonial) => (
            <div key={testimonial._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {testimonial.user?.profileImage || testimonial.user?.image ? (
                    <img
                      src={testimonial.user.profileImage || testimonial.user.image}
                      alt={testimonial.user.name || 'User'}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-[#bfae9e] rounded-full flex items-center justify-center text-white font-medium">
                      {testimonial.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-800">
                      {testimonial.user.name || 'Anonymous'}
                    </p>
                    <div className="flex items-center gap-2">
                      {renderStars(testimonial.rating)}
                      <span className="text-sm text-gray-500">
                        {new Date(testimonial.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                {(session?.user?.id === testimonial.user._id || session?.user?.role === 'admin') && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditTestimonial(testimonial)}
                      className="p-1 text-gray-400 hover:text-[#bfae9e] transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTestimonial(testimonial._id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              {testimonial.comment && (
                        <p className="text-gray-700 leading-relaxed">{testimonial.comment}</p>
              )}
              {session?.user?.role === 'admin' && (
                <div className="mt-3">
                  <form onSubmit={(e)=>{ e.preventDefault(); const input = e.currentTarget.elements.namedItem('adminResponse'); replyMutation.mutate({ testimonialId: testimonial._id, adminResponse: input.value }); input.value=''; }}>
                    <input name="adminResponse" placeholder="Reply to testimonial" className="w-full px-3 py-2 border rounded" />
                    <button className="mt-2 px-3 py-1 bg-[#bfae9e] text-white rounded">Reply</button>
                  </form>
                </div>
              )}
              
              {testimonial.verified && (
                <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
                  <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  Verified Purchase
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
