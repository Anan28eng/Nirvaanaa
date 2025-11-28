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
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartCount = getCartCount();

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-nirvaanaa border-b border-nirvaanaa-primary/20'
          : 'bg-transparent'
      }`}>
        <div className="max-width container-padding">
          <div className="flex items-center justify-between h-16 lg:h-20">

            <Link href="/" className="flex items-center space-x-2">
              <div className="text-2xl lg:text-3xl font-playfair font-bold text-nirvaanaa-secondary">
                Nirvaanaa
              </div>
            </Link>

            <div className="hidden lg:flex items-center space-x-8">
              <Link href="/products" className="text-nirvaanaa-secondary font-medium transition-colors duration-300">Shop</Link>
              <Link href="/products?category=bags" className="text-nirvaanaa-secondary font-medium transition-colors duration-300">Bags</Link>
              <Link href="/products?category=sarees" className="text-nirvaanaa-secondary font-medium transition-colors duration-300">Sarees</Link>
              <Link href="/about" className="text-nirvaanaa-secondary font-medium transition-colors duration-300">About</Link>
              <Link href="/contact" className="text-nirvaanaa-secondary font-medium transition-colors duration-300">Contact</Link>
            </div>

            <div className="hidden lg:flex items-center space-x-4">

              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-nirvaanaa-secondary bg-transparent transition-colors duration-300"
              >
                <FiSearch size={20} />
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="p-2 text-nirvaanaa-secondary transition-colors duration-300"
              >
                <FiHeart size={20} />
              </Link>

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-nirvaanaa-secondary transition-colors duration-300"
              >
                <FiShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-nirvaanaa-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>

              {session ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 text-nirvaanaa-secondary transition-colors duration-300"
                  >
                    <FiUser size={20} />
                    <span className="text-sm font-medium">{session.user.name}</span>
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && <UserMenu onClose={() => setIsUserMenuOpen(false)} />}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/auth/signup" className="btn-outline">Sign Up</Link>
                  <Link href="/auth/signin" className="btn-primary">Sign In</Link>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-nirvaanaa-secondary transition-colors duration-300"
            >
              {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* ================= MOBILE MENU UPDATED ================ */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-nirvaanaa-primary/20"
            >
              <div className="flex flex-col space-y-4 p-4">

                <Link href="/products" className="text-nirvaanaa-secondary text-lg font-medium transition-colors duration-300">Shop</Link>
                <Link href="/products?category=bags" className="text-nirvaanaa-secondary text-lg font-medium transition-colors duration-300">Bags</Link>
                <Link href="/products?category=sarees" className="text-nirvaanaa-secondary text-lg font-medium transition-colors duration-300">Sarees</Link>
                <Link href="/about" className="text-nirvaanaa-secondary text-lg font-medium transition-colors duration-300">About</Link>
                <Link href="/contact" className="text-nirvaanaa-secondary text-lg font-medium transition-colors duration-300">Contact</Link>

                {/* Light Gradient Search */}
                <button
                  onClick={() => {
                    setIsSearchOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg
                             bg-gradient-to-r from-nirvaanaa-primary/10 to-nirvaanaa-secondary/10
                             text-nirvaanaa-secondary transition-all duration-300"
                >
                  <FiSearch size={20} />
                  <span>Search</span>
                </button>

                {/* Wishlist */}
                <Link
                  href="/wishlist"
                  className="flex items-center gap-2 px-3 py-2 text-nirvaanaa-secondary transition-colors duration-300"
                >
                  <FiHeart size={20} />
                  <span>Wishlist</span>
                </Link>

                {/* Cart */}
                <button
                  onClick={() => {
                    setIsCartOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-nirvaanaa-secondary transition-colors duration-300"
                >
                  <FiShoppingBag size={20} />
                  <span>Cart</span>

                  {cartCount > 0 && (
                    <span className="ml-auto bg-nirvaanaa-secondary text-white 
                                     text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </button>

                {session ? (
                  <button
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-nirvaanaa-secondary transition-colors duration-300"
                  >
                    Sign Out
                  </button>
                ) : (
                  <>
                    <Link href="/auth/signup" className="btn-outline w-full text-center">Sign Up</Link>
                    <Link href="/auth/signin" className="btn-primary w-full text-center">Sign In</Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <div className="h-16 lg:h-20" />
    </>
  );
}

