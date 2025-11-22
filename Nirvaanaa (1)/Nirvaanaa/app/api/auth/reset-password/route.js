import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { validateRequest, validationSchemas } from '@/lib/validation';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(req) {
  // Apply rate limiting
  const rateLimitResponse = await rateLimit(req, 'auth');
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  await dbConnect();
  try {
    // Validate request body
    const validation = await validateRequest(req, validationSchemas.resetPassword);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { token, password } = validation.data;

    // Hash the token to compare with stored hash
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Hash new password
    const hash = await bcrypt.hash(password, 12);

    // Update user password and clear reset token
    user.passwordHash = hash;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return NextResponse.json(
      { message: 'Password has been reset successfully' },
      { status: 200 }
    );
  } catch (err) {
    console.error('Reset password error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

