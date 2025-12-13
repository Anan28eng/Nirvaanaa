import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { emitToUser, emitToAdmin, emitToAll } from '@/lib/socket';

export async function GET(req) {
  try {
    await dbConnect();
    // If email query provided, return user's cart; otherwise return empty items
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    if (email) {
      const user = await User.findOne({ email: email.toLowerCase() }).lean();
      return NextResponse.json({ items: user?.cart || [] });
    }
    return NextResponse.json({ items: [] });
  } catch (err) {
    console.error('GET /api/cart', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
  const body = await req.json();
  // debug: log incoming payload for troubleshooting
  console.debug('[DEBUG] /api/cart POST body:', JSON.stringify(body));
    const { productId, name, price, image, quantity = 1, slug, items } = body;
    const getColorKey = (color) => {
      if (!color) return '';
      return (color.hex || color.name || '').toString();
    };
    
    if (body.email) {
      const user = await User.findOne({ email: body.email.toLowerCase() });
      if (user) {
        if (items) {
          // Bulk update cart items - compute deltas vs existing cart, validate and apply stock/sales changes
          // Map existing by productId + color key so different color variants are separate
          const existingMap = new Map(user.cart.map(i => [`${String(i.productId)}::${getColorKey(i.colorVariant)}`, i.quantity]));
          for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) continue;
            const key = `${String(item.productId)}::${getColorKey(item.colorVariant)}`;
            const prevQty = existingMap.get(key) || 0;
            const delta = (item.quantity || 0) - prevQty;
            if (delta > 0 && product.stock < delta) {
              return NextResponse.json(
                { error: `Only ${product.stock} items available for ${product.title}` },
                { status: 400 }
              );
            }
          }
          // Apply updates: set cart, then adjust stock and sales by deltas
          user.cart = items.map(it => ({ 
            ...it, 
            discount: it.discount || 0,
            colorVariant: it.colorVariant || null
          }));
          for (const it of items) {
            try {
              const key = `${String(it.productId)}::${getColorKey(it.colorVariant)}`;
              const prevQty = existingMap.get(key) || 0;
              const delta = (it.quantity || 0) - prevQty;
              if (delta !== 0) {
                const updated = await Product.findByIdAndUpdate(it.productId, {
                  $inc: {
                    stock: -delta, // positive delta reduces stock; negative delta increases stock
                    salesCount: delta,
                  }
                }, { new: true }).lean();
                try { emitToAdmin('product-changed', { action: 'updated', product: updated }); } catch (e) {}
              }
            } catch (e) {
              // ignore per-item failures
            }
          }
        } else {
          // Single item update - check stock availability
          const product = await Product.findById(productId);
          if (product && product.stock < quantity) {
            return NextResponse.json(
              { error: `Only ${product.stock} items available for ${product.title}` },
              { status: 400 }
            );
          }

          const colorKey = getColorKey(body.colorVariant);
          const existing = user.cart.find(i => String(i.productId) === String(productId) && getColorKey(i.colorVariant) === colorKey);
          if (existing) {
            const newQuantity = existing.quantity + quantity;
            if (product && product.stock < newQuantity) {
              return NextResponse.json(
                { error: `Cannot add ${quantity} more items. Only ${product.stock - existing.quantity} available` },
                { status: 400 }
              );
            }
            existing.quantity = newQuantity;
            // increment salesCount for added quantity and decrement stock by added quantity
            try { await Product.findByIdAndUpdate(productId, { $inc: { salesCount: quantity, stock: -quantity } }); } catch(e) {}
          } else {
            user.cart.push({ 
              productId, 
              name, 
              price, 
              discount: body.discount || 0, 
              image, 
              quantity, 
              slug,
              colorVariant: body.colorVariant || null
            });
            // increment salesCount and decrement stock for newly added product
            try { await Product.findByIdAndUpdate(productId, { $inc: { salesCount: quantity, stock: -quantity } }); } catch(e) {}
          }
        }
        await user.save();
        
  // Emit real-time update to user and admin
  emitToUser(body.email, 'cart-changed', { items: user.cart });
  try {
    // Broadcast updated product snapshot if we mutated a specific product
    if (productId) {
      const updated = await Product.findById(productId).lean();
      emitToAdmin('product-changed', { action: 'updated', product: updated });
      emitToAll('product-changed', { action: 'updated', product: updated });
    }
  } catch(e) {}
      }
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { productId, quantity, email } = body;
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return NextResponse.json({ error: 'user not found' }, { status: 404 });
    // Prefer matching by productId + colorVariant if provided
    const getColorKey = (color) => {
      if (!color) return '';
      return (color.hex || color.name || '').toString();
    };
    const colorKey = getColorKey(body.colorVariant);
    const item = user.cart.find(i => String(i.productId) === String(productId) && getColorKey(i.colorVariant) === colorKey);
    if (!item) return NextResponse.json({ error: 'item not in cart' }, { status: 404 });
    // Adjust product stock/sales based on delta
    const prevQty = item.quantity;
    const delta = quantity - prevQty;
    if (delta !== 0) {
      const product = await Product.findById(productId);
      if (!product) return NextResponse.json({ error: 'product not found' }, { status: 404 });
      if (delta > 0 && product.stock < delta) {
        return NextResponse.json({ error: `Only ${product.stock} items available for ${product.title}` }, { status: 400 });
      }
      const updated = await Product.findByIdAndUpdate(productId, { $inc: { stock: -delta, salesCount: delta } }, { new: true }).lean();
      try { emitToAdmin('product-changed', { action: 'updated', product: updated }); } catch(e) {}
    }
    item.quantity = quantity;
    await user.save();
    
    // Emit real-time update
    emitToUser(email, 'cart-changed', { items: user.cart });
    
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await dbConnect();
    const contentType = req.headers.get('content-type') || '';
    let productId, email;
    if (contentType.includes('application/json')) {
      const body = await req.json();
      productId = body.productId;
      email = body.email;
    } else {
      const { searchParams } = new URL(req.url);
      productId = searchParams.get('productId');
      email = searchParams.get('email');
    }
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return NextResponse.json({ error: 'user not found' }, { status: 404 });
    // Restore stock and decrement salesCount by the removed quantity
    const getColorKey = (color) => {
      if (!color) return '';
      return (color.hex || color.name || '').toString();
    };
    let removedItems = [];
    if (req.headers.get('content-type')?.includes('application/json')) {
      // If client provided colorVariant, only remove matching productId+color
      const body = await req.json();
      const colorKey = getColorKey(body.colorVariant);
      if (body.colorVariant) {
        removedItems = user.cart.filter(i => String(i.productId) === String(productId) && getColorKey(i.colorVariant) === colorKey);
        user.cart = user.cart.filter(i => !(String(i.productId) === String(productId) && getColorKey(i.colorVariant) === colorKey));
      } else {
        removedItems = user.cart.filter(i => String(i.productId) === String(productId));
        user.cart = user.cart.filter(i => String(i.productId) !== String(productId));
      }
    } else {
      // query params path: remove by productId only
      removedItems = user.cart.filter(i => String(i.productId) === String(productId));
      user.cart = user.cart.filter(i => String(i.productId) !== String(productId));
    }
    for (const removed of removedItems) {
      try {
        const updated = await Product.findByIdAndUpdate(removed.productId, { $inc: { stock: removed.quantity, salesCount: -removed.quantity } }, { new: true }).lean();
        try { emitToAdmin('product-changed', { action: 'updated', product: updated }); } catch(e) {}
      } catch (e) {
        // ignore failures
      }
    }
    await user.save();
    
    // Emit real-time update
    emitToUser(email, 'cart-changed', { items: user.cart });
    
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
