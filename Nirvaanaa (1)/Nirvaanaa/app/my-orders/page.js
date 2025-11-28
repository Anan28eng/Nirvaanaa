"use client";
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Playfair_Display, Inter } from 'next/font/google';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiPackage, FiArrowRight, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const playfair = Playfair_Display({ subsets: ['latin'], weight: '700' });
const inter = Inter({ subsets: ['latin'], weight: '400' });

export default function MyOrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.email) return setLoading(false);
      try {
        // Fetch user orders
        const oRes = await fetch('/api/orders/user');
        if (oRes.ok) {
          const oData = await oRes.json();
          setOrders(oData.orders || []);
        }

        // Fetch cart
        const cRes = await fetch(`/api/cart?email=${encodeURIComponent(session.user.email)}`);
        if (cRes.ok) {
          const cData = await cRes.json();
          setCartItems(cData.items || []);
        }

        // Fetch returns
        const rRes = await fetch('/api/returns');
        if (rRes.ok) {
          const rData = await rRes.json();
          setReturns(rData.returns || []);
        }
      } catch (err) {
        console.error('Failed to load orders/cart:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FiClock className="w-4 h-4 text-yellow-500" />;
      case 'processing':
        return <FiPackage className="w-4 h-4 text-blue-500" />;
      case 'shipped':
        return <FiPackage className="w-4 h-4 text-blue-500" />;
      case 'delivered':
        return <FiCheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <FiXCircle className="w-4 h-4 text-red-500" />;
      default:
        return <FiClock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getReturnStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FiClock className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <FiCheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <FiXCircle className="w-4 h-4 text-red-500" />;
      case 'processing':
        return <FiPackage className="w-4 h-4 text-blue-500" />;
      case 'completed':
        return <FiCheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <FiClock className="w-4 h-4 text-gray-500" />;
    }
  };

  const isEligibleForReturn = (order) => {
    const orderDate = new Date(order.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return orderDate >= thirtyDaysAgo && 
           ['delivered', 'shipped'].includes(order.status) &&
           !returns.some(r => r.orderId._id === order._id);
  };

  if (status === "loading") return <div>Loading...</div>;
  if (!session) return <div className="text-center py-20">Please sign in to view your orders.</div>;

  return (
    <main className="min-h-screen bg-nirvaanaa-offwhite px-4 py-8 flex flex-col items-center">
      <motion.h1 initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className={`${playfair.className} text-4xl md:text-5xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#bfae9e] to-[#7c6a58]`}>My Orders</motion.h1>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glassmorphism p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Current Cart</h2>
          {loading ? (
            <p>Loading cart...</p>
          ) : cartItems.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <ul className="space-y-3">
              {cartItems.map((it) => (
                <li key={it.productId || it.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{it.name}</div>
                    <div className="text-sm text-gray-500">Qty: {it.quantity}</div>
                  </div>
                  <div className="font-semibold">₹{it.price}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="glassmorphism p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Past Orders</h2>
          {loading ? (
            <p>Loading orders...</p>
          ) : orders.length === 0 ? (
            <p>You have no past orders.</p>
          ) : (
            <ul className="space-y-4">
              {orders.map((order) => (
                <li key={order._id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium">Order {order.orderNumber}</div>
                      <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="text-lg font-semibold">₹{order.total}</div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    {getStatusIcon(order.status)}
                    <span className="text-sm font-medium capitalize">{order.status}</span>
                  </div>
                  
                  <div className="text-sm text-gray-700 mb-3">
                    {order.items.slice(0,3).map(i => (
                      <div key={i.productId} className="flex items-center justify-between">
                        <div>{i.name} x{i.quantity}</div>
                        <div>₹{i.price}</div>
                      </div>
                    ))}
                    {order.items.length > 3 && <div className="text-xs text-gray-500">and {order.items.length - 3} more items</div>}
                  </div>
                  
                  <div className="flex gap-2">
                    <Link
                      href={`/orders/${order._id}`}
                      className="flex items-center gap-1 text-sm text-brand-brown hover:text-brand-gold transition-colors"
                    >
                      View Details
                      <FiArrowRight className="w-3 h-3" />
                    </Link>
                    
                    {isEligibleForReturn(order) && (
                      <Link
                        href={`/returns/${order._id}`}
                        className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 transition-colors"
                      >
                        Request Return
                        <FiArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Returns Section */}
        <div className="glassmorphism p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Return Requests</h2>
          {loading ? (
            <p>Loading returns...</p>
          ) : returns.length === 0 ? (
            <p>You have no return requests.</p>
          ) : (
            <ul className="space-y-4">
              {returns.map((returnRequest) => (
                <li key={returnRequest._id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium">Return #{returnRequest._id.slice(-8)}</div>
                      <div className="text-sm text-gray-500">
                        Order {returnRequest.orderId?.orderNumber}
                      </div>
                    </div>
                    <div className="text-lg font-semibold">₹{returnRequest.refundAmount}</div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    {getReturnStatusIcon(returnRequest.status)}
                    <span className="text-sm font-medium capitalize">{returnRequest.status}</span>
                  </div>
                  
                  <div className="text-sm text-gray-700 mb-3">
                    <div className="font-medium mb-1">Items:</div>
                    {returnRequest.items.slice(0,2).map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>{item.name} x{item.quantity}</div>
                        <div>₹{item.price * item.quantity}</div>
                      </div>
                    ))}
                    {returnRequest.items.length > 2 && (
                      <div className="text-xs text-gray-500">and {returnRequest.items.length - 2} more items</div>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Requested: {new Date(returnRequest.createdAt).toLocaleDateString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
