import AboutPage from '@/components/about/AboutPage';

export const metadata = {
  title: 'About Us | Handcrafted Embroidery Artisans',
  description: 'Discover Nirvaanaa\'s story of preserving traditional Indian embroidery. Supporting artisan communities with sustainable, handcrafted bags and sarees.',
  keywords: 'about Nirvaanaa, handcrafted embroidery artisans, traditional Indian embroidery, sustainable fashion, artisan communities, handmade bags India',
  openGraph: {
    title: 'About Us | Handcrafted Embroidery Artisans',
    description: 'Discover Nirvaanaa\'s story of preserving traditional Indian embroidery and supporting artisan communities.',
    type: 'website',
    url: '/about',
  },
  alternates: {
    canonical: '/about',
  },
};

const About = () => {
  return (
    <div className="min-h-screen bg-cream-50">
      <AboutPage />
    </div>
  );
};

export default About;
