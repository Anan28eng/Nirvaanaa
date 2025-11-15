import Announcement from '@/models/Announcement.js';
import dbConnect from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await dbConnect();
    const ad = await Announcement.findAdBanner();
    const announcement = await Announcement.findAnnouncementBanner();

    // Fallback: return latest banners even if not active so admin can see/edit them
    const latestAd = ad || await Announcement.findOne({ type: 'adbanner' }).sort({ createdAt: -1 }).lean();
    const latestAnnouncement = announcement || await Announcement.findOne({ type: 'announcement' }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ banners: { ad: latestAd || null, announcement: latestAnnouncement || null } }, { status: 200 });
  } catch (err) {
    console.error('GET /api/banners error:', err);
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
  }
}
