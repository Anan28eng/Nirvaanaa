'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Playfair_Display } from 'next/font/google';
import { FiXCircle, FiShoppingCart, FiArrowLeft } from 'react-icons/fi';

const playfair = Playfair_Display({ subsets: ['latin'], weight: '700' });

export default function CheckoutCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-[60vh] max-w-3xl mx-auto px-4 py-16">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <FiXCircle className="w-20 h-20 text-orange-500 mx-auto mb-4" />
          <h1 className={`${playfair.className} text-3xl mb-4 text-brand-brown`}>
            Payment Cancelled
          </h1>
          <p className="text-gray-700 mb-2">
            Your payment was cancelled. No charges were made to your account.
          </p>
          <p className="text-sm text-gray-600">
            Your items are still in your cart if you'd like to complete your purchase later.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/cart')}
            className="px-5 py-3 bg-brand-gold text-white rounded-lg hover:bg-brand-brown transition-colors flex items-center justify-center gap-2"
          >
            <FiShoppingCart className="w-5 h-5" />
            Return to Cart
          </button>
          <button
            onClick={() => router.push('/products')}
            className="px-5 py-3 bg-white border-2 border-brand-gold text-brand-gold rounded-lg hover:bg-brand-gold hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <FiArrowLeft className="w-5 h-5" />
            Continue Shopping
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Need help? Contact our support team if you encountered any issues during checkout.
          </p>
        </div>
      </div>
    </div>
  );
}











