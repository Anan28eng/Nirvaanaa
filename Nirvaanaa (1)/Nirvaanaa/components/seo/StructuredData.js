'use client';

/**
 * Structured Data Component for SEO
 * Adds JSON-LD structured data to pages
 */

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Nirvaanaa",
    "url": process.env.NEXT_PUBLIC_APP_URL || "https://www.nirvaanaa.com",
    "logo": `${process.env.NEXT_PUBLIC_APP_URL || "https://www.nirvaanaa.com"}/logo.png`,
    "description": "Handcrafted embroidery bags and sarees with traditional Indian craftsmanship",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-7763853089",
      "contactType": "customer service",
      "email": "libramank@gmail.com",
      "areaServed": "IN",
      "availableLanguage": ["en", "hi"]
    },
    "sameAs": [
      "https://www.instagram.com/nirvaanaa_corporategifting?utm_source=qr&igsh=ZjhvbDg2MzE1Zzl1",
      "https://wa.me/917763853089"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebsiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Nirvaanaa",
    "url": process.env.NEXT_PUBLIC_APP_URL || "https://www.nirvaanaa.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${process.env.NEXT_PUBLIC_APP_URL || "https://www.nirvaanaa.com"}/products?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ProductSchema({ product }) {
  if (!product) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title || product.name,
    "description": product.description || product.shortDescription,
    "image": product.mainImage || (product.images?.[0]?.url),
    "brand": {
      "@type": "Brand",
      "name": "Nirvaanaa"
    },
    "offers": {
      "@type": "Offer",
      "url": `${process.env.NEXT_PUBLIC_APP_URL || "https://www.nirvaanaa.com"}/products/${product.slug || product._id}`,
      "priceCurrency": "INR",
      "price": product.price,
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Nirvaanaa"
      }
    },
    "aggregateRating": product.ratings?.average ? {
      "@type": "AggregateRating",
      "ratingValue": product.ratings.average,
      "reviewCount": product.ratings.count || 0
    } : undefined
  };

  // Remove undefined fields
  Object.keys(schema).forEach(key => schema[key] === undefined && delete schema[key]);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbSchema({ items }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FAQSchema({ faqs }) {
  if (!faqs || faqs.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

