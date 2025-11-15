import { Suspense } from 'react';
import EnhancedCartPage from '@/components/cart/EnhancedCartPage';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export const metadata = {
  title: 'Shopping Cart | Handcrafted Embroidery',
  description: 'Review your selected handcrafted embroidery bags and sarees. Secure checkout with free shipping on orders over ₹1000.',
  keywords: 'shopping cart, embroidery products cart, handcrafted bags checkout, secure payment',
  openGraph: {
    title: 'Shopping Cart | Handcrafted Embroidery',
    description: 'Review your selected handcrafted embroidery bags and sarees. Secure checkout available.',
    type: 'website',
    url: '/cart',
  },
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: '/cart',
  },
};

const Cart = () => {
  return (
    <div className="min-h-screen bg-cream-50">
      <Suspense fallback={<LoadingSpinner />}>
        <EnhancedCartPage />
      </Suspense>
    </div>
  );
};

export default Cart;
