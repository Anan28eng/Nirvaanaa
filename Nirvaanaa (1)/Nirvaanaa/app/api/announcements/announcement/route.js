import Announcement from '@/models/Announcement.js';
import dbConnect from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    await dbConnect();
    const banner = await Announcement.findAnnouncementBanner();
    if (!banner || !banner.isAnnouncementActive) {
      return NextResponse.json({ error: 'No active banner found' }, { status: 404 });
    }
    return NextResponse.json({ banner }, { status: 200 });
  } catch (err) {
    console.error('GET banner error:', err);
    return NextResponse.json({ error: 'Failed to fetch banner' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { id } = body || {};
    if (!id) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Build flexible update allowing optional fields; only set provided fields
    const update = {};
    if (typeof body.isAnnouncementActive === 'boolean') update.isAnnouncementActive = body.isAnnouncementActive;
    
    if (typeof body.backgroundColor === 'string') update.backgroundColor = body.backgroundColor;
    
    if (typeof body.image === 'string') update.image = body.image;
    if (typeof body.priority === 'number') update.priority = body.priority;
    if (typeof body.link === 'object' && body.link) update.link = body.link;
    if (body.startDate) update.startDate = new Date(body.startDate);
    if (body.endDate) update.endDate = new Date(body.endDate);

    const banner = await Announcement.findByIdAndUpdate(id, update, { new: true });
    if (!banner) return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    return NextResponse.json({ banner }, { status: 200 });
  } catch (err) {
    console.error('PUT banner error:', err);
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { image, backgroundColor, link, priority, startDate, endDate } = body || {};
    if (!image) return NextResponse.json({ error: 'Image is required' }, { status: 400 });

    const created = await Announcement.create({
      type: 'announcement',
     
      image: typeof image === 'string' ? image : undefined,
      backgroundColor: typeof backgroundColor === 'string' ? backgroundColor : undefined,
      
      link: typeof link === 'object' && link ? link : undefined,
      priority: typeof priority === 'number' ? priority : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,  
      createdBy: session.user.id,
      isAnnouncementActive: typeof body.isAnnouncementActive === 'boolean' ? body.isAnnouncementActive : false,
    });

    return NextResponse.json({ banner: created }, { status: 201 });
  } catch (err) {
    console.error('POST announcement error:', err);
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 });
  }
}
