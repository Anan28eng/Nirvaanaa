import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import { emitToUser } from '@/lib/socket';

export async function POST(req) {
  try {
    await dbConnect();
  const body = await req.json();
  // debug: log incoming payload shape for troubleshooting
  console.debug('[DEBUG] /api/wishlist POST body:', JSON.stringify(body));
    const { productId, name, price, image, slug, email, items, discount } = body || {};
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return NextResponse.json({ error: 'user not found' }, { status: 404 });
    
    if (items) {
      // Bulk update wishlist items - ensure discount preserved
      user.wishlist = items.map(it => ({ ...it, discount: it.discount || 0 }));
    } else {
      // Single item update
      const exists = user.wishlist.find(i => String(i.productId) === String(productId));
      if (!exists) user.wishlist.push({ productId, name, price, image, slug, discount: discount || 0 });
    }
    
    await user.save();
    
    // Emit real-time update
    emitToUser(email, 'wishlist-changed', { items: user.wishlist });
    
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const email = searchParams.get('email');
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return NextResponse.json({ error: 'user not found' }, { status: 404 });
    user.wishlist = user.wishlist.filter(i => String(i.productId) !== String(productId));
    await user.save();
    
    // Emit real-time update
    emitToUser(email, 'wishlist-changed', { items: user.wishlist });
    
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });
    const user = await User.findOne({ email: email.toLowerCase() }).lean();
    if (!user) return NextResponse.json({ error: 'user not found' }, { status: 404 });
    return NextResponse.json({ wishlist: user.wishlist || [] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
