import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

export async function GET() {
  try {
    const conn = await dbConnect();
    const state = conn?.connection?.readyState;
    const ok = state === 1; // 1 = connected
    return NextResponse.json({ ok, state, now: new Date().toISOString() });
  } catch (err) {
    try {
      console.error('[api/health/db] connection error:', err?.message || err);
      if (err?.stack) console.error(err.stack);
    } catch (e) {}
    return NextResponse.json({ ok: false, error: 'DB connection failed' }, { status: 500 });
  }
}
