import CareInstructionsPageClient from './CareInstructionsPageClient';

export const metadata = {
  title: 'Care Instructions | Handcrafted Embroidery Care',
  description: 'Learn how to care for your handcrafted embroidery bags and sarees. Proper cleaning, storage, and maintenance tips to preserve your artisan-crafted pieces.',
  keywords: 'embroidery care, handcrafted bag care, cleaning instructions, storage tips, maintenance guide',
  openGraph: {
    title: 'Care Instructions | Handcrafted Embroidery Care',
    description: 'Learn how to care for your handcrafted embroidery bags and sarees with proper cleaning and storage tips.',
    type: 'website',
    url: '/care-instructions',
  },
  alternates: {
    canonical: '/care-instructions',
  },
};

export default function CareInstructionsPage() {
  return <CareInstructionsPageClient />;
}
