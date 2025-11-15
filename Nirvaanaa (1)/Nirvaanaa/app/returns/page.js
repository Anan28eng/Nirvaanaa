import ReturnsPageClient from './ReturnsPageClient';

export const metadata = {
  title: 'Return Policy | 14-Day Returns | Nirvaanaa',
  description: 'Learn about our return policy for handcrafted embroidery products. 14-day return window for eligible items. Easy returns process with full refunds.',
  keywords: 'return policy, embroidery products returns, 14 day returns, refund policy, handcrafted bags returns',
  openGraph: {
    title: 'Return Policy | 14-Day Returns | Nirvaanaa',
    description: 'Learn about our return policy for handcrafted embroidery products. 14-day return window available.',
    type: 'website',
    url: '/returns',
  },
  alternates: {
    canonical: '/returns',
  },
};

export default function ReturnsPage() {
  return <ReturnsPageClient />;
}
