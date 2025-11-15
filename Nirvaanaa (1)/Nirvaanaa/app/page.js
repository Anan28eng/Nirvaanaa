import { Suspense } from 'react';
import HeroSection from '@/components/home/HeroSection';
import CategoryShowcase from '@/components/home/CategoryShowcase';
import AboutSection from '@/components/home/AboutSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import BannerManager from '@/components/admin/BannerManager';
import { OrganizationSchema, WebsiteSchema } from '@/components/seo/StructuredData';

export const metadata = {
  title: 'Handcrafted Embroidery Bags & Sarees | Nirvaanaa',
  description: 'Shop exquisite handmade embroidery bags, clutches, and sarees. Artisan-crafted with traditional Indian techniques. Free shipping on orders over ₹1000.',
  keywords: ['handmade embroidery bags', 'handcrafted sarees', 'Indian embroidery', 'artisan bags', 'traditional embroidery', 'handmade clutches', 'embroidery products'],
  openGraph: {
    title: 'Handcrafted Embroidery Bags & Sarees | Nirvaanaa',
    description: 'Shop exquisite handmade embroidery bags, clutches, and sarees. Artisan-crafted with traditional Indian techniques.',
    images: ['/og-image.jpg'],
    type: 'website',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Handcrafted Embroidery Bags & Sarees | Nirvaanaa',
    description: 'Shop exquisite handmade embroidery bags, clutches, and sarees.',
  },
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  return (
    <>
      <OrganizationSchema />
      <WebsiteSchema />
      <div className="min-h-screen">
        {/* Hero Section */}<BannerManager/>
        <HeroSection />

      {/* Category Showcase */}
      <section className="section-padding gradient-bg">
        <div className="max-width container-padding">
          <div className="text-center mb-12">
            <h2 className="gradient-text mb-4">Explore Our Handcrafted Collections</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover elegant embroidered bags, traditional sarees, and artisan-crafted accessories
            </p>
          </div>
          <CategoryShowcase />
        </div>
      </section>

      {/* About Section */}
      <section>
        <div className="max-width container-padding">
          <AboutSection />
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding gradient-bg">
        <div className="max-width container-padding">
          <div className="text-center mb-12">
            <TestimonialsSection />
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
