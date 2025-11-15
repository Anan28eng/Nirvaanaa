import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import InvoiceTemplate from '@/models/InvoiceTemplate';
import fs from 'fs';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const tpl = await InvoiceTemplate.findById(params.id);
    if (!tpl) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const fileStream = fs.createReadStream(tpl.path);
    const stat = await fs.promises.stat(tpl.path);
    const headers = new Headers();
    headers.set('Content-Type', tpl.mimeType);
    headers.set('Content-Length', stat.size.toString());
    headers.set('Content-Disposition', `attachment; filename="${tpl.originalName}"`);

    return new NextResponse(fileStream, { headers });
  } catch (error) {
    console.error('Fetch template error:', error);
    return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await dbConnect();
    const tpl = await InvoiceTemplate.findById(params.id);
    if (!tpl) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    try {
      await fs.promises.unlink(tpl.path);
    } catch (e) {
      // Ignore if file already gone
    }

    await tpl.deleteOne();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete template error:', error);
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }
}


