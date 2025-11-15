import { Suspense } from 'react';
import ProductGrid from '@/components/products/ProductGrid';
import ProductFilters from '@/components/products/ProductFilters';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export const metadata = {
  title: 'Handcrafted Embroidery Products | Bags & Sarees',
  description: 'Browse our collection of handmade embroidery bags, clutches, potli purses, and sarees. Each piece features traditional Indian craftsmanship and unique designs.',
  keywords: 'embroidery bags, handcrafted sarees, embroidered clutches, potli purse, bangle box, artisan bags, traditional embroidery, handmade accessories',
  openGraph: {
    title: 'Handcrafted Embroidery Products | Bags & Sarees',
    description: 'Browse our collection of handmade embroidery bags, clutches, potli purses, and sarees.',
    type: 'website',
    url: '/products',
  },
  alternates: {
    canonical: '/products',
  },
};

const ProductsPage = ({ searchParams }) => {
  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gold-400 to-gold-600 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-playfair font-bold mb-4">
              Handcrafted Embroidery Collection
            </h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Discover our curated collection of artisan-crafted embroidery bags, clutches, and sarees, 
              each piece showcasing traditional Indian craftsmanship and timeless elegance.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <ProductFilters searchParams={searchParams} />
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <Suspense fallback={<LoadingSpinner />}>
              <ProductGrid searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
