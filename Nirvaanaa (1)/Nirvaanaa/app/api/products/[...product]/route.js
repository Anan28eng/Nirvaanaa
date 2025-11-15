import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Post from '@/models/Post';
import mongoose from 'mongoose';
import { emitToAdmin, emitToAll } from '@/lib/socket';

function looksLikeObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const raw = Array.isArray(params.product) ? params.product[params.product.length - 1] : params.product;

    let product;

    if (looksLikeObjectId(raw)) {
      product = await Product.findById(raw).lean({ virtuals: true } );
    }

    if (!product) {
      // try slug
      product = await Product.findOne({ slug: raw, published: true }).lean({ virtuals: true });
    }

    if (!product) {
      // try name search (case-insensitive)
      product = await Product.findOne({ title: new RegExp(`^${raw}$`, 'i'), published: true }).lean({ virtuals: true });
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      published: true,
    })
      .limit(4)
      .lean({ virtuals: true });

    const relatedPosts = await Post.findByProduct(product._id).limit(3);

    return NextResponse.json({ product, relatedProducts, relatedPosts });
  } catch (error) {
    console.error('Product API error:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('@/lib/auth');

    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const raw = Array.isArray(params.product) ? params.product[params.product.length - 1] : params.product;
    const body = await request.json();

    let product = null;
    if (looksLikeObjectId(raw)) product = await Product.findById(raw);
    if (!product) product = await Product.findOne({ slug: raw });

    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    // Validate category if provided
    if (body.category) {
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
      if (!validCategories.includes(body.category)) {
        return NextResponse.json(
          { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Validate and clean color variants if provided
    if (body.colorVariants !== undefined) {
      if (Array.isArray(body.colorVariants)) {
        body.colorVariants = body.colorVariants
          .filter(v => v && v.name && v.name.trim() && v.hex && /^#[0-9A-Fa-f]{6}$/i.test(v.hex))
          .map(v => ({
            name: v.name.trim(),
            hex: v.hex.trim().toUpperCase(),
            images: Array.isArray(v.images) 
              ? v.images.filter(img => img && (typeof img === 'string' ? img.trim() : img))
                .map(img => typeof img === 'string' ? img.trim() : (img?.url || img))
              : []
          }));
      } else if (body.colorVariants === null) {
        body.colorVariants = [];
      }
    }

    Object.assign(product, body);
    await product.save();

    // Emit real-time update
    try {
      const updated = await Product.findById(product._id).lean({ virtuals: true });
      emitToAdmin('product-changed', { action: 'updated', product: updated });
      emitToAll('product-changed', { action: 'updated', product: updated });
    } catch (e) {
      // ignore emit errors
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('@/lib/auth');

    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const raw = Array.isArray(params.product) ? params.product[params.product.length - 1] : params.product;

    let product = null;
    if (looksLikeObjectId(raw)) product = await Product.findById(raw);
    if (!product) product = await Product.findOne({ slug: raw });

    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    // Hard delete from database
    await Product.findByIdAndDelete(product._id);

    // Emit real-time update to all clients
    try {
      emitToAdmin('product-changed', { action: 'deleted', productId: product._id });
      emitToAll('product-changed', { action: 'deleted', productId: product._id });
    } catch (e) {
      // ignore emit errors
    }

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
