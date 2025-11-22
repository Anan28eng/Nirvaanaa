import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { validateRequest, validationSchemas } from '@/lib/validation';
import { rateLimit } from '@/lib/rateLimit';
import { NextResponse } from 'next/server';

export async function POST(req) {
  // Apply rate limiting
  const rateLimitResponse = await rateLimit(req, 'auth');
  if (rateLimitResponse) {
    return rateLimitResponse; // must already be a valid Response
  }

  await dbConnect();
  try {
    // Validate request body
    const validation = await validateRequest(req, validationSchemas.signup);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { name, email, password } = validation.data;

    // Check if user already exists
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const hash = await bcrypt.hash(password, 12);

    // Create new user
    const user = new User({
      name,
      email: email.toLowerCase(),
      passwordHash: hash,
      emailVerified: false,
    });
    await user.save();

    return NextResponse.json(
      {
        ok: true,
        user: user.getPublicProfile
          ? user.getPublicProfile()
          : {
              id: user._id,
              email: user.email,
              name: user.name,
            },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Signup error', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


