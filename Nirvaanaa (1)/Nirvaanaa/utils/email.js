import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: process.env.EMAIL_SERVER_PORT,
    secure: process.env.EMAIL_SERVER_PORT === '465',
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });
};

// Generic email sending function
export const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();
  
  try {
    await transporter.sendMail({
      from: `"Nirvaanaa" <${process.env.EMAIL_SERVER_USER}>`,
      to,
      subject,
      html,
      text,
    });
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email');
  }
};

// Send order confirmation email
export const sendOrderConfirmation = async (order, user) => {
  const transporter = createTransporter();
  
  const itemsList = order.items.map(item => 
    `<tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">₹${item.price}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">₹${item.price * item.quantity}</td>
    </tr>`
  ).join('');

  const emailContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation - Nirvaanaa</title>
      <style>
        body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f5f1eb 0%, #d4af37 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .logo { font-family: 'Playfair Display', serif; font-size: 28px; color: #8b4513; margin-bottom: 10px; }
        .order-number { background: #f5f1eb; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .table th { background: #f5f1eb; padding: 12px; text-align: left; font-weight: 600; }
        .total { background: #d4af37; color: white; padding: 15px; border-radius: 8px; text-align: right; font-weight: 600; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Nirvaanaa</div>
          <p style="margin: 0; color: #8b4513; font-size: 18px;">Handcrafted Elegance</p>
        </div>
        
        <div class="content">
          <h2 style="color: #8b4513; margin-bottom: 20px;">Thank you for your order!</h2>
          
          <p>Dear ${user.name},</p>
          
          <p>We're delighted to confirm your order with Nirvaanaa. Your handmade treasures are being carefully prepared with love and attention to detail.</p>
          
          <div class="order-number">
            <strong>Order Number:</strong> ${order.orderNumber}
          </div>
          
          <h3 style="color: #8b4513;">Order Details</h3>
          
          <table class="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Name</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
          </table>
          
          <div class="total">
            <div>Subtotal: ₹${order.subtotal}</div>
            <div>Shipping: ₹${order.shipping}</div>
            <div>Tax: ₹${order.tax}</div>
            ${order.discount > 0 ? `<div>Discount: -₹${order.discount}</div>` : ''}
            <div style="font-size: 18px; margin-top: 10px;">Total: ₹${order.total}</div>
          </div>
          
          <h3 style="color: #8b4513; margin-top: 30px;">Shipping Address</h3>
          <p>
            ${order.shippingAddress.name}<br>
            ${order.shippingAddress.street}<br>
            ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
            ${order.shippingAddress.country}
          </p>
          
          <p style="margin-top: 30px;">
            We'll send you tracking information once your order ships. 
            If you have any questions, please don't hesitate to contact us.
          </p>
          
          <p>With gratitude,<br>The Nirvaanaa Team</p>
        </div>
        
        <div class="footer">
          <p>© 2024 Nirvaanaa. All rights reserved.</p>
          <p>Handcrafted with love in India</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Nirvaanaa" <${process.env.EMAIL_SERVER_USER}>`,
      to: user.email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: emailContent,
    });

    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send order confirmation email');
  }
};

// Send contact form email to admin
export const sendContactFormToAdmin = async (contactData) => {
  const transporter = createTransporter();
  
  const emailContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Contact Form Submission - Nirvaanaa</title>
      <style>
        body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f5f1eb 0%, #d4af37 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .field { margin-bottom: 20px; }
        .label { font-weight: 600; color: #8b4513; }
        .value { background: #f5f1eb; padding: 10px; border-radius: 5px; margin-top: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="color: #8b4513; margin: 0;">New Contact Form Submission</h2>
        </div>
        
        <div class="content">
          <div class="field">
            <div class="label">Name:</div>
            <div class="value">${contactData.name}</div>
          </div>
          
          <div class="field">
            <div class="label">Email:</div>
            <div class="value">${contactData.email}</div>
          </div>
          
          <div class="field">
            <div class="label">Message:</div>
            <div class="value">${contactData.message}</div>
          </div>
          
          <div class="field">
            <div class="label">Submitted at:</div>
            <div class="value">${new Date().toLocaleString()}</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  
  try {
    for (const adminEmail of adminEmails) {
      await transporter.sendMail({
        from: `"Nirvaanaa Contact Form" <${process.env.EMAIL_SERVER_USER}>`,
        to: adminEmail.trim(),
        subject: 'New Contact Form Submission - Nirvaanaa',
        html: emailContent,
      });
    }

    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send contact form email');
  }
};

// Send contact form confirmation to user
export const sendContactFormConfirmation = async (contactData) => {
  const transporter = createTransporter();
  
  const emailContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Thank you for contacting us - Nirvaanaa</title>
      <style>
        body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f5f1eb 0%, #d4af37 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .logo { font-family: 'Playfair Display', serif; font-size: 28px; color: #8b4513; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Nirvaanaa</div>
          <p style="margin: 0; color: #8b4513; font-size: 18px;">Handcrafted Elegance</p>
        </div>
        
        <div class="content">
          <h2 style="color: #8b4513; margin-bottom: 20px;">Thank you for reaching out!</h2>
          
          <p>Dear ${contactData.name},</p>
          
          <p>Thank you for contacting Nirvaanaa. We've received your message and will get back to you within 24-48 hours.</p>
          
          <p>In the meantime, feel free to explore our collection of handmade embroidery bags and sarees.</p>
          
          <p>With gratitude,<br>The Nirvaanaa Team</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Nirvaanaa" <${process.env.EMAIL_SERVER_USER}>`,
      to: contactData.email,
      subject: 'Thank you for contacting us - Nirvaanaa',
      html: emailContent,
    });

    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send contact confirmation email');
  }
};
