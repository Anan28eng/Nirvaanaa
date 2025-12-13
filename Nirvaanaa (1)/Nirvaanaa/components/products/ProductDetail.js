'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import SafeImage from '@/components/ui/SafeImage';
import Link from 'next/link';
import { useEnhancedCart } from '@/components/providers/EnhancedCartProvider';
import { useEnhancedWishlist } from '@/components/providers/EnhancedWishlistProvider';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { mutate } from 'swr';
import { FiShoppingCart, FiHeart, FiShare2, FiStar, FiTruck, FiShield, FiRefreshCw, FiEye, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import SocialShare from '@/components/ui/SocialShare';
import ProductReviews from './ProductReviews';
import ProductTestimonials from './ProductTestimonial';
import { useAdminStore } from '@/lib/stores';


const ProductDetail = ({ product }) => {
  const { addToCart } = useEnhancedCart();
  const { addToWishlist } = useEnhancedWishlist();
  const { data: session } = useSession();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [sameColorProducts, setSameColorProducts] = useState([]);
  
  // Get reactive product from store
  
  const { products, updateProduct, addProduct } = useAdminStore();

const storeProduct =
  products.find(p => p._id === product._id || p.id === product.id) || null;

const liveProduct = {
  ...product, // server product is source of truth
  ...(storeProduct
    ? {
        stock: storeProduct.stock,
        salesCount: storeProduct.salesCount,
        inStock: storeProduct.inStock,
      }
    : {}),
};

  
  // Get color variants from product and ensure unique hex codes
  // Use useMemo to prevent unnecessary recalculations and improve loading
 const colorVariants = useMemo(() => {
  const source =
    product.colorVariants?.length
      ? product.colorVariants
      : product.colors || [];

  if (!Array.isArray(source) || source.length === 0) return [];

  const hexMap = new Map();

  return source.map((color, index) => {
    let hex = color.hex || color.color || '#000000';

    if (!hex.startsWith('#')) hex = `#${hex}`;
    if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      hex = `#${(index * 123456).toString(16).padStart(6, '0').slice(0, 6)}`;
    }

    if (hexMap.has(hex.toLowerCase())) {
      hex = `#${(index * 654321).toString(16).padStart(6, '0').slice(0, 6)}`;
    }

    hexMap.set(hex.toLowerCase(), true);

    return {
      ...color,
      name: color.name || `Color ${index + 1}`,
      hex,
      images: color.images || [],
    };
  });
}, [product.colorVariants, product.colors]);


  // Initialize selectedColor to prevent hydration errors
  // Use useState with lazy initialization to ensure colorVariants is available
  // Initialize with first color variant if available to prevent hydration mismatch
const [selectedColor, setSelectedColor] = useState(null);

useEffect(() => {
  if (!colorVariants.length) return;

  setSelectedColor(prev => {
    if (!prev) return colorVariants[0];

    const stillExists = colorVariants.some(
      c => c.name === prev.name || c.hex === prev.hex
    );

    return stillExists ? prev : colorVariants[0];
  });
}, [colorVariants]);


  // Seed store with the provided product if it's missing so all UIs share one reactive source
  useEffect(() => {
    const productId = product.id || product._id;
    const exists = products.some(p => p._id === productId || p.id === productId);
    if (!exists && product) {
      addProduct({
        _id: product._id,
        id: product.id,
        title: product.title || product.name,
        name: product.name || product.title,
        price: product.price,
        stock: product.stock,
        salesCount: product.salesCount || 0,
        ratings: product.ratings,
        category: product.category,
        slug: product.slug,
        mainImage: product.mainImage,
        images: product.images || [],
        colors: product.colors || [],
        colorVariants: product.colorVariants || [],
        discount: product.discount || 0,
        featured: product.featured || false,
        inStock: product.inStock ?? (typeof product.stock === 'number' ? product.stock > 0 : false),
      });
    }
  }, [product, products, addProduct]);

  useEffect(() => {
    // Fetch related products
    const fetchRelatedProducts = async () => {
      try {
        const response = await fetch(`/api/products?category=${liveProduct.category}&limit=4&exclude=${liveProduct._id}`);
        const data = await response.json();
        setRelatedProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching related products:', error);
      }
    };

    fetchRelatedProducts();
  }, [liveProduct]);

  // Fetch products with same color when color is selected
  useEffect(() => {
    const fetchSameColorProducts = async () => {
      if (!selectedColor || !selectedColor.name) return;
      
      try {
        // Fetch all products and filter by color variant
        const response = await fetch(`/api/products?limit=100`);
        const data = await response.json();
        
        // Filter products that have the same color variant
        const filtered = (data.products || []).filter(p => {
          // Exclude current product
          if (p._id === liveProduct._id || p.id === liveProduct._id) return false;
          
          // Check if product has colorVariants with matching color name
          if (Array.isArray(p.colorVariants)) {
            return p.colorVariants.some(cv => 
              cv.name && cv.name.toLowerCase() === selectedColor.name.toLowerCase()
            );
          }
          return false;
        }).slice(0, 4); // Limit to 4 products
        
        setSameColorProducts(filtered);
      } catch (error) {
        console.error('Error fetching same color products:', error);
      }
    };

    fetchSameColorProducts();
  }, [selectedColor, liveProduct._id]);

  const handleAddToCart = async () => {
    if (isLoading) return;
    
    // Check stock availability using live product data
    if (liveProduct.stock !== undefined && liveProduct.stock < quantity) {
      toast.error(`Only ${liveProduct.stock} items available in stock`);
      return;
    }
    
    // Additional check for out of stock
    if (liveProduct.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }
    
    setIsLoading(true);
    try {
      const discountPct = typeof liveProduct.discount === 'number' ? liveProduct.discount : 0;
      const effectivePrice = Math.round((liveProduct.price * (1 - discountPct / 100)));
      
      // Get selected color variant image or use main image
      const selectedColorImage = selectedColor && selectedColor.images && selectedColor.images.length > 0 
        ? selectedColor.images[0] 
        : liveProduct.mainImage;
      
      await addToCart({ 
        id: liveProduct.id || liveProduct._id, 
        name: liveProduct.name || liveProduct.title, 
        price: effectivePrice, 
        discount: discountPct, 
        image: selectedColorImage || liveProduct.mainImage, 
        slug: liveProduct.slug,
        colorVariant: selectedColor ? {
          name: selectedColor.name,
          hex: selectedColor.hex,
          images: selectedColor.images || []
        } : null
      }, quantity);
      
      toast.success(`Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart!`);
      
      // Update stock and sales count in store
      const productId = liveProduct.id || liveProduct._id;
      const newStock = Math.max(0, (liveProduct.stock || 0) - quantity);
      const newSalesCount = (liveProduct.salesCount || 0) + quantity;

      updateProduct(productId, {
        stock: newStock,
        salesCount: newSalesCount,
        inStock: newStock > 0
      });
      
      // revalidate cart for user
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDimensions = (d) => {
    if (!d) return '';
    if (typeof d === 'string') return d;
    if (typeof d === 'object') {
      const unit = d.unit || '';
      // Common shape: { length, width, height, unit }
      if (d.length && d.width && d.height) {
        return `${d.length}${unit} × ${d.width}${unit} × ${d.height}${unit}`;
      }
      if (d.length && d.width) {
        return `${d.length}${unit} × ${d.width}${unit}`;
      }
      // Fallback: join key:value pairs
      try {
        return Object.entries(d).map(([k, v]) => `${k}: ${v}`).join(', ');
      } catch (e) {
        return String(d);
      }
    }
    return String(d);
  };

  const formatWeight = (w) => {
    if (!w) return '';
    if (typeof w === 'string' || typeof w === 'number') return String(w);
    if (typeof w === 'object') {
      if (w.value !== undefined && w.unit) return `${w.value}${w.unit}`;
      if (w.value !== undefined) return String(w.value);
      try {
        return Object.entries(w).map(([k, v]) => `${k}: ${v}`).join(', ');
      } catch (e) {
        return String(w);
      }
    }
    return String(w);
  };

  // Get available images based on selected color or default
  const getImagesForColor = (color) => {
    if (color && color.images && Array.isArray(color.images) && color.images.length > 0) {
      return color.images.map(img => typeof img === 'string' ? img : img?.url || '').filter(Boolean);
    }
    return [];
  };

  // Get current images based on selected color
  const currentColorImages = selectedColor ? getImagesForColor(selectedColor) : [];
  const defaultImages = [
    liveProduct.mainImage,
    ...(Array.isArray(liveProduct.images) ? liveProduct.images.map(img => (typeof img === 'string' ? img : img?.url || '')) : []),
  ].filter(Boolean);

  // Use color-specific images if available, otherwise use default images
  const images = currentColorImages.length > 0 ? currentColorImages : defaultImages;

  // Reset selected image when color changes
  useEffect(() => {
    if (selectedColor && images.length > 0) {
      setSelectedImage(0);
    }
  }, [selectedColor, images.length]);

  // If product is not yet provided, render a hydration-safe loading placeholder
  if (!liveProduct) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-96 bg-gray-200 rounded-2xl" />
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-6 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-brand-brown">
          <li>
            <Link href="/" className="hover:text-brand-gold transition-colors">
              Home
            </Link>
          </li>
          <li className="flex items-center">
            <span className="mx-2">/</span>
            <Link href="/products" className="hover:text-brand-gold transition-colors">
              Products
            </Link>
          </li>
          <li className="flex items-center">
            <span className="mx-2">/</span>
            <Link href={`/products?category=${liveProduct.category}`} className="hover:text-brand-gold transition-colors">
              {liveProduct.category}
            </Link>
          </li>
          <li className="flex items-center">
            <span className="mx-2">/</span>
            <span className="text-brand-brown">{liveProduct.title}</span>
          </li>
        </ol>
      </nav>

      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-lg group">
            {images[selectedImage] ? (
              <SafeImage
                src={images[selectedImage]}
                alt={`${liveProduct.title} - Handcrafted ${liveProduct.category?.replace(/-/g, ' ')} with traditional Indian embroidery in ${selectedColor?.name || 'default'} color`}
                fill
                className="object-cover"
                unoptimized={images[selectedImage]?.startsWith('http')}
              />
            ) : (
              <SafeImage
                src={null}
                alt="No Image Available"
                fill
                className="object-cover"
              />
            )}
            
            {/* Image Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  aria-label="Previous image"
                >
                  <FiChevronLeft className="w-6 h-6 text-brand-brown" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  aria-label="Next image"
                >
                  <FiChevronRight className="w-6 h-6 text-brand-brown" />
                </button>
              </>
            )}

            {/* Color Variant Navigation Arrows Overlay */}
            {colorVariants.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const currentIndex = colorVariants.findIndex(c => 
                      selectedColor && (
                        (c.name && selectedColor.name && c.name === selectedColor.name) || 
                        (c.hex && selectedColor.hex && c.hex === selectedColor.hex)
                      )
                    );
                    const prevIndex = currentIndex === -1 || currentIndex === 0 
                      ? colorVariants.length - 1 
                      : currentIndex - 1;
                    setSelectedColor(colorVariants[prevIndex]);
                  }}
                  className="absolute left-4 bottom-4 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  aria-label="Previous color variant"
                  title="Previous color"
                >
                  <FiChevronLeft className="w-5 h-5 text-brand-brown" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const currentIndex = colorVariants.findIndex(c => 
                      selectedColor && (
                        (c.name && selectedColor.name && c.name === selectedColor.name) || 
                        (c.hex && selectedColor.hex && c.hex === selectedColor.hex)
                      )
                    );
                    const nextIndex = currentIndex === -1 || currentIndex === colorVariants.length - 1 
                      ? 0 
                      : currentIndex + 1;
                    setSelectedColor(colorVariants[nextIndex]);
                  }}
                  className="absolute right-4 bottom-4 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  aria-label="Next color variant"
                  title="Next color"
                >
                  <FiChevronRight className="w-5 h-5 text-brand-brown" />
                </button>
                {/* Color Indicator Badge */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 rounded-full px-3 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <span className="text-xs font-medium text-brand-brown">
                    {selectedColor?.name || colorVariants[0]?.name || 'Color'} 
                    ({colorVariants.findIndex(c => 
                      selectedColor && (
                        (c.name && selectedColor.name && c.name === selectedColor.name) || 
                        (c.hex && selectedColor.hex && c.hex === selectedColor.hex)
                      )
                    ) + 1 || 1}/{colorVariants.length})
                  </span>
                </div>
              </>
            )}
            
            {/* Badges */}
            {liveProduct.discount > 0 && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-semibold px-3 py-1 rounded-full z-10">
                -{liveProduct.discount}% OFF
              </div>
            )}
            {liveProduct.featured && (
              <div className="absolute top-4 right-4 bg-brand-gold text-white text-sm font-semibold px-3 py-1 rounded-full z-10">
                Featured
              </div>
            )}
          </div>

          {/* Color Selection */}
          {colorVariants.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-brand-brown">
                  Color: {selectedColor?.name || colorVariants[0]?.name || 'Select Color'}
                </label>
                {colorVariants.length > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const currentIndex = colorVariants.findIndex(c => 
                          selectedColor && (
                            (c.name && selectedColor.name && c.name === selectedColor.name) || 
                            (c.hex && selectedColor.hex && c.hex === selectedColor.hex)
                          )
                        );
                        const prevIndex = currentIndex === -1 || currentIndex === 0 
                          ? colorVariants.length - 1 
                          : currentIndex - 1;
                        setSelectedColor(colorVariants[prevIndex]);
                      }}
                      className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                      aria-label="Previous color"
                      title="Previous color"
                    >
                      <FiChevronLeft className="w-5 h-5 text-brand-brown" />
                    </button>
                    <span className="text-xs text-gray-500">
                      {(colorVariants.findIndex(c => 
                        selectedColor && (
                          (c.name && selectedColor.name && c.name === selectedColor.name) || 
                          (c.hex && selectedColor.hex && c.hex === selectedColor.hex)
                        )
                      ) + 1) || 1} / {colorVariants.length}
                    </span>
                    <button
                      onClick={() => {
                        const currentIndex = colorVariants.findIndex(c => 
                          selectedColor && (
                            (c.name && selectedColor.name && c.name === selectedColor.name) || 
                            (c.hex && selectedColor.hex && c.hex === selectedColor.hex)
                          )
                        );
                        const nextIndex = currentIndex === -1 || currentIndex === colorVariants.length - 1 
                          ? 0 
                          : currentIndex + 1;
                        setSelectedColor(colorVariants[nextIndex]);
                      }}
                      className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                      aria-label="Next color"
                      title="Next color"
                    >
                      <FiChevronRight className="w-5 h-5 text-brand-brown" />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {colorVariants.map((color, index) => {
                  const colorName = color.name || `Color ${index + 1}`;
                  const colorHex = color.hex || '#000000';
                  const isSelected = selectedColor && (
                    (selectedColor.name && color.name && selectedColor.name === color.name) || 
                    (selectedColor.hex && color.hex && selectedColor.hex === color.hex) ||
                    (selectedColor === color)
                  );

                  return (
                    <button
                      key={`${colorName}-${colorHex}-${index}`}
                      onClick={() => setSelectedColor(color)}
                      className={`relative flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-brand-gold bg-brand-gold bg-opacity-10 shadow-md'
                          : 'border-gray-300 hover:border-brand-gold hover:bg-gray-50'
                      }`}
                      title={`${colorName} (${colorHex})`}
                    >
                      <div
                        className="w-6 h-6 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: colorHex }}
                      />
                      <span className={`text-sm font-medium ${isSelected ? 'text-brand-brown' : 'text-gray-700'}`}>
                        {colorName}
                      </span>
                      {isSelected && (
                        <svg className="w-4 h-4 text-brand-gold" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            // Debug: Show if product has color data but variants are empty
            liveProduct.colorVariants || liveProduct.colors ? (
              <div className="text-xs text-gray-400 p-2 bg-gray-50 rounded">
                Color variants data found but not properly formatted. Please check product data.
              </div>
            ) : null
          )}

          {/* Thumbnail Images */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index 
                      ? 'border-brand-gold shadow-md' 
                      : 'border-gray-200 hover:border-brand-gold'
                  }`}
                >
                  <SafeImage
                    src={image || null}
                    alt={`${liveProduct.title} ${selectedColor?.name ? `in ${selectedColor.name} color` : ''} - Handcrafted embroidery product detail view ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized={image?.startsWith('http')}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-playfair font-bold text-brand-brown mb-2">
              {liveProduct.title || liveProduct.name}
            </h1>
            <p className="text-brand-brown text-lg">
              {liveProduct.description}
            </p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex text-brand-gold">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(liveProduct.ratings?.average || 0) ? 'fill-current' : 'fill-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-brand-brown">
                {liveProduct.ratings?.average ? liveProduct.ratings.average.toFixed(1) : '0'} 
                {liveProduct.ratings?.count > 0 && ` (${liveProduct.ratings.count} reviews)`}
              </span>
            </div>
            <span className="text-brand-brown">•</span>
            <span className="text-brand-brown">{liveProduct.salesCount || 0} sold</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-4">
            {liveProduct.discount > 0 ? (
              <>
                <span className="text-3xl font-bold text-brand-brown">
                  {formatPrice((liveProduct.price || 0) * (1 - ((liveProduct.discount || 0) / 100)))}
                </span>
                <span className="text-xl text-gray-500 line-through">
                  {formatPrice(liveProduct.price || 0)}
                </span>
                <span className="text-lg text-red-600 font-semibold">
                  Save {formatPrice((liveProduct.price || 0) * ((liveProduct.discount || 0) / 100))}
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold text-brand-brown">
                {formatPrice(liveProduct.price || 0)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            {/** Normalized availability check so inStock (sometimes undefined) or stock number both work */}
            {(() => {
              const available = liveProduct.inStock || (typeof liveProduct.stock === 'number' && liveProduct.stock > 0);
              return (
                <>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                    available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {available ? 'In Stock' : 'Out of Stock'}
                  </span>
                  {available && (
                    <span className="text-sm text-brand-brown">
                      {liveProduct.stock || 0} available
                    </span>
                  )}
                </>
              );
            })()}
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-brand-brown">
              Quantity
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
              >
                -
              </button>
              <span className="w-16 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(liveProduct.stock || 0, quantity + 1))}
                disabled={quantity >= (liveProduct.stock || 0) || liveProduct.stock === 0}
                className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleAddToCart}
              disabled={isLoading || (liveProduct.stock !== undefined && liveProduct.stock <= 0)}
              className="flex-1 btn-primary text-lg py-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <FiShoppingCart className="w-5 h-5" />
                  Add to Cart
                </>
              )}
            </button>
            
            <button
              onClick={async () => {
                try {
                  const discountPct = typeof liveProduct.discount === 'number' ? liveProduct.discount : 0;
                  const effectivePrice = Math.round((liveProduct.price || 0) * (1 - discountPct / 100));
                  await addToWishlist({
                    id: liveProduct._id || liveProduct.id,
                    name: liveProduct.title || liveProduct.name,
                    price: effectivePrice,
                    discount: discountPct,
                    image: liveProduct.mainImage,
                    slug: liveProduct.slug,
                  });
                  toast.success('Saved to wishlist');
                } catch (err) {
                  console.error(err);
                  toast.error('Failed to save to wishlist');
                }
              }}
              className="px-6 py-4 border-2 border-brand-gold text-brand-gold rounded-xl hover:bg-grand-gold transition-colors flex items-center justify-center gap-2"
            >
              <FiHeart className="w-5 h-5" />
              Wishlist
            </button>
            
            <SocialShare product={liveProduct} />
          </div>

          {/* Product Details */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-brand-brown">Product Details</h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-brand-brown">Category:</span>
                <span className="ml-2 text-brand-brown capitalize">{liveProduct.category}</span>
              </div>
              <div>
                <span className="text-brand-brown">SKU:</span>
                <span className="ml-2 text-brand-brown">{liveProduct.SKU}</span>
              </div>
              {liveProduct.dimensions && (
                <div>
                  <span className="text-brand-brown">Dimensions:</span>
                  <span className="ml-2 text-brand-brown">{formatDimensions(liveProduct.dimensions)}</span>
                </div>
              )}
              {liveProduct.weight && (
                <div>
                  <span className="text-brand-brown">Weight:</span>
                  <span className="ml-2 text-brand-brown">{formatWeight(liveProduct.weight)}</span>
                </div>
              )}
            </div>

            {liveProduct.tags && liveProduct.tags.length > 0 && (
              <div>
                <span className="text-brand-brown text-sm">Tags:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {liveProduct.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-brand-gold text-white rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Care Instructions */}
          {liveProduct.careInstructions && (
            <div className="space-y-2 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-brand-brown">Care Instructions</h3>
              <p className="text-brand-brown text-sm">{liveProduct.careInstructions}</p>
            </div>
          )}

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <FiTruck className="w-6 h-6 text-brand-gold" />
              <div>
                <div className="font-medium text-brand-brown">Free Shipping</div>
                <div className="text-sm text-brand-brown">On orders over ₹1000</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FiShield className="w-6 h-6 text-brand-gold" />
              <div>
                <div className="font-medium text-brand-brown">Secure Payment</div>
                <div className="text-sm text-brand-brown">100% secure checkout</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FiRefreshCw className="w-6 h-6 text-brand-gold" />
              <div>
                <div className="font-medium text-brand-brown">Easy Returns</div>
                <div className="text-sm text-brand-brown">30-day return policy</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Reviews */}
      <div className="mt-12">
        <ProductReviews productId={liveProduct._id} />
      </div>

      <div className='mt-12'>
        <ProductTestimonials productId={liveProduct._id} />
      </div>

      {/* Same Color Products */}
      {sameColorProducts.length > 0 && selectedColor && (
        <div className="border-t border-gray-200 pt-12">
          <h2 className="text-2xl font-playfair font-bold text-brand-brown mb-4">
            More Products in {selectedColor.name}
          </h2>
          <p className="text-brand-brown mb-8">Explore other products available in this color</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sameColorProducts.map((sameColorProduct) => (
              <motion.div
                key={sameColorProduct._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <Link href={`/products/${sameColorProduct.slug}`} className="block">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {sameColorProduct.mainImage ? (
                      <SafeImage
                        src={sameColorProduct.mainImage}
                        alt={sameColorProduct.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        unoptimized={sameColorProduct.mainImage?.startsWith('http')}
                      />
                    ) : (
                      <SafeImage src={null} alt="No Image" fill className="object-cover" />
                    )}
                    
                    {sameColorProduct.discount > 0 && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        -{sameColorProduct.discount}%
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-brand-brown mb-2 line-clamp-2 group-hover:text-brand-gold transition-colors">
                      {sameColorProduct.title}
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {sameColorProduct.discount > 0 ? (
                          <>
                            <span className="font-bold text-brand-brown">
                              {formatPrice(sameColorProduct.price * (1 - sameColorProduct.discount / 100))}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(sameColorProduct.price)}
                            </span>
                          </>
                        ) : (
                          <span className="font-bold text-brand-brown">
                            {formatPrice(sameColorProduct.price)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex text-brand-gold">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(sameColorProduct.ratings?.average || 0) ? 'fill-current' : 'fill-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className={`border-t border-gray-200 pt-12 ${sameColorProducts.length > 0 ? 'mt-12' : ''}`}>
          <h2 className="text-2xl font-playfair font-bold text-brand-brown mb-8">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <motion.div
                key={relatedProduct._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <Link href={`/products/${relatedProduct.slug}`} className="block">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {relatedProduct.mainImage ? (
                      <SafeImage
                        src={relatedProduct.mainImage}
                        alt={`${relatedProduct.title} - Related handcrafted ${relatedProduct.category?.replace(/-/g, ' ')} with traditional embroidery`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        unoptimized={relatedProduct.mainImage?.startsWith('http')}
                      />
                    ) : (
                      <SafeImage src={null} alt="No Image" fill className="object-cover" />
                    )}
                    
                    {relatedProduct.discount > 0 && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        -{relatedProduct.discount}%
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-brand-brown mb-2 line-clamp-2 group-hover:text-brand-gold transition-colors">
                      {relatedProduct.title}
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {relatedProduct.discount > 0 ? (
                          <>
                            <span className="font-bold text-brand-brown">
                              {formatPrice(relatedProduct.price * (1 - relatedProduct.discount / 100))}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(relatedProduct.price)}
                            </span>
                          </>
                        ) : (
                          <span className="font-bold text-brand-brown">
                            {formatPrice(relatedProduct.price)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex text-brand-gold">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(relatedProduct.ratings?.average || 0) ? 'fill-current' : 'fill-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail; 

