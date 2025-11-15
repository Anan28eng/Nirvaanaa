'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// Fallback testimonials in case API fails
const fallbackTestimonials = [
  {
    id: 1,
    name: 'Priya Sharma',
    role: 'Fashion Designer',
    image: '/images/testimonials/priya.jpg',
    rating: 5,
    text: 'The quality of embroidery on my handbag is absolutely stunning! Every stitch is perfect and the attention to detail is remarkable. I receive compliments every time I use it.',
    location: 'Mumbai, India'
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    role: 'Interior Designer',
    image: '/images/testimonials/sarah.jpg',
    rating: 5,
    text: 'I ordered a clutch for my sister\'s wedding and it was beyond beautiful. The craftsmanship is exceptional and the delivery was perfect. Highly recommend!',
    location: 'New York, USA'
  },
  {
    id: 3,
    name: 'Aisha Patel',
    role: 'Teacher',
    image: '/images/testimonials/aisha.jpg',
    rating: 5,
    text: 'My wallet from Nirvaanaa is not just functional but a work of art. The embroidery is so intricate and the colors are vibrant. It makes me smile every time I use it.',
    location: 'Delhi, India'
  }
];

const StarRating = ({ rating }) => {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-5 h-5 ${i < rating ? 'text-brand-gold fill-current' : 'text-gray-300'}`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

const TestimonialCard = ({ testimonial, isActive }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: isActive ? 1 : 0.7, scale: isActive ? 1 : 0.95 }}
      transition={{ duration: 0.5 }}
      className={`relative bg-white rounded-2xl p-8 shadow-lg transition-all duration-300 ${
        isActive ? 'shadow-xl scale-105' : 'shadow-md'
      }`}
    >
      {/* Quote Icon */}
      <div className="absolute -top-4 left-8 text-brand-gold">
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
      </div>

      {/* Rating */}
      <div className="mb-4">
        <StarRating rating={testimonial.rating} />
      </div>

      {/* Testimonial Text */}
      <blockquote className="text-brand-brown text-lg leading-relaxed mb-6 italic">
        "{testimonial.text}"
      </blockquote>

      {/* Author Info */}
      <div className="flex items-center gap-4">
        <div className="relative w-12 h-12 rounded-full overflow-hidden">
          <Image
            src={testimonial.image}
            alt={testimonial.name}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <div className="font-semibold text-brand-brown">{testimonial.name}</div>
          <div className="text-sm text-brand-brown">{testimonial.role}</div>
          <div className="text-xs text-gray-500">{testimonial.location}</div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-4 right-4 w-16 h-16 bg-brand-gold rounded-full opacity-30" />
    </motion.div>
  );
};

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [testimonials, setTestimonials] = useState(fallbackTestimonials);
  const [stats, setStats] = useState({
    averageRating: '4.9',
    totalCustomers: '500+',
    satisfactionRate: '98%',
    customerSupport: '24/7'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedTestimonials = async () => {
      try {
        const response = await fetch('/api/testimonials/featured');
        const data = await response.json();
        
        if (response.ok && data.testimonials && data.testimonials.length > 0) {
          setTestimonials(data.testimonials);
          setStats({
            averageRating: data.stats.averageRating.toString(),
            totalCustomers: data.stats.totalCustomers.toString(),
            satisfactionRate: data.stats.satisfactionRate,
            customerSupport: data.stats.customerSupport
          });
        }
      } catch (error) {
        console.error('Failed to fetch featured testimonials:', error);
        // Use fallback testimonials
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedTestimonials();
  }, []);

  useEffect(() => {
    if (testimonials.length > 0) {
      const timer = setInterval(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [testimonials.length]);

  const goToSlide = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section className=" bg-gradient-to-br mt-0 from-brand-cream to-brand-beige">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl pt-20 font-playfair font-bold text-brand-brown mb-4">
            What Our Customers Say
          </h2>
          <p className="text-brand-brown max-w-2xl mx-auto text-lg">
            Don't just take our word for it. Here's what our valued customers have to say about their Nirvaanaa experience.
          </p>
        </motion.div>

        {/* Testimonials Carousel */}
        <div className="relative max-w-4xl mx-auto">
          {loading ? (
            <div className="relative h-96 flex items-center justify-center">
              <div className="animate-pulse">
                <div className="bg-white rounded-2xl p-8 shadow-lg w-full max-w-2xl">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 mb-6"></div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : testimonials.length > 0 ? (
            <>
              {/* Main Testimonial */}
              <div className="relative h-96 ">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: direction * 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -direction * 100 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                  >
                    <TestimonialCard 
                      testimonial={testimonials[currentIndex]} 
                      isActive={true}
                      className='h-[100px] '
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center items-center gap-4 mb-4">
            <button
              onClick={goToPrevious}
              className="w-12 h-12 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow flex items-center justify-center text-brand-brown hover:text-brand-gold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-brand-gold scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={goToNext}
              className="w-12 h-12 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow flex items-center justify-center text-brand-brown hover:text-brand-gold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

              {/* Side Testimonials (Desktop) */}
              <div className="hidden lg:flex gap-4 justify-center">
                {testimonials.map((testimonial, index) => {
                  if (index === currentIndex) return null;
                  return (
                    <motion.div
                      key={testimonial.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="w-80"
                    >
                      <TestimonialCard 
                        testimonial={testimonial} 
                        isActive={false}
                        
                      />
                    </motion.div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="relative h-96 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <p className="text-lg mb-2">No testimonials available yet</p>
                <p className="text-sm">Be the first to share your experience!</p>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 pb-16 grid grid-cols-2 md:grid-cols-4 gap-8 "
        >
          {[
            { number: stats.averageRating, label: 'Average Rating' },
            { number: stats.totalCustomers, label: 'Happy Customers' },
            { number: stats.satisfactionRate, label: 'Satisfaction Rate' },
            { number: stats.customerSupport, label: 'Customer Support' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-brand-gold mb-2">
                {stat.number}
              </div>
              <div className="text-sm text-brand-brown font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
