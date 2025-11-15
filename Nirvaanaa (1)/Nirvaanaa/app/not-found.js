'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiHome, FiSearch, FiArrowLeft } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-cream-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Error Code */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <h1 className="text-9xl sm:text-[12rem] font-playfair font-bold text-brand-brown leading-none">
              404
            </h1>
          </motion.div>

          {/* Error Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8"
          >
            <h2 className="text-3xl sm:text-4xl font-playfair font-bold text-brand-brown mb-4">
              Page Not Found
            </h2>
            <p className="text-lg text-brand-brown max-w-md mx-auto">
              The page you're looking for seems to have wandered away, like a lost thread in an embroidery pattern.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 btn-primary px-6 py-3"
            >
              <FiHome className="w-5 h-5" />
              Go Home
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 btn-outline px-6 py-3"
            >
              <FiSearch className="w-5 h-5" />
              Browse Products
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 text-brand-brown hover:text-brand-gold transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </motion.div>

          {/* Decorative Elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-16"
          >
            <div className="flex justify-center gap-4 text-brand-gold opacity-20">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

