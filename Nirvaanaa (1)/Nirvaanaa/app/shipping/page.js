import ShippingPageClient from './ShippingPageClient';

export const metadata = {
  title: 'Shipping Policy | Free Shipping Over ₹1000',
  description: 'Learn about our shipping options for handcrafted embroidery products. Domestic 3-7 days, international 7-21 days. Free shipping on orders over ₹1000.',
  keywords: 'shipping policy, embroidery products shipping, free shipping, domestic shipping, international shipping, delivery times',
  openGraph: {
    title: 'Shipping Policy | Free Shipping Over ₹1000',
    description: 'Learn about our shipping options for handcrafted embroidery products. Free shipping available.',
    type: 'website',
    url: '/shipping',
  },
  alternates: {
    canonical: '/shipping',
  },
};

export default function ShippingPage() {
  return <ShippingPageClient />;
}
