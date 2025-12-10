export async function GET() {
  const missing = [];
  if (!process.env.NEXTAUTH_URL) missing.push('NEXTAUTH_URL');
  if (!process.env.NEXTAUTH_SECRET) missing.push('NEXTAUTH_SECRET');
  if (!process.env.GOOGLE_CLIENT_ID) missing.push('GOOGLE_CLIENT_ID');
  if (!process.env.GOOGLE_CLIENT_SECRET) missing.push('GOOGLE_CLIENT_SECRET');

  return new Response(JSON.stringify({ ok: missing.length === 0, missing }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
