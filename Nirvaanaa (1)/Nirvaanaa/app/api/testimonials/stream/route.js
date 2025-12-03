import dbConnect from '@/lib/mongodb';
import Testimonial from '@/models/Testimonials';

// Simple SSE endpoint to stream testimonial additions. This is lightweight and
// intended for dev/demo; consider using a proper pub/sub for production.
export async function GET(req) {
  try {
    await dbConnect();
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // Immediately send a ping with current featured testimonials
    (async () => {
      try {
        const testimonials = await Testimonial.find({ verified: true }).sort({ createdAt: -1 }).limit(8).lean();
        const payload = JSON.stringify({ testimonials });
        await writer.write(encoder.encode(`data: ${payload}\n\n`));
      } catch (e) {
        await writer.write(encoder.encode(`event: error\ndata: ${JSON.stringify({ message: 'stream init failed' })}\n\n`));
      }
      // close writer (streaming SSE limited use-case)
      await writer.close();
    })();

    const headers = new Headers({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    return new Response(readable, { headers });
  } catch (err) {
    console.error('[api/testimonials/stream] error:', err?.message || err);
    return new Response(JSON.stringify({ error: 'Stream failed' }), { status: 500 });
  }
}
