'use client';

import { motion } from 'framer-motion';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { FiUser, FiShoppingBag, FiHeart, FiSettings, FiLogOut } from 'react-icons/fi';

export default function UserMenu({ onClose }) {
  const { data: session } = useSession();
  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
    onClose();
  };

  const isAdmin = session?.user?.role === 'admin';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
    >
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-sm text-gray-500">Signed in as</p>
        <p className="text-sm font-medium text-gray-900 truncate">{session?.user?.email || 'user@example.com'}</p>
      </div>

      <div className="py-2">
        <Link
          href={isAdmin ? "/admin/dashboard" : "/dashboard"}
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          onClick={onClose}
        >
          <FiUser className="mr-3" size={16} />
          My Account
        </Link>

        <Link
          href="/settings"
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          onClick={onClose}
        >
          <FiSettings className="mr-3" size={16} />
          Settings
        </Link>

        <Link
          href="/wishlist"
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          onClick={onClose}
        >
          <FiHeart className="mr-3" size={16} />
          Wishlist
        </Link>

        <Link
          href="/cart"
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          onClick={onClose}
        >
          <FiShoppingBag className="mr-3" size={16} />
          My Orders
        </Link>
      </div>

      <div className="border-t border-gray-100 pt-2">
        <button
          onClick={handleSignOut}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <FiLogOut className="mr-3" size={16} />
          Sign Out
        </button>
      </div>
    </motion.div>
  );
}
