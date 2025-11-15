import Announcement from '@/models/Announcement.js';
import dbConnect from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function PATCH(req, { params }) {
  try {
    await dbConnect();
    const { id } = params || {};
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const body = await req.json();

    // allow updating visible fields and content
    const update = {};
    if (typeof body.visible === 'boolean') {
      if (body.type === 'ad') update.isAdBannerActive = body.visible;
      if (body.type === 'announcement') update.isAnnouncementActive = body.visible;
    }
    if (typeof body.content === 'string') {
      // depending on banner type, write text or image
      if (body.type === 'ad') update.text = body.content;
      if (body.type === 'announcement') update.image = body.content;
    }
    if (typeof body.backgroundColor === 'string') update.backgroundColor = body.backgroundColor;
    if (typeof body.textColor === 'string') update.textColor = body.textColor;

    const banner = await Announcement.findByIdAndUpdate(id, update, { new: true });
    if (!banner) return NextResponse.json({ error: 'Banner not found' }, { status: 404 });

    // notify any front-end listeners (serverless environment cannot push; client will poll or use events)
    return NextResponse.json({ banner }, { status: 200 });
  } catch (err) {
    console.error('PATCH /api/banners/[id] error:', err);
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 });
  }
}
