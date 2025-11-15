import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import InvoiceTemplate from '@/models/InvoiceTemplate';
import path from 'path';
import fs from 'fs';

// Note: Next.js app router doesn't support multipart parsing automatically.
// We'll implement a simple multipart parser using FormData via request.formData().

const UPLOADS_ROOT = process.env.INVOICE_UPLOAD_DIR || path.join(process.cwd(), 'uploads', 'invoices');

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_ROOT)) {
    fs.mkdirSync(UPLOADS_ROOT, { recursive: true });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const templates = await InvoiceTemplate.find().sort({ uploadedAt: -1 });
    return NextResponse.json({ templates });
  } catch (error) {
    console.error('List invoice templates error:', error);
    return NextResponse.json({ error: 'Failed to list templates' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const form = await request.formData();
    const file = form.get('file');
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const originalName = file.name || 'template.docx';
    if (!originalName.toLowerCase().endsWith('.docx')) {
      return NextResponse.json({ error: 'Only .docx files are allowed' }, { status: 400 });
    }

    ensureUploadsDir();
    const filename = `${Date.now()}-${originalName.replace(/\s+/g, '_')}`;
    const filePath = path.join(UPLOADS_ROOT, filename);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.promises.writeFile(filePath, buffer);

    await dbConnect();
    const saved = await InvoiceTemplate.create({
      filename,
      originalName,
      path: filePath,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      uploadedBy: session.user.id,
      uploadedAt: new Date(),
    });

    return NextResponse.json({ template: saved }, { status: 201 });
  } catch (error) {
    console.error('Upload invoice template error:', error);
    return NextResponse.json({ error: 'Failed to upload template' }, { status: 500 });
  }
}


