import { NextResponse } from 'next/server';
import { sendContactFormToAdmin, sendContactFormConfirmation } from '@/utils/email';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Send email to admin
    await sendContactFormToAdmin({
      name,
      email,
      phone: phone || 'Not provided',
      subject: subject || 'General Inquiry',
      message
    });

    // Send confirmation email to user
    await sendContactFormConfirmation({
      name,
      email,
      subject: subject || 'General Inquiry'
    });

    return NextResponse.json(
      { message: 'Contact form submitted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to submit contact form. Please try again.' },
      { status: 500 }
    );
  }
}
