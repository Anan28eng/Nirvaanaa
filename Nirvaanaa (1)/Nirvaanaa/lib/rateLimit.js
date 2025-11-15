import { RateLimiterMemory } from 'rate-limiter-flexible';
import { NextResponse } from 'next/server';

// Create rate limiters for different endpoints
const rateLimiters = {
  // Auth endpoints: 5 requests per 15 minutes per IP
  auth: new RateLimiterMemory({
    points: 5,
    duration: 15 * 60, // 15 minutes
  }),
  // API endpoints: 100 requests per 15 minutes per IP
  api: new RateLimiterMemory({
    points: 100,
    duration: 15 * 60, // 15 minutes
  }),
  // Payment endpoints: 10 requests per 15 minutes per IP
  payment: new RateLimiterMemory({
    points: 10,
    duration: 15 * 60, // 15 minutes
  }),
  // Admin endpoints: 30 requests per 15 minutes per IP
  admin: new RateLimiterMemory({
    points: 30,
    duration: 15 * 60, // 15 minutes
  }),
};

/**
 * Rate limiting middleware for Next.js API routes
 * @param {Request} request - The incoming request
 * @param {string} type - Type of rate limiter ('auth', 'api', 'payment', 'admin')
 * @returns {Promise<NextResponse|null>} - Returns error response if rate limited, null otherwise
 */
export async function rateLimit(request, type = 'api') {
  try {
    const limiter = rateLimiters[type] || rateLimiters.api;
    
    // Get client IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    // Apply rate limit
    await limiter.consume(ip);
    
    return null; // No rate limit exceeded
  } catch (error) {
    // Rate limit exceeded
    return NextResponse.json(
      { 
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(error.msBeforeNext / 1000) || 60
      },
      { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil(error.msBeforeNext / 1000) || 60,
          'X-RateLimit-Limit': error.totalHits || 100,
          'X-RateLimit-Remaining': 0,
        }
      }
    );
  }
}

/**
 * Wrapper function to apply rate limiting to API route handlers
 */
export function withRateLimit(handler, type = 'api') {
  return async (request, context) => {
    const rateLimitResponse = await rateLimit(request, type);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    return handler(request, context);
  };
}

