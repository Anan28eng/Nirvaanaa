'use client';

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import { FiLock, FiAlertCircle } from 'react-icons/fi';

export default function PaymentForm({ razorpayOrderId, amount, orderId, onSuccess, onError }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    // Check if Razorpay is already loaded
    if (typeof window !== 'undefined' && window.Razorpay) {
      setRazorpayLoaded(true);
    }
  }, []);

  const handlePayment = async () => {
    if (!razorpayOrderId || !amount) {
      setMessage('Payment details are missing. Please try again.');
      return;
    }

    if (!razorpayLoaded) {
      setMessage('Razorpay is not loaded yet. Please wait...');
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount, // Amount in paise
        currency: 'INR',
        name: 'Nirvaanaa',
        description: `Order #${orderId}`,
        order_id: razorpayOrderId,
        handler: async function (response) {
          // Verify payment on server
          try {
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: orderId,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok && verifyData.success) {
              setMessage('Payment successful!');
              if (onSuccess) {
                onSuccess(response);
              }
              // Redirect to success page
              window.location.href = `/checkout/success?payment_id=${response.razorpay_payment_id}&order_id=${orderId}`;
            } else {
              setMessage(verifyData.error || 'Payment verification failed');
              if (onError) {
                onError(new Error(verifyData.error || 'Payment verification failed'));
              }
              setIsLoading(false);
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            setMessage('Payment verification failed. Please contact support.');
            if (onError) {
              onError(error);
            }
            setIsLoading(false);
          }
        },
        prefill: {
          // You can prefill customer details if available
        },
        notes: {
          orderId: orderId,
        },
        theme: {
          color: '#d4af37', // Brand gold color
        },
        modal: {
          ondismiss: function() {
            setIsLoading(false);
            setMessage('Payment cancelled');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        setMessage(response.error.description || 'Payment failed. Please try again.');
        if (onError) {
          onError(new Error(response.error.description || 'Payment failed'));
        }
        setIsLoading(false);
      });

      razorpay.open();
    } catch (error) {
      console.error('Payment initiation error:', error);
      setMessage('Failed to initiate payment. Please try again.');
      if (onError) {
        onError(error);
      }
      setIsLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => {
          setMessage('Failed to load Razorpay. Please refresh the page.');
          setRazorpayLoaded(false);
        }}
      />

      <div className="space-y-6" data-testid="payment-form">
        {message && (
          <div
            className={`flex items-center gap-2 p-4 rounded-lg ${
              message.includes('successful') || message.includes('success')
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
            role="alert"
          >
            <FiAlertCircle className="w-5 h-5" />
            <span className="text-sm">{message}</span>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">
            Payment Methods Supported:
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-white rounded text-xs">Credit/Debit Cards</span>
            <span className="px-3 py-1 bg-white rounded text-xs">UPI</span>
            <span className="px-3 py-1 bg-white rounded text-xs">Wallets</span>
            <span className="px-3 py-1 bg-white rounded text-xs">Net Banking</span>
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={isLoading || !razorpayLoaded || !razorpayOrderId}
          className="w-full bg-brand-gold text-white py-3 px-6 rounded-lg font-semibold hover:bg-brand-brown transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </>
          ) : (
            <>
              <FiLock className="w-4 h-4" />
              Pay ₹{(amount / 100).toFixed(2)}
            </>
          )}
        </button>

        <p className="text-xs text-center text-gray-500">
          Secure payment powered by Razorpay. Your payment information is encrypted and secure.
        </p>
      </div>
    </>
  );
}
