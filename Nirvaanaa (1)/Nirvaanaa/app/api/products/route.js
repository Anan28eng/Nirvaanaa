import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import TagDiscount from '@/models/TagDiscount';
import { emitToAdmin, emitToAll } from '@/lib/socket';




export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
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
      // Handle "bags" category to include all bag-related categories
      if (category === 'bags') {
        query.category = { 
          $in: ['clutch', 'kitty-bag', 'long-tote-bag', 'picnic-bag', 'potli-purse', 'sling-bags', 'velvet-clutch-with-flaps']
        };
      } else {
        query.category = category;
      }
    }

    if (search) {
      // Sanitize search input to prevent regex injection
      const sanitizedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { title: { $regex: sanitizedSearch, $options: 'i' } },
        { description: { $regex: sanitizedSearch, $options: 'i' } },
        { tags: { $in: [new RegExp(sanitizedSearch, 'i')] } },
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      query.tags = { $in: tagArray };
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [rawProducts, total, activeDiscounts] = await Promise.all([
      Product.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean({ virtuals: true }),
      Product.countDocuments(query),
      TagDiscount.find({ active: true }).lean(),
    ]);

    // Normalize products to include frontend-friendly fields (id, name, mainImage, inStock)
    // Build tag->percent map
    const tagToPercent = new Map();
    for (const d of activeDiscounts) {
      tagToPercent.set(d.tag, d.percent);
    }

    const products = rawProducts.map(p => {
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
        id: p._id,
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
    const totalProducts=total;

    const categoryCounts = await Product.aggregate([
  
  { $group: { _id: '$category', count: { $sum: 1 } } }
]);

// Aggregate tag counts
const tagCounts = await Product.aggregate([
  
  { $unwind: '$tags' },
  { $group: { _id: '$tags', count: { $sum: 1 } } }
]);

    return NextResponse.json({
      products,
      totalProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
      categories: categoryCounts.map(c => ({ id: c._id, count: c.count })),
tags: tagCounts.map(t => ({ id: t._id, count: t.count })),
    });
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('@/lib/auth');
    
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    const body = await request.json();

    // Validate required fields
    const { title, description, price, category } = body;
    if (!title || !description || !price || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate category enum
    const validCategories = [
      'bangle-box',
      'clutch',
      'gift-hampers',
      'goggle-cover',
      'kitty-bag',
      'long-tote-bag',
      'picnic-bag',
      'potli-purse',
      'sling-bags',
      'velvet-clutch-with-flaps'
    ];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    // Generate slug from title if not provided
    const slug = body.slug || title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    // Check if slug already exists
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return NextResponse.json(
        { error: 'Product with this slug already exists' },
        { status: 400 }
      );
    }

    // Prepare product data with defaults
    // Normalize and sanitize tags: accept comma or array
    let tags = Array.isArray(body.tags) ? body.tags : (typeof body.tags === 'string' ? body.tags.split(',') : []);
    tags = tags.map(t => String(t).trim().toLowerCase()).filter(Boolean);

    // Validate and clean color variants
    let colorVariants = [];
    if (body.colorVariants && Array.isArray(body.colorVariants)) {
      colorVariants = body.colorVariants
        .filter(v => v && v.name && v.name.trim() && v.hex && /^#[0-9A-Fa-f]{6}$/i.test(v.hex))
        .map(v => ({
          name: v.name.trim(),
          hex: v.hex.trim().toUpperCase(),
          images: Array.isArray(v.images) 
            ? v.images.filter(img => img && (typeof img === 'string' ? img.trim() : img))
              .map(img => typeof img === 'string' ? img.trim() : (img?.url || img))
            : []
        }));
    }

    const productData = {
      ...body,
      slug,
      stock: body.stock || 10, // Default stock
      discount: typeof body.discount === 'number' ? body.discount : 0,
      published: body.published !== undefined ? body.published : true,
      tags,
      colorVariants: colorVariants.length > 0 ? colorVariants : undefined,
      images: body.images || (body.mainImage ? [{
        url: body.mainImage,
        alt: title,
        publicId: `product-${Date.now()}`
      }] : []),
      createdBy: session.user.id,
    };

    const product = new Product(productData);

    await product.save();

    // Emit real-time update to admin
    emitToAdmin('product-changed', { 
      action: 'created', 
      product: product.toObject() 
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

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

    // Hard delete from database
    await Product.findByIdAndDelete(id);

    // Emit real-time update to all clients
    try {
      emitToAdmin('product-changed', { action: 'deleted', productId: id });
      emitToAll('product-changed', { action: 'deleted', productId: id });
    } catch (e) {
      // ignore emit errors
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
