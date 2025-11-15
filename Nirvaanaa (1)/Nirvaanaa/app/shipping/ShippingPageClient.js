"use client"
import React from 'react';
import { Playfair_Display, Inter } from 'next/font/google';
import { motion } from 'framer-motion';

const playfair = Playfair_Display({ subsets: ['latin'], weight: '700' });
const inter = Inter({ subsets: ['latin'], weight: '400' });

const quotes = [
  "Artisan hands shape the journey, as time weaves its gentle thread.",
  "Across lands and oceans, your treasures travel with care and poetry.",
  "Every parcel, a promise carried on wings of trust."
];

export default function ShippingPageClient() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f5f3ea] to-[#e3e0d9] px-4 py-8 flex flex-col items-center">
      <h1 className={`${playfair.className} text-4xl md:text-5xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#bfae9e] to-[#7c6a58]`}>
        <motion.span initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          Shipping Policy
        </motion.span>
      </h1>
      <div className="max-w-2xl w-full glassmorphism p-6 rounded-xl shadow-lg mb-8">
        <h2 className={`${playfair.className} text-2xl mb-2`}>Domestic & International Timelines</h2>
        <p className={`${inter.className} mb-4`}>Domestic orders: 3-7 business days. International orders: 7-21 business days. Each piece is dispatched with the care of an artisan, ensuring its safe passage to your doorstep.</p>
        <div className="divider my-6" />
        <h2 className={`${playfair.className} text-2xl mb-2`}>Courier Partners & Tracking</h2>
        <p className={`${inter.className} mb-4`}>We partner with trusted couriers: DHL, FedEx, BlueDart. Tracking details are shared upon dispatch, so you may follow your treasure's journey.</p>
        <div className="divider my-6" />
        <h2 className={`${playfair.className} text-2xl mb-2`}>Shipping Charges & Free Shipping</h2>
        <p className={`${inter.className}`}>Charges are calculated at checkout, reflecting the distance and care required. Free shipping available on orders over ₹1000. For international orders, customs duties may apply.</p>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="w-full max-w-xl mb-8">
        <div className="flex flex-col gap-4">
          {quotes.map((quote, idx) => (
            <motion.div key={idx} className="bg-[#f7f4ed] rounded-lg p-4 shadow-md border-l-4 border-[#bfae9e]" initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 * idx }}>
              <span className={`${playfair.className} italic text-lg text-[#7c6a58]`}>{quote}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
      <svg width="100%" height="40" viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4" aria-hidden="true">
        <path d="M0,20 C480,60 960,-20 1440,20 L1440,40 L0,40 Z" fill="#e3e0d9" />
      </svg>
    </main>
  );
}

