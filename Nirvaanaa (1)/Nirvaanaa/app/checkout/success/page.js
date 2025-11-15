'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Playfair_Display } from 'next/font/google';
import { FiCheckCircle, FiDownload, FiShoppingBag } from 'react-icons/fi';

const playfair = Playfair_Display({ subsets: ['latin'], weight: '700' });

export default function CheckoutSuccessPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const paymentId = searchParams.get('payment_id');
  const orderId = searchParams.get('order_id') || searchParams.get('orderId');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // If we have payment_id and order_id, payment was successful
        if (paymentId && orderId) {
          setPaymentStatus('succeeded');
          await fetchOrder();
        } else if (orderId) {
          // Fallback: fetch order by orderId
          await fetchOrder();
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setLoading(false);
      }
    };

    const fetchOrder = async () => {
      try {
        let orderData = null;

        // Try to fetch order by orderId from URL
        if (orderId) {
          const res = await fetch(`/api/orders/user`);
          if (res.ok) {
            const data = await res.json();
            orderData = data.orders?.find(o => o._id === orderId || o._id?.toString() === orderId) || data.orders?.[0];
          }
        }

        // If no orderId, try to get the latest order
        if (!orderData) {
          const res = await fetch('/api/orders/user');
          if (res.ok) {
            const data = await res.json();
            orderData = data.orders?.[0];
          }
        }

        setOrder(orderData);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [paymentId, orderId]);

  const downloadInvoice = async () => {
    if (!order?._id) {
      alert('Order information not available. Please try again later.');
      return;
    }
    setDownloading(true);
    try {
      const res = await fetch('/api/generate-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order._id }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to generate invoice');
      }
      
      // Get HTML content
      const htmlContent = await res.text();
      
      // Open in new window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Wait for content to load, then trigger print
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
            // Optionally close after print dialog
            // printWindow.close();
          }, 250);
        };
        
        // Show success message
        alert('Invoice opened in new window. Use your browser\'s print function to save as PDF.');
      } else {
        // Fallback: download as HTML file
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${order.orderNumber || order._id}.html`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        alert('Invoice downloaded as HTML. Open it in your browser and use Print to PDF.');
      }
    } catch (error) {
      console.error('Invoice download error:', error);
      alert(`Failed to download invoice: ${error.message}`);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] max-w-3xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  // Check payment status
  if (paymentStatus && paymentStatus !== 'succeeded') {
    return (
      <div className="min-h-[60vh] max-w-3xl mx-auto px-4 py-16">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h1 className={`${playfair.className} text-2xl mb-4 text-yellow-800`}>
            Payment {paymentStatus}
          </h1>
          <p className="text-gray-700 mb-6">
            Your payment status is: {paymentStatus}. Please check your order or contact support if you have any questions.
          </p>
          <button
            onClick={() => router.push('/my-orders')}
            className="px-5 py-3 bg-brand-gold text-white rounded-lg hover:bg-brand-brown transition-colors"
          >
            View My Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] max-w-3xl mx-auto px-4 py-16">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <FiCheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h1 className={`${playfair.className} text-3xl mb-4 text-brand-brown`}>
            Thank you for your order!
          </h1>
          <p className="text-gray-700 mb-2">
            Your payment was successful and your order has been confirmed.
          </p>
          {order?.orderNumber && (
            <p className="text-sm text-gray-600">
              Order Number: <span className="font-semibold">{order.orderNumber}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <button
            onClick={downloadInvoice}
            disabled={!order || downloading}
            className="px-5 py-3 bg-brand-gold text-white rounded-lg hover:bg-brand-brown transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {downloading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating...
              </>
            ) : (
              <>
                <FiDownload className="w-5 h-5" />
                Download Invoice (PDF)
              </>
            )}
          </button>
          <button
            onClick={() => router.push('/my-orders')}
            className="px-5 py-3 bg-white border-2 border-brand-gold text-brand-gold rounded-lg hover:bg-brand-gold hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <FiShoppingBag className="w-5 h-5" />
            View My Orders
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            A confirmation email has been sent to {session?.user?.email || 'your email address'}.
            You can track your order status in your account.
          </p>
        </div>
      </div>
    </div>
  );
}
