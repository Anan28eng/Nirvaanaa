import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import TagDiscount from '@/models/TagDiscount';
import { emitToAdmin, emitToAll } from '@/lib/socket';

const SOCKET_DISABLED = process.env.DISABLE_SOCKET === 'true' || process.env.NODE_ENV === 'production';

function logError(context, err) {
  try {
    console.error(`[api/products] ${context} - message:`, err?.message || err);
    if (err?.stack) console.error(err.stack);
  } catch (e) {
    // best-effort logging
    console.error('[api/products] logging failure', e);
  }
}

function parsePositiveInt(value, fallback) {
  const n = parseInt(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parsePositiveInt(searchParams.get('page'), 1);
    const limit = parsePositiveInt(searchParams.get('limit'), 12);
    if (limit > 200) return NextResponse.json({ error: 'limit too large' }, { status: 400 });

    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const tags = searchParams.get('tags');
    const featured = searchParams.get('featured');
    const inStock = searchParams.get('inStock');

    // Build query
    const query = { published: true };

    if (category) {
      if (category === 'bags') {
        query.category = {
          $in: ['clutch', 'kitty-bag', 'long-tote-bag', 'picnic-bag', 'potli-purse', 'sling-bags', 'velvet-clutch-with-flaps'],
        };
      } else {
        query.category = category;
      }
    }

    if (search) {
      const sanitizedSearch = String(search).replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
      query.$or = [
        { title: { $regex: sanitizedSearch, $options: 'i' } },
        { description: { $regex: sanitizedSearch, $options: 'i' } },
        { tags: { $in: [new RegExp(sanitizedSearch, 'i')] } },
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice && !Number.isNaN(Number(minPrice))) query.price.$gte = Number(minPrice);
      if (maxPrice && !Number.isNaN(Number(maxPrice))) query.price.$lte = Number(maxPrice);
    }

    if (tags) {
      const tagArray = String(tags).split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
      if (tagArray.length) query.tags = { $in: tagArray };
    }

    if (featured === 'true') query.featured = true;
    if (inStock === 'true') query.stock = { $gt: 0 };

    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const [rawProducts, total, activeDiscounts] = await Promise.all([
      Product.find(query).sort(sortObj).skip(skip).limit(limit).lean({ virtuals: true }),
      Product.countDocuments(query),
      TagDiscount.find({ active: true }).lean(),
    ]);

    const tagToPercent = new Map();
    for (const d of activeDiscounts || []) tagToPercent.set(d.tag, d.percent);

    const products = (rawProducts || []).map((p) => {
      const baseDiscount = typeof p.discount === 'number' ? p.discount : 0;
      let tagDiscount = 0;
      if (Array.isArray(p.tags) && p.tags.length) {
        for (const t of p.tags) {
          const pct = tagToPercent.get(String(t).toLowerCase());
          if (typeof pct === 'number') tagDiscount = Math.max(tagDiscount, pct);
        }
      }
      const effectiveDiscount = Math.max(baseDiscount, tagDiscount);
      return {
        ...p,
        id: p._1,
        name: p.title,
        mainImage: (p.images && p.images.length > 0) ? p.images[0].url : (p.mainImage || null),
        inStock: typeof p.stock === 'number' ? p.stock > 0 : false,
        price: typeof p.price === 'number' ? p.price : Number(p.price || 0),
        discount: effectiveDiscount,
      };
    });

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const categoryCounts = await Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
    const tagCounts = await Product.aggregate([{ $unwind: '$tags' }, { $group: { _id: '$tags', count: { $sum: 1 } } }]);

    return NextResponse.json({
      products,
      totalProducts: total,
      pagination: { page, limit, total, totalPages, hasNextPage, hasPrevPage },
      categories: (categoryCounts || []).map((c) => ({ id: c._id, count: c.count })),
      tags: (tagCounts || []).map((t) => ({ id: t._id, count: t.count })),
    });
  } catch (error) {
    logError('GET', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

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

    const { title, description, price, category } = body || {};
    if (!title || !description || (price === undefined || price === null) || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const validCategories = [
      'bangle-box', 'clutch', 'gift-hampers', 'goggle-cover', 'kitty-bag', 'long-tote-bag', 'picnic-bag', 'potli-purse', 'sling-bags', 'velvet-clutch-with-flaps',
    ];
    if (!validCategories.includes(category)) return NextResponse.json({ error: 'Invalid category' }, { status: 400 });

    const slug = body.slug || String(title).toLowerCase().replace(/[^a-z0-9\\s-]/g, '').replace(/\\s+/g, '-').replace(/-+/g, '-').trim();

    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) return NextResponse.json({ error: 'Product with this slug already exists' }, { status: 400 });

    let tags = Array.isArray(body.tags) ? body.tags : (typeof body.tags === 'string' ? body.tags.split(',') : []);
    tags = tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean);

    let colorVariants = [];
    if (body.colorVariants && Array.isArray(body.colorVariants)) {
      colorVariants = body.colorVariants
        .filter((v) => v && v.name && v.name.trim() && v.hex && /^#[0-9A-Fa-f]{6}$/i.test(v.hex))
        .map((v) => ({
          name: v.name.trim(),
          hex: v.hex.trim().toUpperCase(),
          images: Array.isArray(v.images) ? v.images.filter(Boolean).map((img) => (typeof img === 'string' ? img.trim() : (img?.url || img))) : [],
        }));
    }

    const productData = {
      ...body,
      slug,
      stock: body.stock || 10,
      discount: typeof body.discount === 'number' ? body.discount : 0,
      published: body.published !== undefined ? body.published : true,
      tags,
      colorVariants: colorVariants.length > 0 ? colorVariants : undefined,
      images: body.images || (body.mainImage ? [{ url: body.mainImage, alt: title, publicId: `product-${Date.now()}` }] : []),
      createdBy: session.user.id,
    };

    const product = new Product(productData);
    await product.save();

    if (!SOCKET_DISABLED) {
      try {
        emitToAdmin('product-changed', { action: 'created', product: product.toObject() });
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

export async function DELETE(request) {
  try {
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('@/lib/auth');
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
