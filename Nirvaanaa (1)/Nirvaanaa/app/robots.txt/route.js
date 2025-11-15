import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.nirvaanaa.com';
  
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /checkout/
Disallow: /cart/
Disallow: /wishlist/
Disallow: /auth/
Disallow: /dashboard/
Disallow: /my-orders/
Disallow: /settings/
Disallow: /test-payment/

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay
Crawl-delay: 1

# Allow Googlebot
User-agent: Googlebot
Allow: /
Crawl-delay: 0

# Allow Bingbot
User-agent: Bingbot
Allow: /
Crawl-delay: 1
`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}

