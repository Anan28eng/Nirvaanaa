'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiFilter, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const ProductFilters = ({ searchParams }) => {
  const router = useRouter();
  const currentSearchParams = useSearchParams();
  
  const [filters, setFilters] = useState({
    category: searchParams.category || '',
    minPrice: searchParams.minPrice || '',
    maxPrice: searchParams.maxPrice || '',
    tags: searchParams.tags || '',
    featured: searchParams.featured === 'true',
    inStock: searchParams.inStock === 'true'
  });

  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    tags: true,
    other: true
  });

  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        // Fetch categories and tags separately for better performance
        const [categoriesRes, tagsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/tags')
        ]);

        const [categoriesData, tagsData] = await Promise.all([
          categoriesRes.json(),
          tagsRes.json()
        ]);

        if (categoriesRes.ok && categoriesData.categories) {
          setCategories(categoriesData.categories);
        }

        if (tagsRes.ok && tagsData.tags) {
          setTags(tagsData.tags);
        }
      } catch (error) {
        console.error('Failed to fetch filter data:', error);
      }
    };

    fetchFilterData();
  }, []);


  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateFilters = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    // Update URL with new filters
    const params = new URLSearchParams(currentSearchParams);
    
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value.toString());
      } else {
        params.delete(key);
      }
    });
    
    // Reset to page 1 when filters change
    params.delete('page');
    
    router.push(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      tags: '',
      featured: false,
      inStock: false
    });
    router.push('/products');
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== false
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-brand-brown flex items-center gap-2">
          <FiFilter className="w-5 h-5" />
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-brand-gold hover:text-brand-gold flex items-center gap-1"
          >
            <FiX className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="border-b border-gray-200 pb-4 mb-4">
        <button
          onClick={() => toggleSection('category')}
          className="flex items-center justify-between w-full text-left font-medium text-brand-brown mb-3"
        >
          Category
          {expandedSections.category ? (
            <FiChevronUp className="w-4 h-4" />
          ) : (
            <FiChevronDown className="w-4 h-4" />
          )}
        </button>
        
        {expandedSections.category && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {categories.map((category) => (
              <label key={category.id} className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="category"
                    value={category.id}
                    checked={filters.category === category.id}
                    onChange={(e) => updateFilters({ category: e.target.value })}
                    className="w-4 h-4 text-brand-brown border-gray-300 focus:ring-brand-gold"
                  />
                  <span className="text-brand-brown">{category.name}</span>
                </div>
                <span className="text-sm text-gray-500">({category.count})</span>
              </label>
            ))}
          </motion.div>
        )}
      </div>

      {/* Price Range Filter */}
      <div className="border-b border-gray-200 pb-4 mb-4">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full text-left font-medium text-brand-brown mb-3"
        >
          Price Range
          {expandedSections.price ? (
            <FiChevronUp className="w-4 h-4" />
          ) : (
            <FiChevronDown className="w-4 h-4" />
          )}
        </button>
        
        {expandedSections.price && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <div className="pb-4">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => updateFilters({ minPrice: e.target.value })}
                className="flex-1 mb-8 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => updateFilters({ maxPrice: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
              />
            </div>
            
            {/* Quick Price Ranges */}
            <div className="space-y-2">
              {[
                { label: 'Under ₹500', min: '', max: '500' },
                { label: '₹500 - ₹1000', min: '500', max: '1000' },
                { label: '₹1000 - ₹2000', min: '1000', max: '2000' },
                { label: 'Over ₹2000', min: '2000', max: '' }
              ].map((range) => (
                <button
                  key={range.label}
                  onClick={() => updateFilters({ 
                    minPrice: range.min, 
                    maxPrice: range.max 
                  })}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    filters.minPrice === range.min && filters.maxPrice === range.max
                      ? 'bg-brand-gold text-white'
                      : 'hover:bg-gray-50 text-brand-brown'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Tags Filter */}
      <div className="border-b border-gray-200 pb-4 mb-4">
        <button
          onClick={() => toggleSection('tags')}
          className="flex items-center justify-between w-full text-left font-medium text-brand-brown mb-3"
        >
          Tags
          {expandedSections.tags ? (
            <FiChevronUp className="w-4 h-4" />
          ) : (
            <FiChevronDown className="w-4 h-4" />
          )}
        </button>
        
        {expandedSections.tags && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {tags.map((tag) => (
              <label key={tag.id} className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.tags.includes(tag.id)}
                    onChange={(e) => {
                      const currentTags = filters.tags ? filters.tags.split(',') : [];
                      const newTags = e.target.checked
                        ? [...currentTags, tag.id]
                        : currentTags.filter(t => t !== tag.id);
                      updateFilters({ tags: newTags.join(',') });
                    }}
                    className="w-4 h-4 text-white border-gray-300 rounded focus:ring-brand-gold"
                  />
                  <span className="text-brand-brown">{tag.name}</span>
                </div>
                <span className="text-sm text-gray-500">({tag.count})</span>
              </label>
            ))}
          </motion.div>
        )}
      </div>

      {/* Other Filters */}
      <div className="border-b border-gray-200 pb-4 mb-4">
        <button
          onClick={() => toggleSection('other')}
          className="flex items-center justify-between w-full text-left font-medium text-brand-brown mb-3"
        >
          Other Options
          {expandedSections.other ? (
            <FiChevronUp className="w-4 h-4" />
          ) : (
            <FiChevronDown className="w-4 h-4" />
          )}
        </button>
        
        {expandedSections.other && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.featured}
                onChange={(e) => updateFilters({ featured: e.target.checked })}
                className="w-4 h-4 text-brand-gold border-gray-300 rounded focus:ring-brand-gold"
              />
              <span className="text-brand-brown">Featured Products</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(e) => updateFilters({ inStock: e.target.checked })}
                className="w-4 h-4 text-brand-gold border-gray-300 rounded focus:ring-brand-gold"
              />
              <span className="text-brand-brown">In Stock Only</span>
            </label>
          </motion.div>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="pt-4">
          <h4 className="text-sm font-medium text-brand-brown mb-3">Active Filters:</h4>
          <div className="flex flex-wrap gap-2">
            {filters.category && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-gold text-brand-brown rounded-full text-sm">
                Category: {categories.find(c => c.id === filters.category)?.name}
                <button
                  onClick={() => updateFilters({ category: '' })}
                  className="ml-1 hover:text-accent-600"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {(filters.minPrice || filters.maxPrice) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-gold text-brand-brown rounded-full text-sm">
                Price: ₹{filters.minPrice || '0'} - ₹{filters.maxPrice || '∞'}
                <button
                  onClick={() => updateFilters({ minPrice: '', maxPrice: '' })}
                  className="ml-1 hover:text-brand-gold"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.tags && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-gold text-brand-brown rounded-full text-sm">
                Tags: {filters.tags.split(',').length} selected
                <button
                  onClick={() => updateFilters({ tags: '' })}
                  className="ml-1 hover:text-brand-gold"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.featured && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-gold text-brand-brown rounded-full text-sm">
                Featured
                <button
                  onClick={() => updateFilters({ featured: false })}
                  className="ml-1 hover:text-brand-gold"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.inStock && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-gold text-brand-brown rounded-full text-sm">
                In Stock
                <button
                  onClick={() => updateFilters({ inStock: false })}
                  className="ml-1 hover:text-brand-gold"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;
