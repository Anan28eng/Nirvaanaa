'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiLock, FiLogIn,FiHome } from 'react-icons/fi';

export default function UnauthorizedPage() {
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
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center">
              <FiLock className="w-12 h-12 text-orange-600" />
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
              401
            </h1>
            <h2 className="text-3xl sm:text-4xl font-playfair font-bold text-brand-brown mb-4">
              Unauthorized
            </h2>
            <p className="text-lg text-brand-brown max-w-md mx-auto">
              You need to be signed in to access this page. Please log in to continue.
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
              href="/auth/signin"
              className="inline-flex items-center gap-2 btn-primary px-6 py-3"
            >
              <FiLogIn className="w-5 h-5" />
              Sign In
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 btn-outline px-6 py-3"
            >
              <FiHome className="w-5 h-5" />
              Go Home
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

