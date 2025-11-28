'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

const defaultCategories = [
  {
    id: 'bags',
    name: 'Bags',
    description: 'Elegant embroidered handbags for every occasion',
    image: '/images/categories/handbags.jpg',
    productCount: 0,
    color: 'white'
  },
  {
    id: 'potli-purse',
    name: 'Potli Purse',
    description: 'Beautiful embroidered potli purses',
    image: '/images/categories/potli-purse.jpg',
    productCount: 0,
    color: 'white'
  },
  {
    id: 'goggle-cover',
    name: 'Goggle Cover',
    description: 'Traditional goggle covers',
    image: '/images/categories/goggle-cover.jpg',
    productCount: 0,
    color: 'white'
  },
  {
  id: 'bangle-box',
    name: 'Bangle Box',
    description: 'Embroidered bangle boxes',
    image: '/images/categories/bangle-box.jpg',
    productCount: 0,
    color: 'white'
  }
];

const CategoryCard = ({ category, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
    >
      <Link href={`/products?category=${category.id}`} className="block">
        {/* Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-80 group-hover:opacity-90 transition-opacity duration-300`} />
        
        {/* Image */}
        <div className="relative h-64 overflow-hidden bg-gray-200">
          {category.image && category.image !== '/images/categories/handbags.jpg' && category.image !== '/images/categories/sarees.jpg' && category.image !== '/images/categories/home-decor.jpg' && category.image !== '/images/categories/clothing.jpg' ? (
            <Image
              src={category.image}
              alt={`${category.name} collection - Handcrafted ${category.name.toLowerCase()} with traditional Indian embroidery patterns`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                // Fallback to gradient if image fails
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${category.color} opacity-80`} />
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300" />
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <h3 className="text-2xl font-playfair text-nirvaanaa-secondary font-bold mb-2">
              {category.name}
            </h3>
            <p className="text-sm opacity-90 text-white mb-3 line-clamp-2">
              {category.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">
                {category.productCount} Products
              </span>
              <motion.div
                initial={{ x: 0 }}
                whileHover={{ x: 5 }}
                className="flex items-center text-sm font-medium"
              >
                Shop Now
                <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-4 right-4 w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </div>
      </Link>
    </motion.div>
  );
};

const CategoryShowcase = () => {
  const [categories, setCategories] = useState(defaultCategories);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch categories and products to get images
        const [categoriesRes, productsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/products?limit=100')
        ]);
        
        const [categoriesData, productsData] = await Promise.all([
          categoriesRes.json(),
          productsRes.json()
        ]);
        
        if (categoriesRes.ok && categoriesData.categories && productsRes.ok && productsData.products) {
          // Create category mapping with images from products
          const categoryMap = {};
          productsData.products.forEach(product => {
            if (product.category && product.mainImage) {
              if (!categoryMap[product.category]) {
                categoryMap[product.category] = {
                  id: product.category,
                  name: product.category.charAt(0).toUpperCase() + product.category.slice(1).replace(/-/g, ' '),
                  image: product.mainImage,
                  count: 0
                };
              }
              categoryMap[product.category].count++;
            }
          });
          
          // Handle "bags" category - aggregate all bag-related categories
          const bagCategories = ['clutch', 'kitty-bag', 'long-tote-bag', 'picnic-bag', 'potli-purse', 'sling-bags', 'velvet-clutch-with-flaps'];
          const bagCount = bagCategories.reduce((sum, cat) => sum + (categoryMap[cat]?.count || 0), 0);
          const bagImage = bagCategories.find(cat => categoryMap[cat]?.image) 
            ? categoryMap[bagCategories.find(cat => categoryMap[cat]?.image)].image 
            : '/images/categories/handbags.jpg';
          
          if (bagCount > 0) {
            categoryMap['bags'] = {
              id: 'bags',
              name: 'Bags',
              image: bagImage,
              count: bagCount
            };
          }
          
          // Merge with default categories
          const updatedCategories = defaultCategories.map(defaultCat => {
            const apiCat = categoryMap[defaultCat.id] || categoriesData.categories.find(cat => cat.id === defaultCat.id);
            return {
              ...defaultCat,
              productCount: apiCat ? (apiCat.count || 0) : 0,
              image: apiCat?.image || defaultCat.image
            };
          });
          
          setCategories(updatedCategories);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="section-padding bg-white">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-playfair font-bold text-nirvaanaa-secondary mb-4">
            Shop by Category
          </h2>
          <p className="text-nirvaanaa-secondary/80 max-w-2xl mx-auto text-lg">
            Explore our carefully curated collections of handcrafted embroidery pieces, 
            each designed with love and attention to detail.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </div>

        {/* Featured Category Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 relative overflow-hidden rounded-3xl bg-gradient-to-r from-nirvaanaa-secondary to-nirvaanaa-secondary-dark/30 text-white"
        >
          <div className="absolute inset-0 bg-black bg-opacity-10" />
          
          <div className="relative p-8 lg:p-12">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl lg:text-4xl font-playfair font-bold mb-4 text-white">
                  New Collection
                </h3>
                <p className="text-lg mb-6 opacity-90 text-nirvaanaa-primary/90">
                  Discover our latest handcrafted embroidery collection featuring 
                  traditional motifs with contemporary designs.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/products?new=true"
                    className="btn-primary bg-nirvaanaa-primary text-nirvaanaa-primary   inline-flex items-center justify-center"
                  >
                    Shop New Arrivals
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <Link
                    href="/about"
                    className="px-6 py-2 rounded-lg shadow-md bg-nirvaanaa-primary border-nirvaanaa-primary text-nirvaanaa-secondary   inline-flex items-center justify-center"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
              
              <div className="relative">
                <div className="relative h-64 lg:h-80 rounded-2xl overflow-hidden">
                  <Image
                    src="https://res.cloudinary.com/dvy1jxowv/image/upload/v1762680536/home3_2_yzcnuu.jpg"
                    alt="New Collection"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
                
                {/* Floating Badge */}
                <div className="absolute -top-4 -right-4 bg-white text-nirvaanaa-secondary rounded-full p-3 shadow-nirvaanaa">
                  <div className="text-center">
                    <div className="text-xl font-bold">NEW</div>
                    <div className="text-xs text-nirvaanaa-primary">{new Date().getFullYear()}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-8 right-8 w-20 h-20 bg-nirvaanaa-primary/20 rounded-full" />
          <div className="absolute bottom-8 left-8 w-16 h-16 bg-nirvaanaa-primary/20 rounded-full" />
        </motion.div>
      </div>
    </section>
  );
};

export default CategoryShowcase;
