'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiShield, FiHome } from 'react-icons/fi';

export default function ForbiddenPage() {
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
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
              <FiShield className="w-12 h-12 text-red-600" />
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
              403
            </h1>
            <h2 className="text-3xl sm:text-4xl font-playfair font-bold text-brand-brown mb-4">
              Forbidden
            </h2>
            <p className="text-lg text-brand-brown max-w-md mx-auto">
              You don't have permission to access this resource. Please contact support if you believe this is an error.
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
              href="/contact"
              className="inline-flex items-center gap-2 btn-outline px-6 py-3"
            >
              Contact Support
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

