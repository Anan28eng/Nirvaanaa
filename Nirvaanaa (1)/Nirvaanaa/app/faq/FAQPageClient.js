"use client"
import React, { useState } from 'react';
import { Playfair_Display, Inter } from 'next/font/google';
import { motion } from 'framer-motion';
import { FAQSchema } from '@/components/seo/StructuredData';

const playfair = Playfair_Display({ subsets: ['latin'], weight: '700' });
const inter = Inter({ subsets: ['latin'], weight: '400' });

const faqs = [
  {
    q: 'How do I place an order?',
    a: 'Select your desired piece, add to cart, and follow the poetic checkout flow.'
  },
  {
    q: 'What are the shipping options?',
    a: 'Domestic and international shipping with trusted partners. Timelines and charges are detailed on our Shipping page.'
  },
  {
    q: 'Can I return my order?',
    a: 'Returns are accepted for eligible products. See our Returns page for details.'
  },
  {
    q: 'Do you offer customization?',
    a: 'Yes, we craft bespoke pieces. Contact us to begin your personalized journey.'
  }
];

export default function FAQPageClient() {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <>
      <FAQSchema faqs={faqs} />
      <main className="min-h-screen bg-gradient-to-br from-[#f5f3ea] to-[#e3e0d9] px-4 py-8 flex flex-col items-center">
        <h1 className={`${playfair.className} text-4xl md:text-5xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#bfae9e] to-[#7c6a58]`}>
          <motion.span initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            Frequently Asked Questions
          </motion.span>
        </h1>
        <div className="max-w-2xl w-full glassmorphism p-6 rounded-xl shadow-lg mb-8">
          <h2 className={`${playfair.className} text-2xl mb-4`}>Common Questions About Our Handcrafted Products</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <motion.div key={idx} className="border rounded-lg overflow-hidden shadow-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 * idx }}>
                <button className={`w-full text-left px-4 py-3 bg-[#f7f4ed] ${playfair.className} text-lg font-semibold focus:outline-none`} onClick={() => setOpenIdx(openIdx === idx ? null : idx)}>
                  {faq.q}
                </button>
                <div className={`px-4 py-2 bg-white transition-all duration-300 ${openIdx === idx ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'} ${inter.className}`}>{faq.a}</div>
              </motion.div>
            ))}
          </div>
        </div>
        <svg width="100%" height="40" viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4" aria-hidden="true">
          <path d="M0,20 C480,60 960,-20 1440,20 L1440,40 L0,40 Z" fill="#e3e0d9" />
        </svg>
      </main>
    </>
  );
}

