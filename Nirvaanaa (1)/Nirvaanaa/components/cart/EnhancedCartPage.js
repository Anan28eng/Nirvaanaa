'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useEnhancedCart } from '@/components/providers/EnhancedCartProvider';
import { useSession } from 'next-auth/react';
import { FaTrash, FaMinus, FaPlus, FaShoppingBag, FaHeart } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function EnhancedCartPage() {
  const { data: session } = useSession();
  const { 
    items, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    getCartTotal, 
    getCartCount,
    isLoading 
  } = useEnhancedCart();

  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(null);

  useEffect(() => {
    const fetchShippingMethods = async () => {
      try {
        const response = await fetch('/api/shipping');
        if (response.ok) {
          const data = await response.json();
          const methods = data.methods || [];
          setShippingMethods(methods);
          // Set default shipping method
          const defaultMethod = methods.find(method => method.isDefault) || methods[0];
          if (defaultMethod) {
            setSelectedShippingMethod(defaultMethod);
          }
        }
      } catch (error) {
        console.error('Error fetching shipping methods:', error);
      }
    };
    fetchShippingMethods();
  }, []);
  
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [removingItems, setRemovingItems] = useState(new Set());

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdatingItems(prev => new Set(prev).add(productId));
    try {
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      toast.error('Failed to update quantity');
      console.error('Update quantity error:', error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (productId) => {
    setRemovingItems(prev => new Set(prev).add(productId));
    try {
      await removeFromCart(productId);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
      console.error('Remove item error:', error);
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleClearCart = async () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      try {
        await clearCart();
        toast.success('Cart cleared');
      } catch (error) {
        toast.error('Failed to clear cart');
        console.error('Clear cart error:', error);
      }
    }
  };

  if (!session) {
    return (
    <div className="min-h-screen bg-nirvaanaa-offwhite flex items-center justify-center">
        <div className="text-center">
          <FaShoppingBag className="w-16 h-16 text-[#7c6a58] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#7c6a58] mb-2">Sign in to view your cart</h2>
          <p className="text-gray-600 mb-4">Please sign in to manage your shopping cart</p>
          <Link href="/auth/signin">
            <button className="bg-[#bfae9e] text-white px-6 py-2 rounded-lg hover:bg-[#7c6a58] transition-colors">
              Sign In
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
    <div className="min-h-screen bg-nirvaanaa-offwhite flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7c6a58] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f3ea] to-[#e3e0d9] flex items-center justify-center">
        <div className="text-center">
          <FaShoppingBag className="w-16 h-16 text-[#7c6a58] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#7c6a58] mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-4">Start shopping to add items to your cart</p>
          <Link href="/products">
            <button className="bg-[#bfae9e] text-white px-6 py-2 rounded-lg hover:bg-[#7c6a58] transition-colors">
              Browse Products
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nirvaanaa-offwhite py-8">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[#7c6a58] mb-2">Shopping Cart</h1>
          <p className="text-gray-600">{getCartCount()} items in your cart</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-[#7c6a58]">Cart Items</h2>
                <button
                  onClick={handleClearCart}
                  className="text-red-500 hover:text-red-700 text-sm flex items-center space-x-1"
                >
                  <FaTrash className="w-4 h-4" />
                  <span>Clear Cart</span>
                </button>
              </div>

              <AnimatePresence>
                {items.map((item, index) => (
                  <motion.div
                    key={item.productId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className={`border-b border-gray-200 pb-6 mb-6 last:border-b-0 last:mb-0 ${
                      removingItems.has(item.productId) ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      {/* Product Image */}
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <Image
                          src={item.image || '/placeholder-product.jpg'}
                          alt={`${item.name} ${item.colorVariant ? `in ${item.colorVariant.name} color` : ''} - Handcrafted embroidery product in shopping cart`}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${item.slug}`}>
                          <h3 className="text-lg font-semibold text-gray-800 hover:text-[#7c6a58] transition-colors">
                            {item.name}
                          </h3>
                        </Link>
                        <p className="text-gray-600 text-sm">₹{item.price?.toLocaleString('en-IN')}</p>
                        {item.colorVariant && (
                          <div className="flex items-center gap-2 mt-1">
                            <div
                              className="w-4 h-4 rounded-full border border-gray-300"
                              style={{ backgroundColor: item.colorVariant.hex }}
                              title={item.colorVariant.name}
                            />
                            <span className="text-xs text-gray-500">{item.colorVariant.name}</span>
                          </div>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                          disabled={updatingItems.has(item.productId) || item.quantity <= 1}
                          className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FaMinus className="w-4 h-4" />
                        </button>
                        
                        <span className="w-12 text-center font-semibold">
                          {updatingItems.has(item.productId) ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#7c6a58] mx-auto"></div>
                          ) : (
                            item.quantity
                          )}
                        </span>
                        
                        <button
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                          disabled={updatingItems.has(item.productId)}
                          className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                        >
                          <FaPlus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="font-semibold text-[#7c6a58]">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.productId)}
                        disabled={removingItems.has(item.productId)}
                        className="text-red-500 hover:text-red-700 p-2 disabled:opacity-50"
                        title="Remove item"
                      >
                        {removingItems.has(item.productId) ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                        ) : (
                          <FaTrash className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>    
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-lg p-6 sticky top-8"
            >
              <h2 className="text-xl font-semibold text-[#7c6a58] mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({getCartCount()} items)</span>
                  <span className="font-semibold">₹{getCartTotal().toLocaleString('en-IN')}</span>
                </div>
                
                {/* Shipping Method Selection */}
                {shippingMethods.length > 0 && (
                  <div className="border-t pt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shipping Method
                    </label>
                    <select
                      value={selectedShippingMethod?._id || ''}
                      onChange={(e) => {
                        const method = shippingMethods.find(m => m._id === e.target.value);
                        setSelectedShippingMethod(method);
                      }}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7c6a58] focus:border-transparent"
                    >
                      {shippingMethods.map((method) => (
                        <option key={method._id} value={method._id}>
                          {method.name} - ₹{method.cost} ({method.estimatedDays?.min}-{method.estimatedDays?.max} days)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">
                    {selectedShippingMethod ? (
                      (() => {
                        const shippingCost = selectedShippingMethod.cost || 0;
                        return shippingCost === 0 ? (
                          <span className="text-gray-400">₹0</span>
                        ) : (
                          `₹${shippingCost.toLocaleString('en-IN')}`
                        );
                      })()
                    ) : (
                      <span className="text-gray-400">Select method</span>
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (GST 18%)</span>
                  <span className="font-semibold">
                    {(() => {
                      const subtotal = getCartTotal();
                      const shippingCost = selectedShippingMethod 
                        ? (selectedShippingMethod.cost || 0)
                        : 0;
                      // Tax is calculated on subtotal + shipping cost
                      const tax = Math.round((subtotal + shippingCost) * 0.18);
                      return `₹${tax.toLocaleString('en-IN')}`;
                    })()}
                  </span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-[#7c6a58]">Total</span>
                    <span className="text-lg font-bold text-[#7c6a58]">
                      {(() => {
                        const subtotal = getCartTotal();
                        const shippingCost = selectedShippingMethod 
                          ? (selectedShippingMethod.cost || 0)
                          : 0;
                        // Tax is calculated on subtotal + shipping cost
                        const tax = Math.round((subtotal + shippingCost) * 0.18);
                        const total = subtotal + shippingCost + tax;
                        return `₹${total.toLocaleString('en-IN')}`;
                      })()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 text-right">
                    Includes shipping & tax
                  </div>
                </div>
              </div>

              <Link href="/checkout">
                <button className="w-full bg-[#bfae9e] text-white py-3 px-4 rounded-lg hover:bg-[#7c6a58] transition-colors font-semibold">
                  Proceed to Checkout
                </button>
              </Link>
              
              

              <div className="mt-4 text-center">
                <Link href="/products">
                  <button className="text-[#7c6a58] hover:text-[#bfae9e] transition-colors text-sm">
                    Continue Shopping
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
