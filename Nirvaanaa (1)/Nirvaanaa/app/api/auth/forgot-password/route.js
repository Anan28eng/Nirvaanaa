import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import crypto from 'crypto';
import { validateRequest, validationSchemas } from '@/lib/validation';
import { rateLimit } from '@/lib/rateLimit';
import { sendEmail } from '@/utils/email';

export async function POST(req) {
  // Apply rate limiting
  const rateLimitResponse = await rateLimit(req, 'auth');
  if (rateLimitResponse) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  await dbConnect();
  try {
    // Validate request body
    const validation = await validateRequest(req, validationSchemas.forgotPassword);
    if (!validation.success) {
      return NextResponse.json(validation.error, { status: 400 });
    }

    const { email } = validation.data;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json(
        { message: 'If an account exists with this email, a password reset link has been sent.' },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set token and expiry (1 hour)
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    await user.save();

    // Create reset URL
    const base = process.env.NEXT_PUBLIC_API_URL || process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://nirvaanaa.in';
    const resetUrl = `${base}/auth/reset-password?token=${resetToken}`;

    // Send email
    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        html: `
          <h2>Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>You requested to reset your password. Click the link below to reset it:</p>
          <p><a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>Nirvaanaa Team</p>
        `,
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
    }

    return NextResponse.json(
      { message: 'If an account exists with this email, a password reset link has been sent.' },
      { status: 200 }
    );
  } catch (err) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


