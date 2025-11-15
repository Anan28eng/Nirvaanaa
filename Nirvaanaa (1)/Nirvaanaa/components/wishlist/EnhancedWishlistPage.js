'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useEnhancedWishlist } from '@/components/providers/EnhancedWishlistProvider';
import { useEnhancedCart } from '@/components/providers/EnhancedCartProvider';
import { useSession } from 'next-auth/react';
import { FaTrash, FaShoppingCart, FaHeart, FaEye } from 'react-icons/fa';

import toast from 'react-hot-toast';

export default function EnhancedWishlistPage() {
  const { data: session } = useSession();
  const { 
    items, 
    removeFromWishlist, 
    clearWishlist, 
    getWishlistCount,
    isLoading 
  } = useEnhancedWishlist();
  
  const { addToCart } = useEnhancedCart();
  
  const [removingItems, setRemovingItems] = useState(new Set());
  const [addingToCart, setAddingToCart] = useState(new Set());

  const handleRemoveFromWishlist = async (productId) => {
    setRemovingItems(prev => new Set(prev).add(productId));
    try {
      await removeFromWishlist(productId);
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove from wishlist');
      console.error('Remove from wishlist error:', error);
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleAddToCart = async (product) => {
    setAddingToCart(prev => new Set(prev).add(product.id));
    try {
      await addToCart(product, 1);
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
      console.error('Add to cart error:', error);
    } finally {
      setAddingToCart(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }
  };

  const handleClearWishlist = async () => {
    if (confirm('Are you sure you want to clear your wishlist?')) {
      try {
        await clearWishlist();
        toast.success('Wishlist cleared');
      } catch (error) {
        toast.error('Failed to clear wishlist');
        console.error('Clear wishlist error:', error);
      }
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f3ea] to-[#e3e0d9] flex items-center justify-center">
        <div className="text-center">
          <FaHeart className="w-16 h-16 text-[#7c6a58] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#7c6a58] mb-2">Sign in to view your wishlist</h2>
          <p className="text-gray-600 mb-4">Please sign in to manage your wishlist</p>
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
      <div className="min-h-screen bg-gradient-to-br from-[#f5f3ea] to-[#e3e0d9] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7c6a58] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f3ea] to-[#e3e0d9] flex items-center justify-center">
        <div className="text-center">
          <FaHeart className="w-16 h-16 text-[#7c6a58] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#7c6a58] mb-2">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-4">Start shopping to add items to your wishlist</p>
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
    <div className="min-h-screen bg-gradient-to-br from-[#f5f3ea] to-[#e3e0d9] py-8">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[#7c6a58] mb-2">My Wishlist</h1>
          <p className="text-gray-600">{getWishlistCount()} items in your wishlist</p>
        </motion.div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-[#7c6a58]">Wishlist Items</h2>
            <button
              onClick={handleClearWishlist}
              className="text-red-500 hover:text-red-700 text-sm flex items-center space-x-1"
            >
              <FaTrash className="w-4 h-4" />
              <span>Clear Wishlist</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-gray-50 rounded-lg p-4 ${
                    removingItems.has(item.productId) ? 'opacity-50' : ''
                  }`}
                >
                  {/* Product Image */}
                  <div className="relative h-48 mb-4">
                    <Image
                      src={item.image || '/placeholder-product.jpg'}
                      alt={item.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveFromWishlist(item.productId)}
                      disabled={removingItems.has(item.productId)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                      title="Remove from wishlist"
                    >
                      {removingItems.has(item.productId) ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <FaTrash className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="space-y-3">
                    <Link href={`/products/${item.slug}`}>
                      <h3 className="text-lg font-semibold text-gray-800 hover:text-[#7c6a58] transition-colors">
                        {item.name}
                      </h3>
                    </Link>
                    
                    <p className="text-xl font-bold text-[#7c6a58]">
                      ₹{item.price?.toLocaleString('en-IN')}
                    </p>

                    {item.addedAt && (
                      <p className="text-xs text-gray-500">
                        Added on {new Date(item.addedAt).toLocaleDateString()}
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-2 pt-2">
                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={addingToCart.has(item.productId)}
                        className="flex-1 bg-[#bfae9e] text-white py-2 px-3 rounded-lg hover:bg-[#7c6a58] transition-colors disabled:opacity-50 flex items-center justify-center space-x-1"
                      >
                        {addingToCart.has(item.productId) ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Adding...</span>
                          </>
                        ) : (
                          <>
                            <FaShoppingCart className="w-4 h-4" />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>
                      
                      <Link href={`/products/${item.slug}`}>
                        <button className="bg-gray-200 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center">
                          <FaEye className="w-4 h-4" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
