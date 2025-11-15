"use client"
import React from 'react';
import { Playfair_Display, Inter } from 'next/font/google';
import { motion } from 'framer-motion';

const playfair = Playfair_Display({ subsets: ['latin'], weight: '700' });
const inter = Inter({ subsets: ['latin'], weight: '400' });

const sizeChart = [
  { type: 'Tote Bag', width: '40cm', height: '35cm', icon: <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="6" y="10" width="20" height="14" rx="4" fill="#bfae9e" /><path d="M10 10V8a6 6 0 0112 0v2" stroke="#7c6a58" strokeWidth="2" /></svg> },
  { type: 'Clutch', width: '25cm', height: '15cm', icon: <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="8" y="14" width="16" height="8" rx="3" fill="#bfae9e" /><path d="M8 14L16 8L24 14" stroke="#7c6a58" strokeWidth="2" /></svg> },
  { type: 'Accessory', width: '10cm', height: '10cm', icon: <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true"><circle cx="16" cy="16" r="8" fill="#bfae9e" /><path d="M16 8V24" stroke="#7c6a58" strokeWidth="2" /></svg> }
];

const tips = [
  "Choose a tote for daily poetry, a clutch for evening elegance, and an accessory for a whisper of style.",
  "Consider the occasion—each piece is crafted to complement your journey.",
  "Measure with care, for every centimeter is a stanza in your story."
];

export default function SizeGuidePageClient() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f5f3ea] to-[#e3e0d9] px-4 py-8 flex flex-col items-center">
      <h1 className={`${playfair.className} text-4xl md:text-5xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#bfae9e] to-[#7c6a58]`}>
        <motion.span initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          Size Guide for Handcrafted Bags
        </motion.span>
      </h1>
      <div className="max-w-2xl w-full glassmorphism p-6 rounded-xl shadow-lg mb-8">
        <h2 className={`${playfair.className} text-2xl mb-4`}>Visual Size Chart</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {sizeChart.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2">
              {item.icon}
              <span className={`${playfair.className} text-lg`}>{item.type}</span>
              <span className={`${inter.className} text-sm text-[#7c6a58]`}>{item.width} × {item.height}</span>
            </div>
          ))}
        </div>
        <div className="divider my-6" />
        <h2 className={`${playfair.className} text-2xl mb-2`}>Tips for Choosing the Right Size</h2>
        <ul className="list-disc pl-6">
          {tips.map((tip, idx) => (
            <li key={idx} className={`${inter.className} mb-2`}>{tip}</li>
          ))}
        </ul>
      </div>
      <svg width="100%" height="40" viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4" aria-hidden="true">
        <path d="M0,20 C480,60 960,-20 1440,20 L1440,40 L0,40 Z" fill="#e3e0d9" />
      </svg>
    </main>
  );
}

