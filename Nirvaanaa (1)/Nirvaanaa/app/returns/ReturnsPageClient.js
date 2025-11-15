"use client"
import React, { useState } from 'react';
import { Playfair_Display, Inter } from 'next/font/google';
import { motion } from 'framer-motion';

const playfair = Playfair_Display({ subsets: ['latin'], weight: '700' });
const inter = Inter({ subsets: ['latin'], weight: '400' });

const faqs = [
  {
    q: 'Who is eligible for returns?',
    a: 'Products may be returned within 14 days if unused and in original packaging. Customized pieces are not eligible.'
  },
  {
    q: 'How do I initiate a return?',
    a: 'Contact us at libramank@gmail.com with your order details. We will guide you through the poetic process.'
  },
  {
    q: 'How long does the return process take?',
    a: 'Once received, returns are processed within 5-7 business days. Refunds are issued to your original payment method.'
  }
];

export default function ReturnsPageClient() {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f5f3ea] to-[#e3e0d9] px-4 py-8 flex flex-col items-center">
      <h1 className={`${playfair.className} text-4xl md:text-5xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#bfae9e] to-[#7c6a58]`}>
        <motion.span initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          Return Policy
        </motion.span>
      </h1>
      <div className="max-w-2xl w-full glassmorphism p-6 rounded-xl shadow-lg mb-8">
        <p className={`${inter.className} mb-4 italic text-[#7c6a58]`}>We understand that sometimes, the heart changes its mind. Our return process is crafted with empathy and grace, ensuring your experience remains poetic.</p>
        <div className="divider my-6" />
        <h2 className={`${playfair.className} text-2xl mb-4`}>Return Policy Details</h2>
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
  );
}

