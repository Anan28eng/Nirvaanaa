'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

const AboutSection = () => {
  const stats = [
    { number: '500+', label: 'Happy Customers' },
    { number: '50+', label: 'Unique Designs' },
    { number: '3+', label: 'Years Experience' },
    { number: '100%', label: 'Handcrafted' }
  ];

  return (
    <section className="bg-nirvaanaa-offwhite">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6">
              <span className="text-brand-gold font-semibold text-sm uppercase tracking-wider">
                Our Story
              </span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-playfair font-bold text-brand-brown mb-6 leading-tight">
              Crafting Beauty with
              <span className="block text-brand-gold">Every Stitch</span>
            </h2>
            
            <div className="space-y-4 text-brand-brown text-lg leading-relaxed">
              <p>
                At Nirvaanaa, we believe in the timeless art of hand embroidery. 
                Every piece in our collection is carefully crafted by skilled artisans 
                who pour their heart and soul into creating something truly special.
              </p>
              <p>
                Our journey began with a simple vision: to bring the beauty of traditional 
                Indian embroidery to modern fashion, creating pieces that are both 
                beautiful and practical for everyday use.
              </p>
              <p>
                Each design tells a story, each stitch carries meaning, and every piece 
                is a testament to the rich cultural heritage that inspires our work.
              </p>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl sm:text-4xl font-bold text-brand-gold mb-1">
                    {stat.number}
                  </div>
                  <div className="text-sm text-brand-brown font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 mt-8"
            >
              <Link
                href="/about"
                className="btn-primary hover:bg-accent-600 hover:text-white inline-flex items-center justify-center"
              >
                Learn More
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/contact"
                className="btn-secondary inline-flex items-center justify-center"
              >
                Get in Touch
              </Link>
            </motion.div>
          </motion.div>

          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Main Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[3/4] max-w-sm mx-auto">
              <Image
                src="https://res.cloudinary.com/dvy1jxowv/image/upload/v1762597791/Copy_of_N-BB3_aucavt.jpg"
                alt="Skilled artisan hand-embroidering traditional Indian patterns on fabric with colorful threads"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            {/* Floating Image 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="absolute -top-6 -left-6 w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden shadow-xl"
            >
              <Image
                src="https://res.cloudinary.com/dvy1jxowv/image/upload/v1762597809/N-PIC1_y47mss.jpg"
                alt="Close-up detail of intricate hand embroidery work showing traditional Indian patterns and colorful threads"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-10" />
            </motion.div>

            {/* Floating Image 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="absolute -bottom-6 -right-6 w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden shadow-xl"
            >
              <Image
                src="https://res.cloudinary.com/dvy1jxowv/image/upload/v1762597800/GIFT_HAMPER_2_PIECE_SET_kcqgdj.jpg"
                alt="Traditional embroidery materials including colorful threads, needles, and fabric for handcrafted products"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-10" />
            </motion.div>

            {/* Decorative Elements */}
            <div className="absolute top-1/2 -left-4 w-8 h-8 bg-brand-gold rounded-full opacity-60" />
            <div className="absolute bottom-1/4 -right-2 w-6 h-6 bg-brand-brown rounded-full opacity-40" />
          </motion.div>
        </div>

        {/* Values Section */}
        
            
          
      </div>
    </section>
  );
};

export default AboutSection;
