"use client"
import React from 'react';
import { Playfair_Display, Inter } from 'next/font/google';
import { motion } from 'framer-motion';

const playfair = Playfair_Display({ subsets: ['latin'], weight: '700' });
const inter = Inter({ subsets: ['latin'], weight: '400' });

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-nirvaanaa-offwhite px-4 py-8 flex flex-col items-center">
      <motion.h1 
        initial={{ opacity: 0, y: -30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.7 }} 
        className={`${playfair.className} text-4xl md:text-5xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#bfae9e] to-[#7c6a58]`}
      >
        Privacy Policy
      </motion.h1>
      <div className="max-w-2xl w-full glassmorphism p-6 rounded-xl shadow-lg mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-center py-12"
        >
          <div className="mb-6">
            <svg 
              className="w-24 h-24 mx-auto text-[#bfae9e]" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
          </div>
          <h2 className={`${playfair.className} text-3xl font-bold mb-4 text-[#7c6a58]`}>
            Under Review
          </h2>
          <p className={`${inter.className} text-lg text-[#7c6a58] mb-6`}>
            Our Privacy Policy is currently under review and will be updated soon.
          </p>
          <p className={`${inter.className} text-base text-[#7c6a58] opacity-80`}>
            We appreciate your patience. If you have any questions about privacy or data protection, 
            please feel free to contact us at{' '}
            <a 
              href="mailto:nirvaanaacreations@gmail.com" 
              className="text-[#bfae9e] hover:text-[#7c6a58] underline transition-colors"
            >
              nirvaanaacreations@gmail.com
            </a>
          </p>
        </motion.div>
      </div>
      <svg width="100%" height="40" viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4">
        <path d="M0,20 C480,60 960,-20 1440,20 L1440,40 L0,40 Z" fill="#e3e0d9" />
      </svg>
    </main>
  );
}
