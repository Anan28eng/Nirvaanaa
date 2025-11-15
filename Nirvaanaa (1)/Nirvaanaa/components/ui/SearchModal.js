'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX } from 'react-icons/fi';
import Link from 'next/link';

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (query.trim()) {
      setIsLoading(true);
      // Fetch actual search results from API
      const searchProducts = async () => {
        try {
          const response = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=5`);
          const data = await response.json();
          
          if (response.ok && data.products) {
            setResults(data.products.map(product => ({
              id: product._id || product.id,
              title: product.title || product.name,
              slug: product.slug,
              price: product.price
            })));
          } else {
            setResults([]);
          }
        } catch (error) {
          console.error('Search error:', error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      };

      searchProducts();
    } else {
      setResults([]);
    }
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(query)}`;
    }
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
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="absolute top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Search Products</h3>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Search Form */}
              <form onSubmit={handleSubmit} className="p-4">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for products..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
              </form>

              {/* Results */}
              {query.trim() && (
                <div className="max-h-96 overflow-y-auto">
                  {isLoading ? (
                    <div className="p-4 text-center text-gray-500">
                      Searching...
                    </div>
                  ) : results.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {results.map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${product.slug}`}
                          className="block p-4 hover:bg-gray-50 transition-colors"
                          onClick={onClose}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{product.title}</h4>
                              <p className="text-sm text-gray-500">₹{product.price}</p>
                            </div>
                            <FiSearch className="text-gray-400" size={16} />
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No products found
                    </div>
                  )}
                </div>
              )}

              {/* Quick Links */}
              <div className="p-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Quick Links</h4>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/products?category=bags"
                    className="text-sm text-gold-600 hover:text-gold-700"
                    onClick={onClose}
                  >
                    Bags
                  </Link>
                  <Link
                    href="/products?category=sarees"
                    className="text-sm text-gold-600 hover:text-gold-700"
                    onClick={onClose}
                  >
                    Sarees
                  </Link>
                  <Link
                    href="/products?featured=true"
                    className="text-sm text-gold-600 hover:text-gold-700"
                    onClick={onClose}
                  >
                    Featured
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
