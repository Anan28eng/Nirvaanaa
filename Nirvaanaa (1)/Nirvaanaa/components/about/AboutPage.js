'use client';

import SafeImage from '@/components/ui/SafeImage';
import { useState } from 'react';
import { motion } from 'framer-motion';

const storyParagraphs = [
  'Nirvaanaa was born from a love for heirloom embroidery and the desire to keep our artisan communities thriving. Every silhouette, stitch, and motif is guided by the women who craft them and the women who wear them.',
  'We build slowly and intentionally--sourcing responsibly, finishing by hand, and packaging consciously. The result is a collection that feels luxurious yet lived-in, regal but equally relaxed.',
];

const teamMember = {
  name: 'Manju Kalyan',
  role: 'Founder & Creative Director',
  image: '/founder.jpeg', // ALWAYS use founder.jpeg
  bio: 'I am Manju, the proud creator of Nirvaanaa. My journey in fashion and craftsmanship has been a long and passionate one, rooted in my love for terracotta jewellery, intricately embroidered purses and elegant Modal sarees. I aspire to share this love with women everywhere, inspiring them to embrace tradition with grace and style. Beyond my creative pursuits, I am an educator whose travels, classroom conversations, and playlists keep the creative spark alive.',
  expertise: ['Textile Design', 'Sustainable Fashion', 'Artisan Collaboration'],
  social: {
    whatsapp: 'https://wa.me/917763853089',
    instagram: 'https://www.instagram.com/nirvaanaa_corporategifting?utm_source=qr&igsh=ZjhvbDg2MzE1Zzl1',
  },
};

const iconMap = {
  whatsapp: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.001 2.003c-5.523 0-9.997 4.474-9.997 9.997 0 1.764.463 3.45 1.34 4.94l-1.42 5.19 5.31-1.39a9.96 9.96 0 004.77 1.21c5.523 0 9.997-4.474 9.997-9.997s-4.474-9.997-9.997-9.997zm0 18.2a8.2 8.2 0 01-4.18-1.15l-.3-.18-3.15.82.84-3.07-.2-.31a8.2 8.2 0 01-1.27-4.39c0-4.53 3.68-8.21 8.21-8.21 2.19 0 4.25.85 5.8 2.4a8.17 8.17 0 012.41 5.8c0 4.53-3.68 8.21-8.21 8.21zm4.72-6.15c-.26-.13-1.53-.75-1.77-.84-.24-.09-.42-.13-.6.13-.18.26-.69.84-.85 1.01-.16.18-.31.2-.57.07-.26-.13-1.09-.4-2.07-1.27-.77-.69-1.29-1.54-1.44-1.8-.15-.26-.02-.4.11-.53.11-.11.26-.29.39-.44.13-.15.18-.26.26-.44.09-.18.04-.33-.02-.46-.07-.13-.6-1.44-.82-1.97-.22-.53-.44-.46-.6-.47h-.52c-.18 0-.46.07-.7.33-.24.26-.92.9-.92 2.2s.94 2.55 1.07 2.73c.13.18 1.85 2.83 4.48 3.97.63.27 1.12.43 1.5.55.63.2 1.2.17 1.65.1.5-.07 1.53-.62 1.75-1.22.22-.6.22-1.11.15-1.22-.07-.11-.24-.18-.5-.31z" />
    </svg>
  ),
  instagram: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" />
    </svg>
  ),
};

const FounderPortrait = ({ name }) => {
  return (
      <div className="relative h-96 w-full overflow-hidden rounded-3xl border border-gray-200">
      <SafeImage
        src="/founder.jpeg"
        alt={name}
        fill
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-cover"
        priority
      />

      <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full border border-white/40" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-28 w-28 rounded-full border border-white/40" />
    </div>
  );
};




const AboutPage = () => {
  return (
    <div className="min-h-screen w-full py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-16">
        
        {/* Story section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="surface-panel p-8 sm:p-12 space-y-8"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-nirvaanaa-secondary/70">Our Story</p>
            <h1 className="text-4xl sm:text-5xl font-playfair font-bold text-nirvaanaa-secondary mt-4">
              Tradition stitched into every contemporary silhouette.
            </h1>
          </div>

          <div className="space-y-5 text-lg text-gray-700 leading-relaxed">
            {storyParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </motion.section>

        {/* Founder section */}
        <motion.section
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.1 }}
  className="bg-white/70 backdrop-blur-md rounded-3xl p-8 sm:p-12 shadow-lg"
>

          <div className="grid gap-12 lg:grid-cols-[1.05fr,0.95fr] items-center">
            <div className="space-y-6">
              
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-nirvaanaa-secondary/70 mb-3">
                  Meet our founder
                </p>
                <h2 className="text-3xl sm:text-4xl font-playfair text-nirvaanaa-secondary">
                  {teamMember.name}
                </h2>
                <p className="text-nirvaanaa-dark font-medium mt-2">{teamMember.role}</p>
              </div>

              <p className="text-gray-700 leading-relaxed">{teamMember.bio}</p>

              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-nirvaanaa-secondary/70">Expertise</p>
                <div className="flex flex-wrap gap-3">
                  {teamMember.expertise.map((skill) => (
                    <span key={skill} className="px-4 py-1.5 rounded-full bg-nirvaanaa-primary-light text-nirvaanaa-secondary text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-nirvaanaa-secondary/70">Connect</p>
                <div className="flex gap-4">
                  {Object.entries(teamMember.social).map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full bg-nirvaanaa-primary text-white flex items-center justify-center shadow-nirvaanaa hover:-translate-y-[2px] transition"
                    >
                      {iconMap[platform]}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT SIDE — Portrait */}
            <FounderPortrait name={teamMember.name} />
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default AboutPage;

