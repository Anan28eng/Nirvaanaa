import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import { generateHtmlInvoice } from '@/utils/invoice';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const body = await request.json();
    const { orderId } = body;
    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    await dbConnect();
    const order = await Order.findById(orderId).populate('userId');
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // Generate HTML invoice
    const htmlInvoice = generateHtmlInvoice(order, order.userId, order.shippingMethod);
    const htmlBuffer = Buffer.from(htmlInvoice, 'utf-8');

    // Email to admin(s) - send HTML as attachment
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        secure: process.env.EMAIL_SERVER_PORT === '465',
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      });

      const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()).filter(Boolean) || [];
      if (adminEmails.length) {
        await transporter.sendMail({
          from: `"Nirvaanaa" <${process.env.EMAIL_SERVER_USER}>`,
          to: adminEmails,
          subject: `Invoice Generated - ${order.orderNumber}`,
          html: `An invoice was generated for order ${order.orderNumber}. Please find the invoice attached.`,
          attachments: [
            {
              filename: `invoice-${order.orderNumber}.html`,
              content: htmlBuffer,
            },
          ],
        });
      }
    } catch (e) {
      // Log but don't fail the response
      console.error('Failed to email invoice to admin:', e);
    }

    // Return HTML invoice - browser can print to PDF
    const headers = new Headers();
    headers.set('Content-Type', 'text/html; charset=utf-8');
    headers.set('Content-Disposition', `inline; filename="invoice-${order.orderNumber}.html"`);

    return new NextResponse(htmlInvoice, { headers });
  } catch (error) {
    console.error('Generate invoice error:', error);
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 });
  }
}
