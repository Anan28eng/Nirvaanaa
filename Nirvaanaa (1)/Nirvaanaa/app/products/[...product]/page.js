import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import ProductDetail from '@/components/products/ProductDetail';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ProductSchema, BreadcrumbSchema } from '@/components/seo/StructuredData';

function normalizeParam(param) {
  if (Array.isArray(param)) return param[param.length - 1];
  return param;
}

async function getProduct(identifier) {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${base}/api/products/${identifier}`, {
      next: { revalidate: 3600 }
    });

    if (!response.ok) return null;
  const body = await response.json();
  return body?.product || body;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  try {
    const identifier = normalizeParam(params.product);
    const base = process.env.NEXT_PUBLIC_API_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${base}/api/products/${identifier}`);
    if (!response.ok) {
      return {
        title: 'Product Not Found | Nirvaanaa',
        description: 'The requested product could not be found.'
      };
    }

  const body = await response.json();
  const product = body?.product || body;
  
  // Optimize title (max 60 chars)
  const title = product.title?.length > 40 
    ? `${product.title.substring(0, 40)}... | Nirvaanaa`
    : `${product.title} | Handcrafted Embroidery`;
  
  // Optimize description (150-160 chars)
  const shortDesc = product.shortDescription || product.description?.substring(0, 100) || '';
  const category = product.category?.replace(/-/g, ' ') || 'embroidery product';
  const description = product.description 
    ? (product.description.length > 160 ? product.description.substring(0, 157) + '...' : product.description)
    : `Shop ${product.title}, a handcrafted ${category} with traditional Indian embroidery. Artisan-made with premium materials. Free shipping available.`;
  
  return {
    title,
    description,
    keywords: [
      product.title?.toLowerCase(),
      'handcrafted embroidery',
      product.category?.replace(/-/g, ' '),
      ...(product.tags || [])
    ].filter(Boolean).join(', '),
    openGraph: {
      title,
      description,
      images: product.mainImage ? [product.mainImage] : ['/og-image.jpg'],
      type: 'website',
      url: `/products/${product.slug || product._id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: product.mainImage ? [product.mainImage] : [],
    },
    alternates: {
      canonical: `/products/${product.slug || product._id}`,
    },
  };
  } catch (error) {
    return {
      title: 'Product | Nirvaanaa',
      description: 'Discover our handcrafted embroidery products.'
    };
  }
}

const ProductPage = async ({ params }) => {
  const identifier = normalizeParam(params.product);
  const product = await getProduct(identifier);

  if (!product) notFound();

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
    { name: product.category?.replace(/-/g, ' ') || 'Product', url: `/products?category=${product.category}` },
    { name: product.title, url: `/products/${product.slug || product._id}` }
  ];

  return (
    <>
      <ProductSchema product={product} />
      <BreadcrumbSchema items={breadcrumbItems} />
      <div className="min-h-screen bg-cream-50">
        <Suspense fallback={<LoadingSpinner />}>
          <ProductDetail product={product} />
        </Suspense>
      </div>
    </>
  );
};

export default ProductPage;
