'use client';

import { motion } from 'framer-motion';

const AboutPage = () => {
  const values = [
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: 'Artisan Craftsmanship',
      description: 'Every piece is handcrafted by skilled artisans with years of experience in traditional embroidery techniques.'
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      title: 'Quality Materials',
      description: 'We use only the finest fabrics and threads, ensuring each piece is both beautiful and durable.'
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0-9c-5 0-9 4-9 9s4 9 9 9" />
        </svg>
      ),
      title: 'Sustainable Practices',
      description: 'We are committed to sustainable practices, from sourcing materials to packaging and shipping.'
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Community Impact',
      description: 'We support local artisans and their communities, preserving traditional skills and creating sustainable livelihoods.'
    }
  ];

  const teamMember = {
    name: 'Manju Kalyan',
    role: 'Founder & Creative Director',
    image: '/images/team/priya.jpg',
    bio: 'An experienced creative professional with a strong passion for design and craftsmanship. With many years of expertise in blending traditional artistry and modern design principles, Manju Kalyan is dedicated to creating products that reflect timeless elegance and quality. Her leadership emphasizes sustainable practices and innovative approaches, continually driving the brand\'s growth and influence in the industry.',
    expertise: ['Textile Design', 'Sustainable Fashion', 'Artisan Collaboration'],
    social: {
      whatsapp:'https://wa.me/917763853089',
      instagram: 'https://www.instagram.com/nirvaanaa_corporategifting?utm_source=qr&igsh=ZjhvbDg2MzE1Zzl1',
     
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-cream-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-playfair font-bold text-brand-brown mb-6">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Our Story
            </motion.span>
          </h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg sm:text-xl text-brand-brown max-w-4xl mx-auto leading-relaxed"
          >
            At Nirvaanaa, we believe in the timeless art of hand embroidery. Every piece in our collection 
            is carefully crafted by skilled artisans who pour their heart and soul into creating something truly special.
          </motion.p>
        </motion.div>

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="max-w-4xl mx-auto mb-24"
        >
          <div className="bg-white rounded-3xl shadow-lg p-8 sm:p-12 lg:p-16">
            <h2 className="text-3xl sm:text-4xl font-playfair font-bold text-brand-brown mb-8 text-center">
              Our Mission: Preserving Traditional Embroidery
            </h2>
            <div className="space-y-6 text-brand-brown text-lg leading-relaxed">
              <p>
                Our journey began with a simple vision: to bring the beauty of traditional 
                Indian embroidery to modern fashion, creating pieces that are both 
                beautiful and practical for everyday use.
              </p>
              <p>
                We are committed to preserving the rich cultural heritage of Indian embroidery 
                while supporting the skilled artisans who keep these traditions alive. 
                Each design tells a story, each stitch carries meaning, and every piece 
                is a testament to the craftsmanship that has been passed down through generations.
              </p>
              <p>
                Through sustainable practices and fair trade principles, we ensure that 
                our artisans receive fair compensation for their work, helping to create 
                sustainable livelihoods in their communities.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Values Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mb-24"
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-playfair font-bold text-brand-brown mb-4">
              Our Core Values: Quality & Sustainability
            </h2>
            <p className="text-brand-brown text-lg max-w-2xl mx-auto">
              These core values guide everything we do, from design to production to customer service.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="text-center p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300"
              >
                <motion.div 
                  className="text-brand-gold mb-6 flex justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  {value.icon}
                </motion.div>
                <h3 className="text-xl font-semibold text-brand-brown mb-4">
                  {value.title}
                </h3>
                <p className="text-brand-brown leading-relaxed text-sm">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="mb-16"
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-playfair font-bold text-brand-brown mb-4">
              Meet Our Founder: Manju Kalyan
            </h2>
            <p className="text-brand-brown text-lg max-w-2xl mx-auto">
              The passionate individual behind Nirvaanaa who works tirelessly to bring you the best in handcrafted embroidery.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 1.6 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-3xl shadow-xl overflow-hidden"
            >
              <div className="lg:grid lg:grid-cols-2 gap-0">
                {/* Image Section */}
                <motion.div 
                  className="relative h-80 lg:h-full min-h-[400px] bg-gradient-to-br from-brand-gold/20 to-brand-brown/20"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 1.8 }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.8, delay: 2 }}
                      className="w-48 h-48 rounded-full bg-gradient-to-br from-brand-gold to-brand-brown flex items-center justify-center text-white text-6xl font-playfair font-bold shadow-2xl"
                    >
                      {teamMember.name.charAt(0)}
                    </motion.div>
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute top-8 right-8 w-24 h-24 border-2 border-brand-gold/30 rounded-full" />
                  <div className="absolute bottom-8 left-8 w-16 h-16 border-2 border-brand-brown/30 rounded-full" />
                </motion.div>

                {/* Content Section */}
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 2.2 }}
                  >
                    <h3 className="text-3xl font-playfair font-bold text-brand-brown mb-2">
                      {teamMember.name}
                    </h3>
                    <motion.p 
                      className="text-brand-gold font-semibold text-lg mb-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 2.4 }}
                    >
                      {teamMember.role}
                    </motion.p>
                    <motion.p 
                      className="text-brand-brown leading-relaxed mb-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 2.6 }}
                    >
                      {teamMember.bio}
                    </motion.p>

                    {/* Expertise Tags */}
                    <motion.div 
                      className="flex flex-wrap gap-3 mb-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 2.8 }}
                    >
                      {teamMember.expertise.map((skill, index) => (
                        <motion.span
                          key={skill}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.4, delay: 2.9 + index * 0.1 }}
                          whileHover={{ scale: 1.05 }}
                          className="px-4 py-2 bg-brand-gold/10 text-brand-brown rounded-full text-sm font-medium"
                        >
                          {skill}
                        </motion.span>
                      ))}
                    </motion.div>

                    {/* Social Links */}
                    <motion.div 
                      className="flex gap-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 3.2 }}
                    >
                      {Object.entries(teamMember.social).map(([platform, url], index) => (
                        <motion.a
                          key={platform}
                          href={url}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 3.3 + index * 0.1 }}
                          whileHover={{ scale: 1.1, y: -3 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-12 h-12 bg-gradient-to-br from-brand-gold/20 to-brand-brown/20 rounded-full flex items-center justify-center text-brand-brown hover:from-brand-gold hover:to-brand-brown hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                          
                          {platform === 'whatsapp' && (
  <svg
    className="w-5 h-5"
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.001 2.003c-5.523 0-9.997 4.474-9.997 9.997 0 1.764.463 3.45 1.34 4.94l-1.42 5.19 5.31-1.39a9.96 9.96 0 004.77 1.21c5.523 0 9.997-4.474 9.997-9.997s-4.474-9.997-9.997-9.997zm0 18.2a8.2 8.2 0 01-4.18-1.15l-.3-.18-3.15.82.84-3.07-.2-.31a8.2 8.2 0 01-1.27-4.39c0-4.53 3.68-8.21 8.21-8.21 2.19 0 4.25.85 5.8 2.4a8.17 8.17 0 012.41 5.8c0 4.53-3.68 8.21-8.21 8.21zm4.72-6.15c-.26-.13-1.53-.75-1.77-.84-.24-.09-.42-.13-.6.13-.18.26-.69.84-.85 1.01-.16.18-.31.2-.57.07-.26-.13-1.09-.4-2.07-1.27-.77-.69-1.29-1.54-1.44-1.8-.15-.26-.02-.4.11-.53.11-.11.26-.29.39-.44.13-.15.18-.26.26-.44.09-.18.04-.33-.02-.46-.07-.13-.6-1.44-.82-1.97-.22-.53-.44-.46-.6-.47h-.52c-.18 0-.46.07-.7.33-.24.26-.92.9-.92 2.2s.94 2.55 1.07 2.73c.13.18 1.85 2.83 4.48 3.97.63.27 1.12.43 1.5.55.63.2 1.2.17 1.65.1.5-.07 1.53-.62 1.75-1.22.22-.6.22-1.11.15-1.22-.07-.11-.24-.18-.5-.31z"/>
  </svg>
)}
                          {platform === 'instagram' && (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                          )}
                          
                        </motion.a>
                      ))}
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;
