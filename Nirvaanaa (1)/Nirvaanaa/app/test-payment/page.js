'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from '@/components/checkout/PaymentForm';
import { FiCreditCard, FiSmartphone } from 'react-icons/fi';

export default function TestPaymentPage() {
  const { data: session } = useSession();
  const [paymentType, setPaymentType] = useState('card'); // 'card' or 'upi'
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stripePromise, setStripePromise] = useState(null);

  // Initialize Stripe on mount
  React.useEffect(() => {
    const initStripe = async () => {
      if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
        setStripePromise(stripe);
      } else {
        setError('Stripe publishable key is not configured');
      }
    };
    initStripe();
  }, []);

  const createTestPaymentIntent = async (type) => {
    setLoading(true);
    setError(null);
    setClientSecret(null);

    try {
      const endpoint = type === 'card' ? '/api/test-payment/card' : '/api/test-payment/upi';
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 5000 }), // 50.00 INR (meets Stripe minimum)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create payment intent');
      }

      // API returns clientSecret (camelCase), not client_secret
      setClientSecret(data.clientSecret || data.client_secret);
      setPaymentType(type);
    } catch (err) {
      console.error('Error creating payment intent:', err);
      setError(err.message || 'Failed to create payment intent');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand-brown mb-4">Please sign in</h1>
          <p className="text-gray-600">You need to be signed in to test payments.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-brand-brown mb-8 text-center">
          Test Payment Methods
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-brand-brown mb-4">Select Payment Method</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => createTestPaymentIntent('card')}
              disabled={loading}
              className={`p-6 border-2 rounded-lg transition-all ${
                paymentType === 'card' && clientSecret
                  ? 'border-brand-gold bg-brand-gold/5'
                  : 'border-gray-200 hover:border-brand-gold'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <FiCreditCard className="w-6 h-6 text-brand-gold" />
                <span className="font-semibold text-brand-brown">Card Payment</span>
              </div>
              <p className="text-sm text-gray-600">
                Test card payments with Visa, Mastercard, etc.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Test card: 4242 4242 4242 4242
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Amount: ₹50.00 (meets Stripe minimum)
              </p>
            </button>

            <button
              onClick={() => createTestPaymentIntent('upi')}
              disabled={loading}
              className={`p-6 border-2 rounded-lg transition-all ${
                paymentType === 'upi' && clientSecret
                  ? 'border-brand-gold bg-brand-gold/5'
                  : 'border-gray-200 hover:border-brand-gold'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <FiSmartphone className="w-6 h-6 text-brand-gold" />
                <span className="font-semibold text-brand-brown">UPI Payment</span>
              </div>
              <p className="text-sm text-gray-600">
                Test UPI payments with QR code support
              </p>
              <p className="text-xs text-gray-500 mt-2">
                QR code will be displayed in test mode
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Amount: ₹50.00 (meets Stripe minimum)
              </p>
            </button>
          </div>

          {loading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Creating payment intent...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
        </div>

        {clientSecret && stripePromise ? (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-brand-brown mb-4">
              {paymentType === 'card' ? 'Card Payment Form' : 'UPI Payment Form'}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {paymentType === 'card' 
                ? 'Enter test card details: 4242 4242 4242 4242'
                : 'Select UPI to see the QR code for payment'}
            </p>
            
            <Elements 
              stripe={stripePromise} 
              options={{ 
                clientSecret,
                appearance: {
                  theme: 'stripe',
                },
              }}
              key={clientSecret} // Force re-render when clientSecret changes
            >
              <PaymentForm 
                clientSecret={clientSecret}
                paymentMethodTypes={paymentType === 'card' ? ['card'] : ['card', 'upi']}
                onSuccess={(paymentIntent) => {
                  console.log('Payment succeeded:', paymentIntent);
                  alert(`Payment succeeded! Payment Intent ID: ${paymentIntent.id}`);
                  // Optionally redirect
                  window.location.href = `/checkout/success?payment_intent=${paymentIntent.id}&payment_intent_client_secret=${clientSecret}`;
                }}
                onError={(error) => {
                  console.error('Payment error:', error);
                  setError(error.message || error.error || 'Payment failed');
                }}
              />
            </Elements>
          </div>
        ) : clientSecret && !stripePromise ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">Loading Stripe...</p>
          </div>
        ) : null}

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Test Instructions</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Card:</strong> Use test card 4242 4242 4242 4242 with any future expiry date</li>
            <li>• <strong>UPI:</strong> Select UPI tab and scan the QR code with a test UPI app</li>
            <li>• <strong>Amount:</strong> ₹50.00 (5000 paise) - meets Stripe's minimum requirement</li>
            <li>• All payments are in test mode and will appear in your Stripe dashboard</li>
            <li>• No real charges will be made</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

