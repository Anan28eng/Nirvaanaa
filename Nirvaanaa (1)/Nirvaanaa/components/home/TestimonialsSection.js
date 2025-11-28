'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const STREAM_ENDPOINT = '/api/testimonials/stream';
const FETCH_ENDPOINT = '/api/testimonials/featured';
const POLL_INTERVAL = 20000;
const MAX_TESTIMONIALS = 8;

// ---------- UTIL ----------
const formatStats = (incoming = {}) => ({
  averageRating: incoming?.averageRating ? incoming.averageRating.toString() : null,
  totalCustomers: incoming?.totalCustomers ? incoming.totalCustomers.toString() : null,
  satisfactionRate: incoming?.satisfactionRate || null,
  customerSupport: incoming?.customerSupport || null,
});

// ---------- STAR RATING ----------
const StarRating = ({ rating = 5 }) => (
  <div className="flex gap-1">
    {Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-nirvaanaa-soft-gold fill-current' : 'text-gray-300'}`}
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

// ---------- TESTIMONIAL CARD ----------
const TestimonialCard = ({ testimonial, isActive }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: isActive ? 1 : 0.75, scale: isActive ? 1 : 0.97 }}
    transition={{ duration: 0.5 }}
    className={`relative rounded-[28px] p-8 bg-white/90 backdrop-blur-xl 
    border border-white/50 transition-all 
    ${isActive ? 'shadow-nirvaanaa-glow' : 'shadow-nirvaanaa'}
    max-w-xl mx-auto`}
  >
    <div className="absolute -top-5 left-10 text-nirvaanaa-soft-gold">
      <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
      </svg>
    </div>

    <div className="mb-4">
      <StarRating rating={testimonial.rating} />
    </div>

    <blockquote className="text-lg text-gray-700 leading-relaxed mb-6 italic text-center">
      “{testimonial.text}”
    </blockquote>

    <div className="flex items-center gap-4 justify-center">
      <div className="relative w-14 h-14 rounded-full overflow-hidden bg-nirvaanaa-primary-light border border-nirvaanaa-primary text-nirvaanaa-secondary font-semibold uppercase flex items-center justify-center">
        {testimonial.image ? (
          <Image src={testimonial.image} alt={testimonial.name} fill className="object-cover" sizes="56px" />
        ) : (
          testimonial.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
        )}
      </div>
      <div className="text-left">
        <div className="font-semibold text-nirvaanaa-secondary">{testimonial.name}</div>
        <div className="text-sm text-gray-600">{testimonial.role}</div>
        <div className="text-xs text-gray-500">{testimonial.location}</div>
      </div>
    </div>

    <div className="absolute inset-x-10 bottom-4 h-px bg-gradient-to-r from-transparent via-nirvaanaa-primary/40 to-transparent" />
  </motion.div>
);

// ---------- MAIN SECTION ----------
const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [testimonials, setTestimonials] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef(null);

  // merge incoming
  const mergeTestimonials = useCallback((incoming = []) => {
    if (!incoming.length) return;
    setTestimonials((prev) => {
      const map = new Map();
      [...incoming, ...prev].forEach((item) => {
        if (!item) return;
        const key = item._id || item.id || `${item.name}-${item.text?.slice(0, 24)}`;
        if (!map.has(key)) map.set(key, item);
      });
      return Array.from(map.values()).slice(0, MAX_TESTIMONIALS);
    });
  }, []);

  // fetch initial
  const fetchFeaturedTestimonials = useCallback(async () => {
    try {
      const response = await fetch(FETCH_ENDPOINT);
      if (!response.ok) throw new Error('Failed to fetch testimonials');

      const data = await response.json();
      if (Array.isArray(data.testimonials) && data.testimonials.length > 0)
        mergeTestimonials(data.testimonials);

      setStats(data.stats ? formatStats(data.stats) : null);
    } catch (error) {
      console.error('Failed to fetch featured testimonials:', error);
    } finally {
      setLoading(false);
    }
  }, [mergeTestimonials]);

  useEffect(() => {
    fetchFeaturedTestimonials();
  }, [fetchFeaturedTestimonials]);

  // Streaming + fallback polling
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let eventSource;

    const startPolling = () => {
      if (pollRef.current) return;
      pollRef.current = window.setInterval(fetchFeaturedTestimonials, POLL_INTERVAL);
    };

    try {
      eventSource = new EventSource(STREAM_ENDPOINT);

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data || '{}');
          if (payload.testimonial) mergeTestimonials([payload.testimonial]);
          if (Array.isArray(payload.testimonials)) mergeTestimonials(payload.testimonials);
          if (payload.stats) setStats(formatStats(payload.stats));
        } catch (err) {
          console.error('Failed to parse testimonial stream payload', err);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        startPolling();
      };
    } catch {
      startPolling();
    }

    return () => {
      eventSource?.close();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchFeaturedTestimonials, mergeTestimonials]);

  // Auto-advance slider
  useEffect(() => {
    if (!testimonials.length) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const goToPrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section className="page-gradient py-20 px-4 flex justify-center">
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center">

        {/* HEADING */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 space-y-4 max-w-2xl"
        >
          <h2 className="text-3xl sm:text-4xl font-playfair font-bold text-nirvaanaa-secondary">
            What Our Customers Say
          </h2>
          <p className="text-gray-700 text-lg">
            Real stories from real customers. Live updates appear automatically.
          </p>
        </motion.div>

        {/* TESTIMONIAL DISPLAY */}
        <div className="relative w-full flex flex-col items-center">

          {loading ? (
            <div className="relative h-96 flex items-center justify-center w-full">
              <div className="surface-panel w-full max-w-xl p-8 animate-pulse space-y-4 text-left mx-auto">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
                <div className="flex items-center gap-3 pt-6">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              </div>
            </div>
          ) : testimonials.length > 0 ? (
            <>
              {/* CARD AREA */}
              <div className="relative h-96 w-full flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: direction * 80 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -direction * 80 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <TestimonialCard testimonial={testimonials[currentIndex]} isActive />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* ARROWS + DOTS */}
              <div className="flex justify-center items-center gap-6 mt-8">

                {/* LEFT ARROW */}
                <button
                  onClick={goToPrevious}
                  className="w-12 h-12 rounded-full bg-white/80 border border-white/60 text-nirvaanaa-secondary shadow-soft hover:bg-nirvaanaa-primary-light transition-all flex items-center justify-center"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* DOTS */}
                <div className="flex gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setDirection(index > currentIndex ? 1 : -1);
                        setCurrentIndex(index);
                      }}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentIndex
                          ? 'bg-nirvaanaa-secondary scale-125'
                          : 'bg-white/70 hover:bg-white'
                      }`}
                    />
                  ))}
                </div>

                {/* RIGHT ARROW */}
                <button
                  onClick={goToNext}
                  className="w-12 h-12 rounded-full bg-white/80 border border-white/60 text-nirvaanaa-secondary shadow-soft hover:bg-nirvaanaa-primary-light transition-all flex items-center justify-center"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <div className="surface-panel p-10 text-center text-gray-600 rounded-2xl max-w-md mx-auto">
              <p className="text-lg font-semibold mb-2">Be the first to share your experience!</p>
              <p className="text-sm">Your testimonial will help others discover Nirvaanaa.</p>
            </div>
          )}
        </div>

        {/* STATS BLOCK */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 pb-10 w-full  flex flex-col items-center text-center"
        >
          {stats && Object.values(stats).some(Boolean) ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 place-items-center text-center">

              {[
                { number: stats.averageRating, label: 'Average Rating' },
                { number: stats.totalCustomers, label: 'Happy Customers' },
                { number: stats.satisfactionRate, label: 'Satisfaction Rate' },
                { number: stats.customerSupport, label: 'Customer Support' },
              ]
                .filter((stat) => stat.number)
                .map((stat) => (
                  <div
                    key={stat.label}
                    className="surface-panel text-center py-6 rounded-xl"
                  >
                    <div className="text-3xl font-bold text-nirvaanaa-secondary mb-2">
                      {stat.number}
                    </div>
                    <div className="text-xs uppercase tracking-[0.3em] text-nirvaanaa-secondary/70">
                      {stat.label}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="surface-panel text-center py-6 rounded-xl max-w-md">
              <p className="text-sm text-gray-600">
                Stats will appear here once customers begin sharing feedback.
              </p>
            </div>
          )}
        </motion.div>

      </div>
    </section>
  );
};

export default TestimonialsSection;

