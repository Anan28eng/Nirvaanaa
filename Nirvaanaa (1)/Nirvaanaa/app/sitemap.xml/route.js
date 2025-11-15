import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://www.nirvaanaa.com'; // Replace with your actual domain

  const staticPaths = [
    '',
    'products',
    'about',
    'contact',
    'shipping',
    'returns',
    'size-guide',
    'care-instructions',
    'faq',
  ];

 const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPaths
    .map((path) => {
      return `
        <url>
          <loc>${baseUrl}/${path}</loc>
          <changefreq>monthly</changefreq>
          <priority>0.8</priority>
        </url>
      `;
    })
    .join('')}
</urlset>`;


  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
