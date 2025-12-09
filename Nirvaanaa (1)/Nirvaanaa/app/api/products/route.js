import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import TagDiscount from '@/models/TagDiscount';
import { emitToAdmin, emitToAll } from '@/lib/socket';

const SOCKET_DISABLED =
  process.env.DISABLE_SOCKET === 'true' ||
  process.env.NODE_ENV === 'production';

function logError(context, err) {
  try {
    console.error(`[api/products] ${context} - message:`, err?.message || err);
    if (err?.stack) console.error(err.stack);
  } catch (e) {
    console.error('[api/products] logging failure', e);
  }
}

function parsePositiveInt(value, fallback) {
  const n = parseInt(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/* ---------------------------------------------------------
   GET PRODUCTS
--------------------------------------------------------- */
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const categoryParam = (searchParams.get('category') || '').trim().toLowerCase();
    const excludeId = searchParams.get('exclude');
    const limit = parsePositiveInt(searchParams.get('limit'), 2000);
    const featuredParam = (searchParams.get('featured') || '').trim().toLowerCase();
    const inStockParam = (searchParams.get('inStock') || '').trim().toLowerCase();

    const query = { published: true };

    const bagCategories = [
      'bangle-box', 'clutch', 'kitty-bag', 'long-tote-bag',
      'picnic-bag', 'potli-purse', 'sling-bags',
      'velvet-clutch-with-flaps'
    ];

    if (categoryParam) {
      if (categoryParam === 'bags') {
        query.category = { $in: bagCategories };
      } else if (categoryParam === 'sarees') {
        query.$or = [
          { category: 'sarees' },
          { tags: { $in: [/saree/i] } },
          { title: { $regex: /saree/i } },
          { description: { $regex: /saree/i } }
        ];
      } else {
        query.category = categoryParam;
      }
    }

    if (featuredParam === 'true') query.featured = true;
    if (featuredParam === 'false') query.featured = false;

    if (inStockParam === 'true') query.stock = { $gt: 0 };
    if (inStockParam === 'false') query.stock = { $lte: 0 };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const rawProducts = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean({ virtuals: true });

    const products = (rawProducts || []).map((p) => ({
      ...p,
      id: p._id,
      name: p.title,
      mainImage: p.images?.[0]?.url || p.mainImage || null,
      inStock: typeof p.stock === 'number' ? p.stock > 0 : false,
      price: typeof p.price === 'number' ? p.price : Number(p.price || 0),
    }));

    return NextResponse.json({ products, totalProducts: products.length });
  } catch (error) {
    logError('GET', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/* ---------------------------------------------------------
   CREATE PRODUCT
--------------------------------------------------------- */
export async function POST(request) {
  try {
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('@/lib/auth');

    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();

    const { title, description, price, category } = body;

    if (!title || !description || price === undefined || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const validCategories = [
      'bangle-box', 'clutch', 'gift-hampers', 'goggle-cover',
      'kitty-bag', 'long-tote-bag', 'picnic-bag', 'potli-purse',
      'sling-bags', 'velvet-clutch-with-flaps'
    ];

    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    const slug =
      body.slug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return NextResponse.json({ error: 'Product with this slug already exists' }, { status: 400 });
    }

    let tags = Array.isArray(body.tags)
      ? body.tags
      : typeof body.tags === 'string'
      ? body.tags.split(',')
      : [];

    tags = tags.map((t) => t.trim().toLowerCase()).filter(Boolean);

    let colorVariants = [];
    if (Array.isArray(body.colorVariants)) {
      colorVariants = body.colorVariants
        .filter((v) => v?.name?.trim() && v.hex && /^#[0-9A-Fa-f]{6}$/i.test(v.hex))
        .map((v) => ({
          name: v.name.trim(),
          hex: v.hex.trim().toUpperCase(),
          images: Array.isArray(v.images)
            ? v.images.filter(Boolean).map((img) =>
                typeof img === 'string' ? img.trim() : img?.url || img
              )
            : [],
        }));
    }

    const productData = {
      ...body,
      slug,
      stock: body.stock || 10,
      discount: typeof body.discount === 'number' ? body.discount : 0,
      published: body.published ?? true,
      tags,
      colorVariants: colorVariants.length > 0 ? colorVariants : undefined,
      images:
        body.images ||
        (body.mainImage
          ? [
              {
                url: body.mainImage,
                alt: title,
                publicId: `product-${Date.now()}`,
              },
            ]
          : []),
      createdBy: session.user.id,
    };

    const product = new Product(productData);
    await product.save();

    if (!SOCKET_DISABLED) {
      try {
        emitToAdmin('product-changed', {
          action: 'created',
          product: product.toObject(),
        });
      } catch (e) {
        logError('emitToAdmin', e);
      }
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    logError('POST', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/* ---------------------------------------------------------
   DELETE PRODUCT
--------------------------------------------------------- */
export async function DELETE(request) {
  try {
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('@/lib/auth');
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const product = await Product.findById(id);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    await Product.findByIdAndDelete(id);

    if (!SOCKET_DISABLED) {
      try {
        emitToAdmin('product-changed', { action: 'deleted', productId: id });
        emitToAll('product-changed', { action: 'deleted', productId: id });
      } catch (e) {
        logError('emit-delete', e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError('DELETE', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
