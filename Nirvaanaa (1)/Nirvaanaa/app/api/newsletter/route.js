import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';
import { sendContactFormConfirmation } from '@/utils/email';
import { emitToAdmin } from '@/lib/socket';

export async function POST(request) {
  try {
    await dbConnect();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check for valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if already subscribed
    const existing = await Newsletter.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: 'Email already subscribed' },
        { status: 400 }
      );
    }

    // Create new subscription
    const subscription = await Newsletter.create({
      email,
      subscribedAt: new Date(),
      status: 'active'
    });

    // Send welcome email to subscriber (confirmation)
    try {
      await sendContactFormConfirmation({ name: email.split('@')[0], email });
    } catch (e) {
      console.error('Failed to send welcome email to subscriber:', e);
    }

    // Notify admins of new subscriber
    try { emitToAdmin('customer-changed', { action: 'created', customer: { email, subscribedAt: subscription.subscribedAt } }); } catch(e) {}

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter'
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe to newsletter' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

  await dbConnect();
  const subscription = await Newsletter.findOne({ email });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

  await subscription.deleteOne();
  try { emitToAdmin('customer-changed', { action: 'deleted', customer: { email } }); } catch(e) {}

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe from newsletter' },
      { status: 500 }
    );
  }
}
