/**
 * CORS Configuration for API routes
 * This should be used in API route handlers to set CORS headers
 */

export const corsConfig = {
  origin: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://mydomain.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

/**
 * Set CORS headers in API route response
 * @param {Response} response - Next.js Response object
 * @param {string} origin - Allowed origin (optional, uses corsConfig.origin if not provided)
 */
export function setCorsHeaders(response, origin = null) {
  const allowedOrigin = origin || corsConfig.origin;
  
  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', corsConfig.methods.join(', '));
  response.headers.set('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '));
  
  return response;
}

/**
 * Handle CORS preflight requests
 * @param {Request} request - Next.js Request object
 * @returns {Response|null} - Response for OPTIONS request, or null if not a preflight
 */
export function handleCorsPreflight(request) {
  if (request.method === 'OPTIONS') {
    const response = new Response(null, { status: 204 });
    setCorsHeaders(response);
    return response;
  }
  return null;
}

