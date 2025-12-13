import React from 'react';
import { render, screen } from '@testing-library/react';
import ProductDetail from '@/components/products/ProductDetail';

// Mock next-auth session to simulate anonymous user
jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: null })
}));

// Mock cart and wishlist providers' hooks used by ProductDetail
jest.mock('@/components/providers/EnhancedCartProvider', () => ({
  useEnhancedCart: () => ({ addToCart: jest.fn() })
}));
jest.mock('@/components/providers/EnhancedWishlistProvider', () => ({
  useEnhancedWishlist: () => ({ addToWishlist: jest.fn() })
}));

// Mock the admin store hook to simulate a stale product in the store
jest.mock('@/lib/stores', () => {
  return {
    useAdminStore: () => ({
      products: [
        {
          _id: 'prod-1',
          id: 'prod-1',
          title: 'Stale Product',
          price: 100,
          stock: 10,
          images: [], // stale store lacks images
          colorVariants: [],
        }
      ],
      addProduct: jest.fn(),
      updateProduct: jest.fn(),
    }),
  };
});

// Stub out nested components that pull in react-query or other providers
jest.mock('@/components/products/ProductReviews', () => (props) => {
  return null;
});
jest.mock('@/components/products/ProductTestimonial', () => (props) => {
  return null;
});
jest.mock('@/components/ui/SocialShare', () => (props) => null);

// Minimal server product data (full colorVariants/images)
const serverProduct = {
  _id: 'prod-1',
  id: 'prod-1',
  title: 'Fresh Product',
  price: 100,
  stock: 5,
  mainImage: '/images/fresh.jpg',
  images: ['/images/fresh.jpg'],
  colorVariants: [
    { name: 'Red', hex: '#FF0000', images: ['/images/fresh-red.jpg'] },
    { name: 'Blue', hex: '#0000FF', images: ['/images/fresh-blue.jpg'] }
  ]
};

describe('ProductDetail smoke', () => {
  it('renders color variants when store copy is stale', () => {
    render(<ProductDetail product={serverProduct} />);

    // Expect the color names to appear in the document
    expect(screen.getByText(/Color:/i)).toBeInTheDocument();
    expect(screen.getByText(/Red/i)).toBeInTheDocument();
    expect(screen.getByText(/Blue/i)).toBeInTheDocument();

    // Expect main image to be shown (alt text contains product title)
    expect(screen.getAllByAltText(/Fresh Product/i).length).toBeGreaterThan(0);
  });
});
