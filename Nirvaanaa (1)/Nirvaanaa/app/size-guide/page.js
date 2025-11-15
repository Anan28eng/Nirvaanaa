import SizeGuidePageClient from './SizeGuidePageClient';

export const metadata = {
  title: 'Size Guide | Handcrafted Bags Dimensions',
  description: 'Find the perfect size for your handcrafted embroidery bag. Size guide for tote bags, clutches, and accessories with detailed measurements.',
  keywords: 'size guide, bag dimensions, tote bag size, clutch size, embroidery bag measurements',
  openGraph: {
    title: 'Size Guide | Handcrafted Bags Dimensions',
    description: 'Find the perfect size for your handcrafted embroidery bag with our detailed size guide.',
    type: 'website',
    url: '/size-guide',
  },
  alternates: {
    canonical: '/size-guide',
  },
};

export default function SizeGuidePage() {
  return <SizeGuidePageClient />;
}
