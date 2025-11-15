import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import Product from '@/models/Product';
import { sendOrderConfirmation } from '@/utils/email';
import { generateHtmlInvoice } from '@/utils/invoice';
import { sendOrderConfirmationSMS, formatPhoneNumber } from '@/utils/sms';
import { emitToAdmin } from '@/lib/socket';

const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

/**
 * Verify Razorpay webhook signature
 */
function verifyWebhookSignature(body, signature) {
  if (!webhookSecret) {
    console.warn('RAZORPAY_WEBHOOK_SECRET not configured, skipping signature verification');
    return true; // Allow in development, but warn
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function POST(request) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature found' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature)) {
      console.error('Razorpay webhook signature verification failed');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);

    await dbConnect();

    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;

      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;

      case 'order.paid':
        await handleOrderPaid(event.payload.order.entity);
        break;

      case 'refund.created':
        await handleRefundCreated(event.payload.refund.entity);
        break;

      default:
        console.log(`Unhandled Razorpay event type: ${event.event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentCaptured(payment) {
  try {
    const orderId = payment.notes?.orderId;
    if (!orderId) {
      console.error('No order ID in payment notes');
      return;
    }

    const order = await Order.findById(orderId).populate('userId');
    if (!order) {
      console.error('Order not found:', orderId);
      return;
    }

    // Only process if payment hasn't been marked as paid yet
    if (order.paymentStatus !== 'paid') {
      order.paymentStatus = 'paid';
      order.status = 'processing';
      order.razorpayPaymentId = payment.id;
      order.razorpayOrderId = payment.order_id;
      
      // Add timeline entry
      if (order.addTimelineEntry) {
        order.addTimelineEntry(
          'processing',
          'Payment received and order is being processed',
          null
        );
      }

      await order.save();

      // Update product stock
      for (const item of order.items) {
        try {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: -item.quantity, salesCount: item.quantity }
          });
        } catch (err) {
          console.error('Failed to update stock for product:', item.productId, err);
        }
      }

      // Emit analytics update to admin
      try {
        emitToAdmin('analytics-updated', { analytics: {} });
        emitToAdmin('order-changed', { action: 'created', order: order.toObject() });
      } catch(e) {
        console.error('Failed to emit admin events:', e);
      }

      // Send confirmation emails and SMS
      try {
        if (order.userId) {
          await sendOrderConfirmation(order, order.userId);
          if (order.emailSent) {
            order.emailSent.confirmation = true;
          }
          
          if (order.shippingAddress?.phone) {
            const formattedPhone = formatPhoneNumber(order.shippingAddress.phone);
            await sendOrderConfirmationSMS(order, formattedPhone);
            if (order.smsSent) {
              order.smsSent.confirmation = true;
            }
          }
          
          await order.save();
        }
      } catch (error) {
        console.error('Failed to send notifications:', error);
      }

      // Generate invoice HTML
      try {
        const htmlInvoice = generateHtmlInvoice(order, order.userId, order.shippingMethod);
        console.log('Invoice generated successfully for order:', order.orderNumber);
      } catch (e) {
        console.error('Invoice generation failed (non-blocking):', e);
      }

      console.log(`Order ${orderId} payment completed successfully`);
    }
  } catch (error) {
    console.error('Error handling payment captured:', error);
  }
}

async function handlePaymentFailed(payment) {
  try {
    const orderId = payment.notes?.orderId;
    if (!orderId) {
      console.error('No order ID in payment notes');
      return;
    }

    const order = await Order.findById(orderId);
    if (!order) {
      console.error('Order not found:', orderId);
      return;
    }

    order.paymentStatus = 'failed';
    order.status = 'cancelled';
    order.razorpayPaymentId = payment.id;
    
    if (order.addTimelineEntry) {
      order.addTimelineEntry(
        'cancelled',
        `Payment failed: ${payment.error_description || 'Unknown error'}`,
        null
      );
    }
    
    await order.save();
    
    try {
      emitToAdmin('order-changed', { action: 'updated', order: order.toObject() });
    } catch(e) {
      console.error('Failed to emit admin event:', e);
    }

    console.log(`Order ${orderId} payment failed`);
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

async function handleOrderPaid(orderEntity) {
  // This event is similar to payment.captured, but triggered when order is fully paid
  // We can use the same handler logic
  try {
    const orderId = orderEntity.notes?.orderId;
    if (!orderId) {
      console.error('No order ID in order notes');
      return;
    }

    const order = await Order.findById(orderId);
    if (order && order.paymentStatus !== 'paid') {
      // Payment will be handled by payment.captured event, but we can log this
      console.log(`Order ${orderId} marked as paid in Razorpay`);
    }
  } catch (error) {
    console.error('Error handling order paid:', error);
  }
}

async function handleRefundCreated(refund) {
  try {
    const order = await Order.findOne({ 
      razorpayPaymentId: refund.payment_id 
    });

    if (order) {
      order.paymentStatus = 'refunded';
      order.status = 'refunded';
      order.refundAmount = refund.amount / 100; // Convert from paise to rupees
      order.refundReason = refund.notes?.reason || 'Customer request';
      
      if (order.addTimelineEntry) {
        order.addTimelineEntry(
          'refunded',
          `Refund processed for ₹${order.refundAmount}`,
          null
        );
      }
      
      await order.save();
      
      try {
        emitToAdmin('order-changed', { action: 'updated', order: order.toObject() });
      } catch(e) {
        console.error('Failed to emit admin event:', e);
      }
    }
  } catch (error) {
    console.error('Error handling refund created:', error);
  }
}

