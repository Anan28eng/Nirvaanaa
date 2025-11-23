"use client"
import Link from 'next/link';
import { FiInstagram, FiMail, FiPhone } from 'react-icons/fi';
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
                href="https://www.instagram.com/nirvaanaa_corporategifting?utm_source=qr&igsh=ZjhvbDg2MzE1Zzl1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-brand-gold transition-colors"
                aria-label="Instagram"
              >
                <FiInstagram size={20} />
              </a>
              <a
                href="https://wa.me/917763853089"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-brand-gold transition-colors"
                aria-label="WhatsApp"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
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
