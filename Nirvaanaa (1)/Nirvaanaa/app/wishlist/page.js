import { Suspense } from 'react';
import EnhancedWishlistPage from '@/components/wishlist/EnhancedWishlistPage';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export const metadata = {
  title: 'Wishlist | Save Your Favorite Products',
  description: 'Save your favorite handcrafted embroidery bags and sarees to your wishlist. Easy access to products you love for later purchase.',
  keywords: 'wishlist, save products, favorite embroidery bags, wishlist items',
  openGraph: {
    title: 'Wishlist | Save Your Favorite Products',
    description: 'Save your favorite handcrafted embroidery bags and sarees to your wishlist.',
    type: 'website',
    url: '/wishlist',
  },
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: '/wishlist',
  },
};

export default function WishlistPage() {
  return (
    <div className="min-h-screen bg-cream-50">
      <Suspense fallback={<LoadingSpinner />}>
        <EnhancedWishlistPage />
      </Suspense>
    </div>
  );
}
