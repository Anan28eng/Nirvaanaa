


























"use client"
import React, { useEffect, useState } from 'react';
import { Playfair_Display, Inter } from 'next/font/google';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';

const playfair = Playfair_Display({ subsets: ['latin'], weight: '700' });
const inter = Inter({ subsets: ['latin'], weight: '400' });

export default function UserDashboard() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!session?.user) return;
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/orders/user');
        const data = await res.json();
        if (res.ok) setOrders(data.orders || []);
        else setError(data.error || 'Failed to load orders');
      } catch (e) {
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [session]);

  return (
    <main className="min-h-screen bg-nirvaanaa-offwhite px-4 py-8 flex flex-col items-center">
      <motion.h1 initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className={`${playfair.className} text-4xl md:text-5xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#bfae9e] to-[#7c6a58]`}>Hello, {session?.user?.name || 'Guest'}</motion.h1>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div className="glassmorphism p-6 rounded-xl shadow-lg" whileHover={{ scale: 1.03 }}>
          <h2 className={`${playfair.className} text-xl mb-2`}>Recent Orders</h2>
          {loading ? (
            <div className="text-sm text-gray-500">Loading orders...</div>
          ) : error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : (
            <ul className="space-y-2">
              {orders.length === 0 ? (
                <li className="text-sm text-gray-500">No recent orders</li>
              ) : (
                orders.slice(0, 6).map(order => (
                  <li key={order._id} className="flex justify-between items-center bg-[#f7f4ed] p-3 rounded-lg shadow-sm">
                    <div className="flex flex-col">
                      <span className={`${inter.className}`}>{order.orderNumber}</span>
                      <span className="text-[11px] text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#7c6a58]">{order.status}</span>
                      {order.status === 'delivered' && (
                        <button className="text-xs px-2 py-1 border rounded hover:bg-gray-50">Return</button>
                      )}
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}
        </motion.div>
        <motion.div className="glassmorphism p-6 rounded-xl shadow-lg" whileHover={{ scale: 1.03 }}>
          <h2 className={`${playfair.className} text-xl mb-2`}>Profile Settings</h2>
          <p className={`${inter.className}`}>Update your details, manage addresses, and set preferences.</p>
        </motion.div>
        <motion.div className="glassmorphism p-6 rounded-xl shadow-lg col-span-2" whileHover={{ scale: 1.03 }}>
          <h2 className={`${playfair.className} text-xl mb-2`}>Support</h2>
          <p className={`${inter.className}`}>Need help? Reach out to our artisan support team for poetic assistance.</p>
        </motion.div>
      </motion.div>
      <svg width="100%" height="40" viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4">
        <path d="M0,20 C480,60 960,-20 1440,20 L1440,40 L0,40 Z" fill="#e3e0d9" />
      </svg>
    </main>
  );
}
