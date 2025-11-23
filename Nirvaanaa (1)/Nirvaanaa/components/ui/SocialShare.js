'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShare2, FiX, FiInstagram, FiCopy } from 'react-icons/fi';
import toast from 'react-hot-toast';

const SocialShare = ({ product, url }) => {
  const [isOpen, setIsOpen] = useState(false);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = `Check out this amazing ${product?.title || 'product'} from Nirvaanaa!`;
  const shareImage = product?.mainImage || product?.images?.[0]?.url;

  const shareOptions = [
    {
      name: 'Instagram',
      icon: FiInstagram,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
      action: () => {
        // Instagram doesn't support direct sharing, so we'll copy the link
        navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied! You can now paste it in your Instagram story or post.');
      }
    },
    {
      name: 'Copy Link',
      icon: FiCopy,
      color: 'bg-gray-600 hover:bg-gray-700',
      action: () => {
        navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
      }
    }
  ];

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/917763853089?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="relative">
      {/* Share Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-white rounded-lg hover:bg-brand-brown transition-colors"
      >
        <FiShare2 className="w-4 h-4" />
        Share
      </button>

      {/* Share Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 p-6 w-full max-w-md mx-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-brand-brown">Share Product</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiX className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Product Preview */}
              {product && (
                <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-lg">
                  {shareImage && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                      <img
                        src={shareImage}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-brand-brown text-sm line-clamp-2">
                      {product.title}
                    </h4>
                    <p className="text-xs text-gray-600">
                      {product.price && `₹${product.price}`}
                    </p>
                  </div>
                </div>
              )}

              {/* Share Options */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700 mb-3">Share on:</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  {shareOptions.map((option) => (
                    <button
                      key={option.name}
                      onClick={() => {
                        option.action();
                        setIsOpen(false);
                      }}
                      className={`flex items-center gap-3 p-3 rounded-lg text-white transition-colors ${option.color}`}
                    >
                      <option.icon className="w-5 h-5" />
                      <span className="font-medium">{option.name}</span>
                    </button>
                  ))}
                </div>

                {/* WhatsApp Share */}
                <button
                  onClick={() => {
                    handleWhatsAppShare();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  <span className="font-medium">WhatsApp</span>
                </button>
              </div>

              {/* URL Display */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Share URL:</p>
                <p className="text-sm text-gray-800 break-all">{shareUrl}</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SocialShare;
