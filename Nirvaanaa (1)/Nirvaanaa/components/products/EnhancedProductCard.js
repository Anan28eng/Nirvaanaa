'use client';

import React, { useState } from 'react';
import SafeImage from '@/components/ui/SafeImage';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEnhancedCart } from '@/components/providers/EnhancedCartProvider';
import { useEnhancedWishlist } from '@/components/providers/EnhancedWishlistProvider';
import { useSession } from 'next-auth/react';
import { FiHeart as Heart, FiShoppingCart as ShoppingCart, FiEye as Eye } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAdminStore } from '@/lib/stores';
import { mutate } from 'swr';


export default function EnhancedProductCard({ product }) {
  const { data: session } = useSession();
  const { addToCart, removeFromCart } = useEnhancedCart();
  const { addToWishlist, removeFromWishlist, hasItem } = useEnhancedWishlist();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  // Get reactive product from store
  const { products, updateProduct, addProduct } = useAdminStore();
  const liveProduct = products.find(p => p._id === product._id || p.id === product.id) || product;

  const isInStock = (liveProduct.inStock === true) || (typeof liveProduct.stock === 'number' ? liveProduct.stock > 0 : false);
  const salesCount = liveProduct.salesCount || 0;

  const handleAddToCart = async () => {
    if (!session) {
      toast.error('Please sign in to add items to cart');
      return;
    }

    // Check stock availability using live product data
    if (liveProduct.stock !== undefined && liveProduct.stock < 1) {
      toast.error('Product is out of stock');
      return;
    }
    
    // Additional check for zero stock
    if (liveProduct.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }

    setIsLoading(true);
    try {
      // compute effective price after discount
      const discountPct = typeof liveProduct.discount === 'number' ? liveProduct.discount : 0;
      const effectivePrice = Math.round((liveProduct.price * (1 - discountPct / 100)));
      // pass a normalized item (id, name, price, discount) and quantity
      await addToCart({ 
        id: liveProduct.id || liveProduct._id, 
        name: liveProduct.name || liveProduct.title, 
        price: effectivePrice, 
        discount: discountPct, 
        image: liveProduct.mainImage || liveProduct.images?.[0]?.url, 
        slug: liveProduct.slug 
      }, 1);
      
      toast.success('Added to cart!');
      
      // Ensure product exists in admin store, then update stock and sales count
      const productId = liveProduct.id || liveProduct._id;
      const existsInStore = products.some(p => p._id === productId || p.id === productId);
      if (!existsInStore) {
        // Add a full snapshot so other UIs render complete info from the store
        addProduct({
          _id: liveProduct._id,
          id: liveProduct.id,
          title: liveProduct.title || liveProduct.name,
          name: liveProduct.name || liveProduct.title,
          price: liveProduct.price,
          stock: liveProduct.stock,
          salesCount: liveProduct.salesCount || 0,
          ratings: liveProduct.ratings,
          category: liveProduct.category,
          slug: liveProduct.slug,
          mainImage: liveProduct.mainImage || liveProduct.images?.[0]?.url,
          discount: liveProduct.discount || 0,
          featured: liveProduct.featured || false,
          inStock: liveProduct.inStock,
        });
      }
      const newStock = Math.max(0, (liveProduct.stock || 0) - 1);
      const newSalesCount = (liveProduct.salesCount || 0) + 1;

      updateProduct(productId, {
        stock: newStock,
        salesCount: newSalesCount,
        inStock: newStock > 0
      });

      // Revalidate cart cache for user sessions (if any)
      if (session?.user?.email) {
        mutate(`/api/cart?email=${encodeURIComponent(session.user.email)}`);
        mutate('nirvaanaa-cart');
      }
    } catch (error) {
      toast.error('Failed to add to cart');
      console.error('Add to cart error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!session) {
      toast.error('Please sign in to manage wishlist');
      return;
    }

    setIsWishlistLoading(true);
    try {
      if (hasItem(liveProduct.id || liveProduct._id)) {
        await removeFromWishlist(liveProduct.id || liveProduct._id);
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist(liveProduct);
        toast.success('Added to wishlist!');
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
      console.error('Wishlist error:', error);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const isInWishlist = hasItem(liveProduct.id || liveProduct._id);

  return (
    <motion.div
      className="group relative bg-white rounded-xl shadow-soft overflow-hidden hover:shadow-nirvaanaa-hover transition-all duration-300 border border-nirvaanaa-primary/10"
      whileHover={{ y: -8 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ boxShadow: '0 2px 8px rgba(7, 30, 201, 0.08)' }}
    >
      {/* Product Image */}
      <div className="relative h-64 overflow-hidden rounded-t-xl">
        <SafeImage
          src={liveProduct.images?.[0]?.url || liveProduct.mainImage || '/placeholder-product.jpg'}
          alt={liveProduct.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          unoptimized={(liveProduct.images?.[0]?.url || liveProduct.mainImage || '').startsWith('http')}
        />
        
        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleAddToCart}
              disabled={isLoading}
              className="bg-white p-2 rounded-full shadow-lg hover:bg-nirvaanaa-secondary hover:text-white transition-all duration-300 disabled:opacity-50"
              title="Add to Cart"
            >
              <ShoppingCart className="w-5 h-5 text-nirvaanaa-secondary group-hover:text-white transition-colors" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleWishlistToggle}
              disabled={isWishlistLoading}
              className={`p-2 rounded-full shadow-lg transition-all duration-300 disabled:opacity-50 ${
                isInWishlist 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-white text-nirvaanaa-secondary hover:bg-nirvaanaa-primary'
              }`}
              title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
            </motion.button>
            
            <Link href={`/products/${liveProduct.slug}`}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="bg-white p-2 rounded-full shadow-lg hover:bg-nirvaanaa-primary hover:text-nirvaanaa-secondary transition-all duration-300"
                title="View Details"
              >
                <Eye className="w-5 h-5 text-nirvaanaa-secondary" />
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Wishlist Badge */}
        {isInWishlist && (
          <div className="absolute top-2 right-2">
            <div className="bg-red-500 text-white p-1 rounded-full">
              <Heart className="w-4 h-4 fill-current" />
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {(isLoading || isWishlistLoading) && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <Link href={`/products/${liveProduct.slug}`}>
          <h3 className="text-lg font-semibold text-nirvaanaa-secondary hover:text-nirvaanaa-primary transition-colors duration-300 mb-2">
            {liveProduct.title}
          </h3>
        </Link>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {liveProduct.description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-nirvaanaa-secondary">
            ₹{(liveProduct.price || 0).toLocaleString('en-IN')}
          </span>
          
          <div className="flex items-center space-x-2">
            {liveProduct.category && (
              <span className="text-xs bg-nirvaanaa-primary-lighter text-nirvaanaa-secondary px-2 py-1 rounded-full">
                {liveProduct.category}
              </span>
            )}
          </div>
        </div>

        {/* Stock Status */}
        <div className="mt-2 space-y-2">
          {/* Stock Status */}
          
          <div className="flex items-center justify-between">
            <span className={`text-xs ${isInStock ? 'text-green-600' : 'text-red-600'}`}>
        {isInStock ? 'In Stock' : 'Out of Stock'}
      </span>
      <span className="text-xs text-gray-500">
        {salesCount} sold
      </span>
          </div>

          
          {/* Ratings */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-4 h-4 ${
                    star <= (liveProduct.ratings?.average || 0)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {liveProduct.ratings?.average ? liveProduct.ratings.average.toFixed(1) : 'No ratings'} 
              {liveProduct.ratings?.count > 0 && ` (${liveProduct.ratings.count})`}
            </span>
          </div>
        </div>
      </div>

      {/* Add to Cart Button */}
      <div className="p-4 pt-0">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddToCart}
         
          disabled={isLoading || (liveProduct.stock !== undefined && liveProduct.stock <= 0)}
          className="w-full bg-[#bfae9e] text-white py-2 px-4 rounded-lg hover:bg-[#7c6a58] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Adding...</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Cart</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
