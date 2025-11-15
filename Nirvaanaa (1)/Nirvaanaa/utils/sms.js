import twilio from 'twilio';

// Initialize Twilio client only if credentials are available
const getTwilioClient = () => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    return null;
  }
  return twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
};

// Send order confirmation SMS
export const sendOrderConfirmationSMS = async (order, phoneNumber) => {
  try {
    const client = getTwilioClient();
    if (!client) {
      console.warn('Twilio not configured, skipping SMS');
      return false;
    }

    const message = `Thank you for your order! Order #${order.orderNumber} has been confirmed. Total: ₹${order.total}. We'll notify you when it ships. - Nirvaanaa`;

    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    return true;
  } catch (error) {
    console.error('SMS sending error:', error);
    throw new Error('Failed to send order confirmation SMS');
  }
};

// Send order shipped SMS
export const sendOrderShippedSMS = async (order, phoneNumber, trackingNumber = null) => {
  try {
    const client = getTwilioClient();
    if (!client) {
      console.warn('Twilio not configured, skipping SMS');
      return false;
    }

    let message = `Your order #${order.orderNumber} has been shipped! `;
    
    if (trackingNumber) {
      message += `Tracking: ${trackingNumber}. `;
    }
    
    message += `Expected delivery: ${order.shippingMethod.estimatedDays} days. - Nirvaanaa`;

    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    return true;
  } catch (error) {
    console.error('SMS sending error:', error);
    throw new Error('Failed to send order shipped SMS');
  }
};

// Send order delivered SMS
export const sendOrderDeliveredSMS = async (order, phoneNumber) => {
  try {
    const client = getTwilioClient();
    if (!client) {
      console.warn('Twilio not configured, skipping SMS');
      return false;
    }

    const message = `Your order #${order.orderNumber} has been delivered! We hope you love your handmade treasures from Nirvaanaa. Thank you for choosing us!`;

    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    return true;
  } catch (error) {
    console.error('SMS sending error:', error);
    throw new Error('Failed to send order delivered SMS');
  }
};

// Send order status update SMS
export const sendOrderStatusUpdateSMS = async (order, phoneNumber, status, additionalInfo = '') => {
  try {
    const client = getTwilioClient();
    if (!client) {
      console.warn('Twilio not configured, skipping SMS');
      return false;
    }

    const statusMessages = {
      processing: 'Your order is being processed',
      shipped: 'Your order has been shipped',
      delivered: 'Your order has been delivered',
      cancelled: 'Your order has been cancelled',
      refunded: 'Your refund has been processed',
    };

    const baseMessage = statusMessages[status] || 'Your order status has been updated';
    const message = `${baseMessage}. Order #${order.orderNumber}. ${additionalInfo} - Nirvaanaa`;

    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    return true;
  } catch (error) {
    console.error('SMS sending error:', error);
    throw new Error('Failed to send order status update SMS');
  }
};

// Validate phone number format
export const validatePhoneNumber = (phoneNumber) => {
  // Basic validation for Indian phone numbers
  const phoneRegex = /^(\+91|91|0)?[6-9]\d{9}$/;
  return phoneRegex.test(phoneNumber.replace(/\s/g, ''));
};

// Format phone number for Twilio
export const formatPhoneNumber = (phoneNumber) => {
  let formatted = phoneNumber.replace(/\s/g, '');
  
  // Add +91 if not present
  if (!formatted.startsWith('+')) {
    if (formatted.startsWith('91') && formatted.length === 12) {
      formatted = '+' + formatted;
    } else if (formatted.startsWith('0') && formatted.length === 11) {
      formatted = '+91' + formatted.substring(1);
    } else if (formatted.length === 10) {
      formatted = '+91' + formatted;
    }
  }
  
  return formatted;
};
