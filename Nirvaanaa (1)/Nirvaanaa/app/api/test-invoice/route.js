import { NextResponse } from "next/server";
import { generateHtmlInvoice, buildTestInvoiceData } from "@/utils/invoice";

export async function GET() {
  try {
    // Build test order data
    const testOrder = {
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

    const testUser = { 
      name: 'Test User', 
      email: 'test@example.com' 
    };

    // Generate HTML invoice
    const htmlInvoice = generateHtmlInvoice(testOrder, testUser, testOrder.shippingMethod);

    return new NextResponse(htmlInvoice, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": 'inline; filename="invoice-test.html"',
      },
    });
  } catch (err) {
    console.error("Test invoice error:", err);
    return NextResponse.json({ 
      error: err?.message || "Failed to generate test invoice" 
    }, { status: 500 });
  }
}
