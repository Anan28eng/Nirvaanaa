"use client"
import React from 'react';
import { Playfair_Display, Inter } from 'next/font/google';
import { motion } from 'framer-motion';

const playfair = Playfair_Display({ subsets: ['latin'], weight: '700' });
const inter = Inter({ subsets: ['latin'], weight: '400' });

const careSteps = [
  {
    icon: <motion.svg initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }} width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="8" y="12" width="16" height="8" rx="4" fill="#bfae9e" /><path d="M8 12L16 6L24 12" stroke="#7c6a58" strokeWidth="2" /></motion.svg>,
    title: 'Cleaning',
    desc: 'Gently wipe with a soft cloth. Avoid harsh chemicals—let the soul of your craft breathe.'
  },
  {
    icon: <motion.svg initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }} width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="10" y="10" width="12" height="12" rx="6" fill="#bfae9e" /><path d="M16 10V22" stroke="#7c6a58" strokeWidth="2" /></motion.svg>,
    title: 'Storage',
    desc: 'Store in a cool, dry place. Use dust bags to preserve the poetry of each piece.'
  },
  {
    icon: <motion.svg initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }} width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="8" fill="#bfae9e" /><path d="M16 8V24" stroke="#7c6a58" strokeWidth="2" /></motion.svg>,
    title: 'Longevity',
    desc: 'Handle with love. Each touch preserves the soul of your craft.'
  }
];

export default function CarePage() {
  return (
    <main className="min-h-screen bg-nirvaanaa-offwhite px-4 py-8 flex flex-col items-center">
      <motion.h1 initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className={`${playfair.className} text-4xl md:text-5xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#bfae9e] to-[#7c6a58]`}>Product Care</motion.h1>
      <div className="max-w-2xl w-full glassmorphism p-6 rounded-xl shadow-lg mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {careSteps.map((step, idx) => (
            <motion.div key={idx} className="flex flex-col items-center gap-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 * idx }}>
              {step.icon}
              <span className={`${playfair.className} text-lg`}>{step.title}</span>
              <span className={`${inter.className} text-sm text-[#7c6a58]`}>{step.desc}</span>
            </motion.div>
          ))}
        </div>
        <div className="divider my-6" />
        <p className={`${inter.className} italic text-[#7c6a58]`}>Preserve the soul of your craft—let every gesture be a verse in the poem of longevity.</p>
      </div>
      <svg width="100%" height="40" viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4">
        <path d="M0,20 C480,60 960,-20 1440,20 L1440,40 L0,40 Z" fill="#e3e0d9" />
      </svg>
    </main>
  );
}
