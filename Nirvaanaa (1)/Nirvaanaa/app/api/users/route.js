import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { emitToAdmin, emitToAll } from '@/lib/socket';
import { rateLimit } from '@/lib/rateLimit';
import { validateQuery, validateRequest, validationSchemas } from '@/lib/validation';
import { z } from 'zod';

export async function GET(request) {
  // Apply rate limiting
  const rateLimitResponse = await rateLimit(request, 'admin');
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Validate query parameters
    const validation = validateQuery(request, validationSchemas.userQuery);
    if (!validation.success) {
      return validation.error;
    }

    const { page, limit, search, role, sort, order } = validation.data;

    // Build query
    const query = {};

    if (search) {
      // Sanitize search input to prevent regex injection
      const sanitizedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: sanitizedSearch, $options: 'i' } },
        { email: { $regex: sanitizedSearch, $options: 'i' } },
      ];
    }

    if (role) {
      query.role = role;
    }

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-passwordHash')
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error('Users API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  // Apply rate limiting
  const rateLimitResponse = await rateLimit(request, 'admin');
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    // Validate request body
    const validation = await validateRequest(request, validationSchemas.signup.extend({
      role: z.enum(['user', 'admin']).default('user'),
    }));
    if (!validation.success) {
      return validation.error;
    }

    const { name, email, password, role = 'user' } = validation.data;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    const user = new User({
      name,
      email,
      password, // This will be hashed by the pre-save middleware
      role,
    });

    await user.save();

    // Emit real-time update to trigger KPI refresh
    try {
      emitToAdmin('customer-changed', { 
        action: 'created', 
        customer: user.toObject() 
      });
      emitToAll('customer-changed', { 
        action: 'created', 
        customer: user.toObject() 
      });
    } catch (e) {
      // ignore emit errors
    }

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    return NextResponse.json(userResponse, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
