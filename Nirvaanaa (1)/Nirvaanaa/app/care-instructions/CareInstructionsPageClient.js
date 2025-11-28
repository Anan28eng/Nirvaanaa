"use client";
import React from 'react';
import { useSession } from 'next-auth/react';
import { Playfair_Display, Inter } from 'next/font/google';
import { motion } from 'framer-motion';

const playfair = Playfair_Display({ subsets: ['latin'], weight: '700' });
const inter = Inter({ subsets: ['latin'], weight: '400' });

export default function CareInstructionsPageClient() {
  const { data: session, status } = useSession();
  if (status === "loading") return <div>Loading...</div>;
  if (!session) return <div className="text-center py-20">Please sign in to view care instructions.</div>;
  return (
    <main className="min-h-screen bg-nirvaanaa-offwhite px-4 py-8 flex flex-col items-center">
      <h1 className={`${playfair.className} text-4xl md:text-5xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#bfae9e] to-[#7c6a58]`}>
        <motion.span initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          Care Instructions for Handcrafted Products
        </motion.span>
      </h1>
      <div className="max-w-2xl w-full glassmorphism p-6 rounded-xl shadow-lg mb-8">
        <h2 className={`${playfair.className} text-2xl mb-4`}>Preserving Your Artisan-Crafted Pieces</h2>
        <p className={`${inter.className} mb-4 italic text-[#7c6a58]`}>Preserve the soul of your craft—let every gesture be a verse in the poem of longevity.</p>
        <ul className="list-disc pl-6">
          <li className={`${inter.className} mb-2`}>Gently wipe with a soft cloth.</li>
          <li className={`${inter.className} mb-2`}>Store in a cool, dry place.</li>
          <li className={`${inter.className} mb-2`}>Handle with love and care.</li>
        </ul>
      </div>
    </main>
  );
}

