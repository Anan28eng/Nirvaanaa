'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiPackage, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import Link from 'next/link';
import toast from 'react-hot-toast';

const ReturnRequestPage = () => {
  const { orderId } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [returnReason, setReturnReason] = useState('');
  const [itemReasons, setItemReasons] = useState({});

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchOrder();
  }, [session, orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/user?orderId=${orderId}`);
      const data = await response.json();
      
      if (response.ok) {
        setOrder(data.order);
        // Initialize selected items with all items
        setSelectedItems(data.order.items.map(item => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          reason: 'changed-mind',
          description: ''
        })));
      } else {
        toast.error(data.error || 'Failed to fetch order');
        router.push('/my-orders');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to fetch order');
      router.push('/my-orders');
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelection = (item, isSelected) => {
    if (isSelected) {
      setSelectedItems(prev => [...prev, {
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        reason: 'changed-mind',
        description: ''
      }]);
    } else {
      setSelectedItems(prev => prev.filter(selected => selected.productId !== item.productId));
    }
  };

  const handleQuantityChange = (productId, newQuantity) => {
    setSelectedItems(prev => prev.map(item => 
      item.productId === productId 
        ? { ...item, quantity: Math.max(1, Math.min(newQuantity, order.items.find(o => o.productId === productId).quantity)) }
        : item
    ));
  };

  const handleReasonChange = (productId, reason) => {
    setSelectedItems(prev => prev.map(item => 
      item.productId === productId 
        ? { ...item, reason }
        : item
    ));
  };

  const handleDescriptionChange = (productId, description) => {
    setSelectedItems(prev => prev.map(item => 
      item.productId === productId 
        ? { ...item, description }
        : item
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedItems.length === 0) {
      toast.error('Please select at least one item to return');
      return;
    }

    if (!returnReason.trim()) {
      toast.error('Please provide a return reason');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/returns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          items: selectedItems,
          returnReason,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Return request submitted successfully');
        router.push('/my-orders');
      } else {
        toast.error(data.error || 'Failed to submit return request');
      }
    } catch (error) {
      console.error('Error submitting return:', error);
      toast.error('Failed to submit return request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand-brown mb-4">Order Not Found</h1>
          <Link href="/my-orders" className="btn-primary">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const totalRefund = selectedItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-cream-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link 
            href="/my-orders"
            className="inline-flex items-center gap-2 text-brand-brown hover:text-brand-gold transition-colors mb-4"
          >
            <FiArrowLeft className="w-5 h-5" />
            Back to Orders
          </Link>
          
          <h1 className="text-3xl font-playfair font-bold text-brand-brown mb-2">
            Request Return
          </h1>
          <p className="text-brand-brown">
            Order #{order.orderNumber} • Placed on {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold text-brand-brown mb-6 flex items-center gap-2">
              <FiPackage className="w-5 h-5" />
              Select Items to Return
            </h2>

            <div className="space-y-4">
              {order.items.map((item, index) => {
                const selectedItem = selectedItems.find(selected => selected.productId === item.productId);
                const isSelected = !!selectedItem;

                return (
                  <div key={item.productId} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleItemSelection(item, e.target.checked)}
                        className="mt-1 w-4 h-4 text-brand-gold border-gray-300 rounded focus:ring-brand-gold"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-brand-brown">{item.name}</h3>
                            <p className="text-sm text-gray-600">₹{item.price} × {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-brand-brown">₹{item.price * item.quantity}</p>
                          </div>
                        </div>

                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-4 space-y-4"
                          >
                            {/* Quantity */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Return Quantity
                              </label>
                              <input
                                type="number"
                                min="1"
                                max={item.quantity}
                                value={selectedItem.quantity}
                                onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value))}
                                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                              />
                            </div>

                            {/* Reason */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Return Reason
                              </label>
                              <select
                                value={selectedItem.reason}
                                onChange={(e) => handleReasonChange(item.productId, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                              >
                                <option value="defective">Defective/Damaged</option>
                                <option value="wrong-item">Wrong Item</option>
                                <option value="not-as-described">Not as Described</option>
                                <option value="changed-mind">Changed Mind</option>
                                <option value="other">Other</option>
                              </select>
                            </div>

                            {/* Description */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Additional Details
                              </label>
                              <textarea
                                value={selectedItem.description}
                                onChange={(e) => handleDescriptionChange(item.productId, e.target.value)}
                                placeholder="Please provide additional details about the return..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                                rows="3"
                              />
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Return Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Return Instructions</h3>
            <div className="text-blue-800 space-y-2">
              <p>• Package the items securely in their original packaging if possible</p>
              <p>• Include the return slip with your package</p>
              <p>• Send the package to our return address (provided after approval)</p>
              <p>• Keep your tracking number for reference</p>
              <p>• Refunds will be processed within 5-7 business days after we receive your return</p>
            </div>
          </motion.div>

          {/* General Return Reason */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h3 className="text-lg font-semibold text-brand-brown mb-4">General Return Reason</h3>
            <textarea
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="Please provide a general reason for your return request..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
              rows="4"
              required
            />
          </motion.div>

          {/* Refund Summary */}
          {selectedItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-brand-brown mb-4">Refund Summary</h3>
              <div className="space-y-2">
                {selectedItems.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span>{item.name} × {item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                  <span>Total Refund:</span>
                  <span>₹{totalRefund}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-end gap-4"
          >
            <Link
              href="/my-orders"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || selectedItems.length === 0}
              className="px-6 py-3 bg-brand-gold text-white rounded-lg hover:bg-brand-brown transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <FiCheckCircle className="w-4 h-4" />
                  Submit Return Request
                </>
              )}
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default ReturnRequestPage;
