'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import { useEnhancedCart } from '@/components/providers/EnhancedCartProvider';
import Link from 'next/link';
import Image from 'next/image';
import DummyCheckoutButton from './dummypay';

export default function CartDrawer({ isOpen, onClose }) {
  const { items, updateQuantity, removeItem, getCartTotal } = useEnhancedCart();

  const handleRemove = async (productId) => {
    try {
      await removeItem(productId);
      // toast handled higher up usually; show immediate feedback
      // (importing toast here would add extra dependency, so rely on calling component's toast)
    } catch (err) {
      console.error('Remove from cart failed', err);
    }
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(productId, newQuantity);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <FiShoppingBag size={24} className="text-brand-gold" />
                <h3 className="text-lg font-semibold text-gray-900">Shopping Cart</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 p-8 text-center">
                  <FiShoppingBag size={48} className="text-gray-300 mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h4>
                  <p className="text-gray-500 mb-6">Add some beautiful handcrafted items to get started</p>
                  <Link
                    href="/products"
                    className="btn-primary hover:text-white"
                    onClick={onClose}
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex space-x-4 p-4 bg-gray-50 rounded-lg">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <Image
                          src={item.image || '/images/placeholder-product.jpg'}
                          alt={item.name}
                          width={60}
                          height={60}
                          className="rounded-md object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-500">{formatPrice(item.price)}</p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-100"
                          >
                            -
                          </button>
                          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 p-4">
                {/* Subtotal */}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-medium text-gray-900">Subtotal</span>
                  <span className="text-lg font-bold text-brand-gold">{formatPrice(getCartTotal())}</span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Link
                    href="/cart"
                    className="block w-full text-center py-3 px-4 border-2 border-brand-gold text-brand-gold rounded-lg font-medium hover:bg-brand-gold hover:text-white transition-colors"
                    onClick={onClose}
                  >
                    View Cart
                  </Link>
                  <Link
                    href="/my-orders"
                    className="block w-full text-center py-3 px-4 border-2 border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                    onClick={onClose}
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/checkout"
                    className="block w-full text-center py-3 px-4 bg-brand-gold text-white rounded-lg font-medium hover:bg-accent-600 transition-colors"
                    onClick={onClose}
                  >
                    Checkout
                  </Link>
                </div>

                {/* Shipping Info */}
                <p className="text-xs text-gray-500 text-center mt-3">
                  Free shipping on orders over ₹2000
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
