import FAQPageClient from './FAQPageClient';

export const metadata = {
  title: 'FAQ | Handcrafted Embroidery Questions',
  description: 'Find answers to common questions about handcrafted embroidery products, orders, shipping, returns, and customization. Get help with your Nirvaanaa purchase.',
  keywords: 'embroidery FAQ, handcrafted bags questions, order help, shipping questions, returns policy, customization options',
  openGraph: {
    title: 'FAQ | Handcrafted Embroidery Questions',
    description: 'Find answers to common questions about handcrafted embroidery products, orders, and shipping.',
    type: 'website',
    url: '/faq',
  },
  alternates: {
    canonical: '/faq',
  },
};

export default function FAQPage() {
  return <FAQPageClient />;
}
