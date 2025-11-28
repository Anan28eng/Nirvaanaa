'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiClock, FiRefreshCw, FiHome } from 'react-icons/fi';

export default function TooManyRequestsPage() {
  return (
    <div className="min-h-screen bg-nirvaanaa-offwhite flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Error Icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8 flex justify-center"
          >
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
              <FiClock className="w-12 h-12 text-blue-600" />
            </div>
          </motion.div>

          {/* Error Code */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8"
          >
            <h1 className="text-6xl sm:text-8xl font-playfair font-bold text-brand-brown mb-4">
              429
            </h1>
            <h2 className="text-3xl sm:text-4xl font-playfair font-bold text-brand-brown mb-4">
              Too Many Requests
            </h2>
            <p className="text-lg text-brand-brown max-w-md mx-auto">
              You've made too many requests in a short time. Please wait a moment and try again.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 btn-primary px-6 py-3"
            >
              <FiRefreshCw className="w-5 h-5" />
              Try Again
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 btn-outline px-6 py-3"
            >
              <FiHome className="w-5 h-5" />
              Go Home
            </Link>
          </motion.div>

          {/* Countdown Suggestion */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-8"
          >
            <p className="text-sm text-brand-brown opacity-70">
              Please wait a few seconds before trying again.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

