"use client"
import Link from 'next/link';
import { FiInstagram, FiFacebook, FiTwitter, FiMail, FiPhone } from 'react-icons/fi';
export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-brand-brown text-white">
      <div className="max-width container-padding py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <h3 className="text-2xl font-playfair font-bold text-brand-gold">
                Nirvaanaa
              </h3>
            </Link>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Handcrafted elegance meets contemporary style. Each piece tells a story of tradition, 
              craftsmanship, and timeless beauty.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com/nirvaanaa"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-brand-gold transition-colors"
                aria-label="Instagram"
              >
                <FiInstagram size={20} />
              </a>
              <a
                href="https://facebook.com/nirvaanaa"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-brand-gold transition-colors"
                aria-label="Facebook"
              >
                <FiFacebook size={20} />
              </a>
              <a
                href="https://twitter.com/nirvaanaa"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-brand-gold transition-colors"
                aria-label="Twitter"
              >
                <FiTwitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-brand-gold">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-gray-300 hover:text-white transition-colors">
                  Shop All
                </Link>
              </li>
              <li>
                <Link href="/products?category=bags" className="text-gray-300 hover:text-white transition-colors">
                  Bags
                </Link>
              </li>
              <li>
                <Link href="/products?category=sarees" className="text-gray-300 hover:text-white transition-colors">
                  Sarees
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-brand-gold">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/shipping" className="text-gray-300 hover:text-white transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-300 hover:text-white transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link href="/care-instructions" className="text-gray-300 hover:text-white transition-colors">
                  Care Instructions
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-brand-gold">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <FiMail className="text-brand-gold" size={16} />
                <a
                  href="mailto:libramank@gmail.com"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  libramank@gmail.com
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <FiPhone className="text-brand-gold" size={16} />
                <a
                  href="tel:7763853089"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  7763853089
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              © {currentYear} Nirvaanaa. All rights reserved. Handcrafted with love in India.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
