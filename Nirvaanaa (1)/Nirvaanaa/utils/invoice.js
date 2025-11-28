/**
 * Simple HTML-based invoice generation
 * Replaces placeholders in HTML template with order data
 */

/**
 * Build the HTML product table rows for the invoice.
 * Creates a clean HTML table with product details.
 * 
 * @param {Object} order - Order document with items array
 * @returns {String} HTML string of table rows
 */
export function buildProductTableHtml(order) {
  if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
    return '<tr><td colspan="5" style="text-align: center; padding: 20px;">No items</td></tr>';
  }

  const rows = order.items.map((item) => {
    const itemPrice = item.price || 0;
    const itemQuantity = item.quantity || 0;
    const itemTotal = itemPrice * itemQuantity;
    
    // Format currency
    const formatPrice = (price) => {
      if (typeof price !== 'number') return '₹0';
      return `₹${price.toLocaleString('en-IN')}`;
    };

    // Escape HTML to prevent XSS
    const escapeHtml = (text) => {
      if (typeof text !== 'string') return String(text || '');
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    const colorInfo = item.colorVariant 
      ? `<br><small style="color: #666;">Color: ${escapeHtml(item.colorVariant.name || 'N/A')}</small>`
      : '';

    return `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${escapeHtml(item.name || 'Unknown Product')}${colorInfo}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${itemQuantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${formatPrice(itemPrice)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${formatPrice(itemTotal)}</td>
      </tr>
    `;
  });

  return rows.join('');
}

/**
 * Build comprehensive data map from the order data.
 * Automatically extracts all relevant information from order, user, and shipping data.
 * 
 * @param {Object} order - Order document with items, shipping, totals, etc.
 * @param {Object} user - User document (optional, populated from order.userId)
 * @param {Object|String} shippingMethodLabel - Shipping method object or string
 * @returns {Object} Map of placeholder names to values
 */
export function buildInvoicePlaceholders(order, user, shippingMethodLabel) {
  const address = order.shippingAddress || {};
  const customerName = address.name || user?.name || 'Customer';
  const customerEmail = user?.email || address.email || '';
  const customerPhone = address.phone || user?.phone || '';
  
  // Build full address string
  const addressLine = [address.street, address.city, address.state, address.zipCode, address.country]
    .filter(Boolean)
    .join(', ');

  // Format dates
  const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
  const formattedDate = orderDate.toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const formattedTime = orderDate.toLocaleTimeString('en-IN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Extract shipping method name
  const shippingMethodName = typeof shippingMethodLabel === 'string'
    ? shippingMethodLabel
    : (typeof order.shippingMethod === 'string'
        ? order.shippingMethod
        : (order.shippingMethod?.name || 'Standard Shipping'));

  // Calculate item count
  const itemCount = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

  // Format currency values
  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '₹0';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Build comprehensive placeholder map
  return {
    // Customer information
    customer_name: customerName,
    customer_address: addressLine,
    customer_email: customerEmail,
    customer_phone: customerPhone,
    
    // Order information
    order_number: order.orderNumber || order._id?.toString() || 'N/A',
    order_date: formattedDate,
    order_time: formattedTime,
    
    // Shipping information
    shipping_method: shippingMethodName,
    shipping_cost: formatCurrency(order.shipping || 0),
    
    // Pricing information
    subtotal: formatCurrency(order.subtotal || 0),
    tax: formatCurrency(order.tax || 0),
    discount: formatCurrency(order.discount || 0),
    total_price: formatCurrency(order.total || 0),
    
    // Product information
    product_table: buildProductTableHtml(order),
    item_count: itemCount.toString(),
    
    // Payment information
    payment_method: order.paymentMethod || 'razorpay',
    payment_status: order.paymentStatus || 'pending',
  };
}

/**
 * Generate HTML invoice from order data
 * Simple string replacement - no complex templating needed
 */
export function generateHtmlInvoice(order, user, shippingMethodLabel) {
  const data = buildInvoicePlaceholders(order, user, shippingMethodLabel);
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice - ${data.order_number}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background: var(--nirvaanaa-shell);
      padding: 20px;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: var(--nirvaanaa-primary-light);
      padding: 40px;
      box-shadow: var(--nirvaanaa-shadow-soft);
    }
    .header {
      border-bottom: 3px solid var(--nirvaanaa-secondary-dark);
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: var(--nirvaanaa-secondary-dark);
      font-size: 32px;
      margin-bottom: 10px;
    }
    .header p {
      color: var(--nirvaanaa-secondary-light);
      font-size: 14px;
    }
    .invoice-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 30px;
    }
    .info-section h3 {
      color: var(--nirvaanaa-secondary-dark);
      font-size: 16px;
      margin-bottom: 10px;
      border-bottom: 1px solid #eee;
      padding-bottom: 5px;
    }
    .info-section p {
      margin: 5px 0;
      color: #555;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 30px 0;
    }
    .items-table th {
      background: var(--nirvaanaa-secondary);
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }
    .items-table td {
      padding: 10px;
      border-bottom: 1px solid #ddd;
    }
    .items-table tr:hover {
      background: var(--nirvaanaa-primary-light);
    }
    .totals {
      margin-top: 30px;
      border-top: 2px solid var(--nirvaanaa-secondary-dark);
      padding-top: 20px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 16px;
    }
    .total-row.final {
      font-size: 24px;
      font-weight: bold;
      color: var(--nirvaanaa-secondary-dark);
      border-top: 2px solid var(--nirvaanaa-secondary-dark);
      padding-top: 15px;
      margin-top: 10px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .invoice-container {
        box-shadow: none;
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <h1>INVOICE</h1>
      <p>Nirvaanaa - Handcrafted Embroidery Products</p>
    </div>
    
    <div class="invoice-info">
      <div class="info-section">
        <h3>Bill To:</h3>
        <p><strong>${data.customer_name}</strong></p>
        <p>${data.customer_address}</p>
        <p>Email: ${data.customer_email || 'N/A'}</p>
        <p>Phone: ${data.customer_phone || 'N/A'}</p>
      </div>
      
      <div class="info-section">
        <h3>Invoice Details:</h3>
        <p><strong>Order Number:</strong> ${data.order_number}</p>
        <p><strong>Date:</strong> ${data.order_date}</p>
        <p><strong>Time:</strong> ${data.order_time}</p>
        <p><strong>Payment Method:</strong> ${data.payment_method}</p>
        <p><strong>Payment Status:</strong> ${data.payment_status}</p>
      </div>
    </div>
    
    <table class="items-table">
      <thead>
        <tr>
          <th>Item</th>
          <th style="text-align: center;">Quantity</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${data.product_table}
      </tbody>
    </table>
    
    <div class="totals">
      <div class="total-row">
        <span>Subtotal:</span>
        <span>${data.subtotal}</span>
      </div>
      <div class="total-row">
        <span>Shipping (${data.shipping_method}):</span>
        <span>${data.shipping_cost}</span>
      </div>
      <div class="total-row">
        <span>Tax (GST 18% on Subtotal + Shipping):</span>
        <span>${data.tax}</span>
      </div>
      ${data.discount !== '₹0' ? `
      <div class="total-row">
        <span>Discount:</span>
        <span>-${data.discount}</span>
      </div>
      ` : ''}
      <div class="total-row final">
        <span>Total:</span>
        <span>${data.total_price}</span>
      </div>
    </div>
    
    <div class="footer">
      <p>Thank you for your business!</p>
      <p>This is a computer-generated invoice. No signature required.</p>
    </div>
  </div>
</body>
</html>
  `;
  
  return html;
}

/**
 * Generate PDF from HTML using simple approach
 * Returns HTML that can be printed to PDF by browser
 */
export async function generateInvoicePdf(order, user, shippingMethodLabel) {
  const html = generateHtmlInvoice(order, user, shippingMethodLabel);
  
  // For now, return HTML that can be printed to PDF
  // In production, you could use puppeteer or similar to convert to PDF
  // For simplicity, we'll return HTML and let the browser handle PDF generation
  return Buffer.from(html, 'utf-8');
}

// Build a static data map for test invoice generation (no DB required)
export function buildTestInvoiceData() {
  const order = {
    createdAt: new Date().toISOString(),
    orderNumber: 'NV241201001',
    shippingMethod: {
      name: 'Standard Shipping',
      estimatedDays: 5,
    },
    subtotal: 1999,
    shipping: 150, // Shipping cost included
    tax: 360, // 18% GST on subtotal
    discount: 0,
    total: 2509, // Subtotal + Shipping + Tax
    items: [
      { name: 'Silk Saree', price: 1299, quantity: 1, colorVariant: { name: 'Cream', hex: '#f5f1eb' } },
      { name: 'Blouse Piece', price: 299, quantity: 1 },
      { name: 'Accessory Set', price: 401, quantity: 1, colorVariant: { name: 'Beige', hex: '#e0d5c7' } },
    ],
    shippingAddress: {
      name: 'Test User',
      street: '123 Sample Street',
      city: 'Bengaluru',
      state: 'KA',
      zipCode: '560001',
      country: 'India',
      phone: '+91 9876543210',
    },
    paymentMethod: 'razorpay',
    paymentStatus: 'paid',
  };

  return buildInvoicePlaceholders(order, { name: 'Test User', email: 'test@example.com' }, order.shippingMethod);
}
