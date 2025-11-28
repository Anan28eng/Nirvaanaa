'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useEnhancedCart } from '@/components/providers/EnhancedCartProvider';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { FiShoppingCart, FiHeart, FiEye, FiGrid, FiList } from 'react-icons/fi';
import { useAdminStore } from '@/lib/stores';

const ProductCard = ({ product }) => {
  const { addToCart } = useEnhancedCart();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get reactive product from store
  const { products, updateProduct } = useAdminStore();
  const liveProduct = products.find(p => p._id === product._id || p.id === product.id) || product;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    
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
      await addToCart({ 
        id: liveProduct.id || liveProduct._id, 
        name: liveProduct.name || liveProduct.title, 
        price: liveProduct.price, 
        image: liveProduct.mainImage, 
        slug: liveProduct.slug 
      }, 1);
      
      toast.success('Added to cart!');
      
      // Update stock and sales count in store
      const productId = liveProduct.id || liveProduct._id;
      const newStock = Math.max(0, (liveProduct.stock || 0) - 1);
      const newSalesCount = (liveProduct.salesCount || 0) + 1;

      updateProduct(productId, {
        stock: newStock,
        salesCount: newSalesCount
      });
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="group relative bg-white rounded-xl shadow-soft hover:shadow-nirvaanaa-hover transition-all duration-300 overflow-hidden border border-nirvaanaa-primary/10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ boxShadow: '0 2px 8px rgba(7, 30, 201, 0.08)' }}
    >
      <Link href={`/products/${liveProduct.slug}`} className="block">
        {/* Product Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {liveProduct.mainImage ? (
            <Image
              src={liveProduct.mainImage}
              alt={`${liveProduct.title} - Handcrafted ${liveProduct.category?.replace(/-/g, ' ')} with traditional Indian embroidery patterns`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized={liveProduct.mainImage?.startsWith('http')}
              priority={false}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm">No Image</span>
            </div>
          )}
          
          {/* Quick Actions Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center gap-3"
          >
            <button
              onClick={handleAddToCart}
              disabled={isLoading}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-nirvaanaa-secondary hover:text-white transition-all duration-300"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-nirvaanaa-secondary border-t-transparent rounded-full animate-spin" />
              ) : (
                <FiShoppingCart className="w-5 h-5 text-nirvaanaa-secondary" />
              )}
            </button>
            <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-nirvaanaa-primary hover:text-nirvaanaa-secondary transition-all duration-300">
              <FiHeart className="w-5 h-5 text-nirvaanaa-secondary" />
            </button>
            <button
              onClick={(e) => {
                // prevent the parent Link click and navigate programmatically
                e.preventDefault();
                e.stopPropagation();
                router.push(`/products/${liveProduct.slug}`);
              }}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-nirvaanaa-primary hover:text-nirvaanaa-secondary transition-all duration-300"
            >
              <FiEye className="w-5 h-5 text-nirvaanaa-secondary" />
            </button>
          </motion.div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {liveProduct.discount > 0 && (
              <div className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                -{liveProduct.discount}%
              </div>
            )}
            {liveProduct.tags && liveProduct.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {liveProduct.tags.slice(0, 2).map((tag, index) => (
                  <div key={index} className="bg-nirvaanaa-secondary text-white text-xs font-semibold px-2 py-1 rounded-full">
                    {tag}
                  </div>
                ))}
                {liveProduct.tags.length > 2 && (
                  <div className="bg-gray-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    +{liveProduct.tags.length - 2}
                  </div>
                )}
              </div>
            )}
          </div>
          {liveProduct.featured && (
            <div className="absolute top-3 right-3 bg-nirvaanaa-primary text-nirvaanaa-secondary text-xs font-semibold px-2 py-1 rounded-full">
              Featured
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-semibold text-nirvaanaa-secondary mb-2 line-clamp-2 group-hover:text-nirvaanaa-primary transition-colors duration-300">
            {liveProduct.title}
          </h3>
          
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {liveProduct.discount > 0 ? (
                <>
                  <span className="text-lg font-bold text-nirvaanaa-secondary">
                    {formatPrice(liveProduct.price * (1 - liveProduct.discount / 100))}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(liveProduct.price)}
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold text-nirvaanaa-secondary">
                  {formatPrice(liveProduct.price)}
                </span>
              )}
            </div>
            
            {/* Rating */}
            <div className="flex items-center gap-1">
              <div className="flex text-nirvaanaa-primary">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(liveProduct.ratings?.average || 0) ? 'fill-current' : 'fill-gray-300'}`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs text-gray-500">({liveProduct.ratings?.average || 0})</span>
            </div>
          </div>

          {/* Stock Status */}
          <div className="flex items-center justify-between">
            <span className={`text-xs ${liveProduct.inStock || (typeof liveProduct.stock === 'number' && liveProduct.stock > 0) ? 'text-green-600' : 'text-red-600'}`}>
              {liveProduct.inStock || (typeof liveProduct.stock === 'number' && liveProduct.stock > 0) ? 'In Stock' : 'Out of Stock'}
            </span>
            <span className="text-xs text-gray-500">
              {liveProduct.salesCount || 0} sold
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const ProductGrid = ({ searchParams }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('newest');

  const productsPerPage = 12;
  
  // Get reactive products from store
  const { products: storeProducts } = useAdminStore();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        
        // Add search params
        if (searchParams.category) params.append('category', searchParams.category);
        if (searchParams.search) params.append('search', searchParams.search);
        if (searchParams.minPrice) params.append('minPrice', searchParams.minPrice);
        if (searchParams.maxPrice) params.append('maxPrice', searchParams.maxPrice);
        if (searchParams.tags) params.append('tags', searchParams.tags);
        if (searchParams.featured) params.append('featured', searchParams.featured);
        if (searchParams.inStock) params.append('inStock', searchParams.inStock);
        
        // Add pagination
        params.append('page', currentPage);
        params.append('limit', productsPerPage);
        
        // Map UI sort values to backend sort and order
        let sortField = 'createdAt';
        let sortOrder = 'desc';
        switch (sortBy) {
          case 'newest': sortField = 'createdAt'; sortOrder = 'desc'; break;
          case 'oldest': sortField = 'createdAt'; sortOrder = 'asc'; break;
          case 'price-low': sortField = 'price'; sortOrder = 'asc'; break;
          case 'price-high': sortField = 'price'; sortOrder = 'desc'; break;
          case 'rating': sortField = 'ratings.average'; sortOrder = 'desc'; break;
          case 'popular': sortField = 'salesCount'; sortOrder = 'desc'; break;
          default: sortField = 'createdAt'; sortOrder = 'desc';
        }
        params.append('sort', sortField);
        params.append('order', sortOrder);

        const response = await fetch(`/api/products?${params.toString()}`);
        const data = await response.json();
        
        if (response.ok) {
          // Merge fetched products with store products to get latest data
          // Preserve mainImage from fetched product to prevent it from being overwritten
          const mergedProducts = (data.products || []).map(fetchedProduct => {
            const storeProduct = storeProducts.find(p => p._id === fetchedProduct._id || p.id === fetchedProduct.id);
            if (storeProduct) {
              // Preserve mainImage from fetched product, only merge other fields
              const { mainImage: fetchedImage, ...fetchedRest } = fetchedProduct;
              const { mainImage: storeImage, ...storeRest } = storeProduct;
              return { 
                ...fetchedRest, 
                ...storeRest,
                mainImage: fetchedImage || storeImage || null
              };
            }
            return fetchedProduct;
          });
          
          // Sort products to put out-of-stock items at the end
          const sortedProducts = mergedProducts.sort((a, b) => {
            const aInStock = a.inStock || (typeof a.stock === 'number' && a.stock > 0);
            const bInStock = b.inStock || (typeof b.stock === 'number' && b.stock > 0);
            
            // If both have same stock status, maintain original order
            if (aInStock === bInStock) return 0;
            
            // In-stock items come first
            return aInStock ? -1 : 1;
          });
          
          setProducts(sortedProducts);
          setTotalProducts(data.totalProducts || 0);
        } else {
          console.error('Failed to fetch products:', data.error);
          toast.error('Failed to load products');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams, currentPage, sortBy, storeProducts]);

  const totalPages = Math.ceil(totalProducts / productsPerPage);

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-48"></div>
          <div className="h-8 bg-gray-200 rounded animate-pulse w-32"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
              <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-playfair font-bold text-brand-brown">
            {searchParams.category ? `${searchParams.category} Collection` : 'All Products'}
          </h2>
          <p className="text-brand-brown">
            Showing {products.length} of {totalProducts} products
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="popular">Most Popular</option>
          </select>

          {/* View Mode */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-brand-gold text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <FiGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-brand-gold text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <FiList className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <>
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
      {products.map((product, index) => (
              <motion.div
        key={product.id || product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-nirvaanaa-primary/30 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-nirvaanaa-primary-lighter hover:border-nirvaanaa-primary text-nirvaanaa-secondary transition-all duration-300"
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  const isActive = page === currentPage;
                  const isNearActive = Math.abs(page - currentPage) <= 2;
                  
                  if (page === 1 || page === totalPages || isNearActive) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                          isActive 
                            ? 'bg-nirvaanaa-secondary text-white shadow-nirvaanaa' 
                            : 'border border-nirvaanaa-primary/30 hover:bg-nirvaanaa-primary-lighter hover:border-nirvaanaa-primary text-nirvaanaa-secondary'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 3 || page === currentPage + 3) {
                    return <span key={page} className="px-2">...</span>;
                  }
                  return null;
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-brand-brown mb-2">No Products Found</h3>
          <p className="text-brand-brown mb-6">
            Try adjusting your filters or search terms to find what you're looking for.
          </p>
          <Link
            href="/products"
            className="btn-primary hover:text-white inline-flex items-center gap-2"
          >
            View All Products
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
