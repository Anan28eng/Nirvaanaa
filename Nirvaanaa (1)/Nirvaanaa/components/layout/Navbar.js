'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useEnhancedCart } from '@/components/providers/EnhancedCartProvider';
import { FiSearch, FiShoppingBag, FiUser, FiMenu, FiX, FiHeart } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import SearchModal from '@/components/ui/SearchModal';
import CartDrawer from '@/components/cart/CartDrawer';
import UserMenu from '@/components/auth/UserMenu';

export default function Navbar() {
  const { data: session } = useSession();
  const { getCartCount } = useEnhancedCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartCount = getCartCount();

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-elegant' 
          : 'bg-transparent'
      }`}>
        <div className="max-width container-padding">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-2xl lg:text-3xl font-playfair font-bold text-brand-brown">
                Nirvaanaa
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link href="/products" className="nav-link">
                Shop
              </Link>
              <Link href="/products?category=bags" className="nav-link">
                Bags
              </Link>
              <Link href="/products?category=sarees" className="nav-link">
                Sarees
              </Link>
              <Link href="/about" className="nav-link">
                About
              </Link>
              <Link href="/contact" className="nav-link">
                Contact
              </Link>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-gray-600 hover:text-brand-gold transition-colors"
                aria-label="Search"
              >
                <FiSearch size={20} />
              </button>

              {/* Wishlist */}
              <Link href="/wishlist" className="p-2 text-gray-600 hover:text-brand-gold transition-colors">
                <FiHeart size={20} />
              </Link>

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-600 hover:text-brand-gold transition-colors"
                aria-label="Shopping cart"
              >
                <FiShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-gold text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>

              {/* User Menu */}
              {session ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 text-gray-600 hover:text-brand-gold transition-colors"
                  >
                    <FiUser size={20} />
                    <span className="text-sm font-medium">{session.user.name}</span>
                  </button>
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <UserMenu onClose={() => setIsUserMenuOpen(false)} />
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/auth/signup" className="btn-outline">
                    Sign Up
                  </Link>
                  <Link href="/auth/signin" className="btn-outline hover:bg-brand-brown hover:text-white">
                    Sign In
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-brand-gold transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-gray-200"
            >
              <div className="container-padding py-4 space-y-4">
                <Link href="/products" className="block py-2 text-gray-700 hover:text-brand-gold">
                  Shop
                </Link>
                <Link href="/products?category=bags" className="block py-2 text-gray-700 hover:text-brand-gold">
                  Bags
                </Link>
                <Link href="/products?category=sarees" className="block py-2 text-gray-700 hover:text-brand-gold">
                  Sarees
                </Link>
                <Link href="/about" className="block py-2 text-gray-700 hover:text-brand-gold">
                  About
                </Link>
                <Link href="/contact" className="block py-2 text-gray-700 hover:text-brand-gold">
                  Contact
                </Link>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => setIsSearchOpen(true)}
                      className="flex items-center space-x-2 text-gray-600 hover:text-brand-gold"
                    >
                      <FiSearch size={18} />
                      <span>Search</span>
                    </button>
                    <Link href="/wishlist" className="flex items-center space-x-2 text-gray-600 hover:text-brand-gold">
                      <FiHeart size={18} />
                      <span>Wishlist</span>
                    </Link>
                  </div>
                  
                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="flex items-center justify-between w-full py-2 text-gray-600 hover:text-brand-gold"
                  >
                    <span>Cart</span>
                    {cartCount > 0 && (
                      <span className="bg-brand-gold text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cartCount > 99 ? '99+' : cartCount}
                      </span>
                    )}
                  </button>
                  
                  {session ? (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-500 mb-2">Welcome, {session.user.name}</div>
                      <Link href={session.user?.role === 'admin' ? '/admin' : '/account'} className="block py-2 text-gray-700 hover:text-brand-gold">
                        My Account
                      </Link>
                      <Link href="/orders" className="block py-2 text-gray-700 hover:text-brand-gold">
                        My Orders
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="block w-full text-left py-2 text-gray-700 hover:text-brand-gold"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                      <div className="space-y-2">
                        <Link href="/auth/signup" className="block w-full text-center py-2 btn-outline">
                          Sign Up
                        </Link>
                        <Link href="/auth/signin" className="block w-full text-center py-2 mt-2 btn-primary">
                          Sign In
                        </Link>
                      </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Spacer for fixed navbar */}
      <div className="h-16 lg:h-20" />
    </>
  );
}
