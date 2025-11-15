import CheckoutPageClient from './CheckoutPageClient';

export const metadata = {
  title: 'Checkout | Secure Payment | Nirvaanaa',
  description: 'Complete your purchase of handcrafted embroidery products. Secure checkout with multiple payment options including cards and UPI. Free shipping on orders over ₹1000.',
  keywords: 'checkout, secure payment, embroidery products purchase, UPI payment, card payment, handcrafted bags checkout',
  openGraph: {
    title: 'Checkout | Secure Payment | Nirvaanaa',
    description: 'Complete your purchase of handcrafted embroidery products with secure payment options.',
    type: 'website',
    url: '/checkout',
  },
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: '/checkout',
  },
};

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}
