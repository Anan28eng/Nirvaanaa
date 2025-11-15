import ContactPage from '@/components/contact/ContactPage';

export const metadata = {
  title: 'Contact Us | Handcrafted Embroidery Support',
  description: 'Get in touch with Nirvaanaa for questions about handcrafted embroidery products, custom orders, or artisan collaborations. We\'re here to help!',
  keywords: 'contact Nirvaanaa, customer support, embroidery products help, custom orders, artisan collaborations, customer service',
  openGraph: {
    title: 'Contact Us | Handcrafted Embroidery Support',
    description: 'Get in touch with Nirvaanaa for questions about handcrafted embroidery products, custom orders, or collaborations.',
    type: 'website',
    url: '/contact',
  },
  alternates: {
    canonical: '/contact',
  },
};

const Contact = () => {
  return (
    <div className="min-h-screen bg-cream-50">
      <ContactPage />
    </div>
  );
};

export default Contact;
