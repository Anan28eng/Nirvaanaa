import { z } from 'zod';

/**
 * Sanitize string input to prevent regex injection
 */
export function sanitizeRegexInput(input) {
  if (typeof input !== 'string') return '';
  // Escape special regex characters
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Base validation schemas (defined first to avoid circular references)
 */
const baseSchemas = {
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(50, 'Name too long').trim(),
  search: z.string().max(100, 'Search query too long').optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  objectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
};

/**
 * Common validation schemas
 */
export const validationSchemas = {
  ...baseSchemas,
  
  // Signup schema
  signup: z.object({
    name: baseSchemas.name,
    email: baseSchemas.email,
    password: baseSchemas.password,
  }),
  
  // Login schema
  login: z.object({
    email: baseSchemas.email,
    password: z.string().min(1, 'Password is required'),
  }),
  
  // Forgot password schema
  forgotPassword: z.object({
    email: baseSchemas.email,
  }),
  
  // Reset password schema
  resetPassword: z.object({
    token: z.string().min(1, 'Token is required'),
    password: baseSchemas.password,
  }),
  
  // Product query schema
  productQuery: z.object({
    page: baseSchemas.page,
    limit: baseSchemas.limit,
    category: z.string().max(50).optional(),
    search: baseSchemas.search,
    sort: z.enum(['createdAt', 'price', 'title', 'salesCount']).default('createdAt'),
    order: z.enum(['asc', 'desc']).default('desc'),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    tags: z.string().optional(),
    featured: z.enum(['true', 'false']).optional(),
    inStock: z.enum(['true', 'false']).optional(),
  }),
  
  // User query schema
  userQuery: z.object({
    page: baseSchemas.page,
    limit: baseSchemas.limit,
    search: baseSchemas.search,
    role: z.enum(['user', 'admin']).optional(),
    sort: z.string().max(50).default('createdAt'),
    order: z.enum(['asc', 'desc']).default('desc'),
  }),
};

/**
 * Validate request body with Zod schema
 */
export async function validateRequest(request, schema) {
  try {
    const body = await request.json();
    const validated = schema.parse(body);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: { message: 'Validation failed', details: error.errors },
      };
    }
    return {
      success: false,
      error: { message: 'Invalid request body' },
    };
  }
}

/**
 * Validate query parameters with Zod schema
 */
export function validateQuery(request, schema) {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    const validated = schema.parse(query);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: { message: 'Invalid query parameters', details: error.errors },
      };
    }
    return {
      success: false,
      error: { message: 'Invalid query parameters' },
    };
  }
}


