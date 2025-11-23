import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import { rateLimit } from '@/lib/rateLimit';

/**
 * Verify Razorpay payment signature
 */
function verifyPaymentSignature(orderId, paymentId, signature, secret) {
  const text = `${orderId}|${paymentId}`;
  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(text)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(generatedSignature)
  );
}

export async function POST(request) {
  // Apply rate limiting
  const rateLimitResponse = await rateLimit(request, 'payment');
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment verification data' },
        { status: 400 }
      );
    }

    // Guard against missing keys
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: 'Razorpay is not configured. Payments are disabled in this environment.' },
        { status: 503 }
      );
    }

    // Verify payment signature
    const isValidSignature = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      process.env.RAZORPAY_KEY_SECRET
    );

    if (!isValidSignature) {
      return NextResponse.json(
        { error: 'Invalid payment signature', success: false },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find order
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found', success: false },
        { status: 404 }
      );
    }

    // Initialize Razorpay client only when keys exist
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Verify payment with Razorpay API
    try {
      const payment = await razorpay.payments.fetch(razorpay_payment_id);

      if (payment.status === 'captured' && payment.order_id === razorpay_order_id) {
        if (order.paymentStatus !== 'paid') {
          order.paymentStatus = 'paid';
          order.status = 'processing';
          order.razorpayPaymentId = razorpay_payment_id;
          order.razorpayOrderId = razorpay_order_id;

          if (order.addTimelineEntry) {
            order.addTimelineEntry(
              'processing',
              'Payment verified and order is being processed',
              null
            );
          }

          await order.save();
        }

        return NextResponse.json({
          success: true,
          message: 'Payment verified successfully',
          orderId: order._id.toString(),
          paymentId: razorpay_payment_id,
        });
      } else {
        return NextResponse.json(
          { error: 'Payment not captured', success: false },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('Razorpay payment fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to verify payment with Razorpay', success: false },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Payment verification failed', success: false },
      { status: 500 }
    );
  }
}


