
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { EnhancedCartProvider } from '@/components/providers/EnhancedCartProvider';
import { EnhancedWishlistProvider } from '@/components/providers/EnhancedWishlistProvider';
import QueryProvider from '@/components/providers/QueryProvider';
// Navbar is rendered inside the client BannerManager component
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';


const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata = {
  title: {
    default: 'Nirvaanaa - Handcrafted Elegance',
    template: '%s | Nirvaanaa',
  },
  description: 'Discover exquisite handmade embroidery bags and sarees. Each piece is crafted with love and attention to detail, bringing you the finest in Indian craftsmanship.',
  keywords: ['handmade', 'embroidery', 'bags', 'sarees', 'Indian crafts', 'artisan', 'handcrafted'],
  authors: [{ name: 'Nirvaanaa' }],
  creator: 'Nirvaanaa',
  publisher: 'Nirvaanaa',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: '/',
    title: 'Nirvaanaa - Handcrafted Elegance',
    description: 'Discover exquisite handmade embroidery bags and sarees. Each piece is crafted with love and attention to detail.',
    siteName: 'Nirvaanaa',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Nirvaanaa - Handcrafted Elegance',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nirvaanaa - Handcrafted Elegance',
    description: 'Discover exquisite handmade embroidery bags and sarees.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};



export default function RootLayout({ children }) {
 

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png"/> 
        <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png"/>
       
                     <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#f5f1eb" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.className} antialiased bg-brand-cream text-gray-900`}>
        <QueryProvider>
          <AuthProvider>
            <EnhancedCartProvider>
              <EnhancedWishlistProvider>
                <div className="min-h-screen flex flex-col">
                  <Navbar/>
                  <main className="flex-grow">
                    {children}
                  </main>
                  <Footer />
                </div>
                <Toaster
                  position="top-center"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#f5f1eb',
                      color: '#8b4513',
                      border: '1px solid #d4af37',
                    },
                    success: {
                      iconTheme: {
                        primary: '#8b4513',
                        secondary: '#f5f1eb',
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: '#dc2626',
                        secondary: '#f5f1eb',
                      },
                    },
                  }}
                />
              </EnhancedWishlistProvider>
            </EnhancedCartProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
