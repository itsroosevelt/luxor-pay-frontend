import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

/**
 * POST /api/moonpay/sign-url
 *
 * Body: { queryString: string }
 *   – the raw query string of the MoonPay widget URL (everything after "?"),
 *     already URL-encoded and NOT including a leading "?"
 *
 * Returns: { signature: string }
 *   – base64url-encoded HMAC-SHA256 signature to append as &signature=<value>
 *
 * The MoonPay secret key is kept exclusively server-side via the
 * MOONPAY_SECRET_KEY env variable and is never sent to the browser.
 */
export async function POST(req: NextRequest) {
  const secretKey = process.env.MOONPAY_SECRET_KEY;

  if (!secretKey) {
    return NextResponse.json(
      { error: 'MOONPAY_SECRET_KEY is not configured on this server.' },
      { status: 500 }
    );
  }

  let body: { queryString?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { queryString } = body;
  if (!queryString || typeof queryString !== 'string') {
    return NextResponse.json(
      { error: 'Missing or invalid `queryString` field.' },
      { status: 400 }
    );
  }

  // MoonPay spec: HMAC-SHA256 over the full query string (including "?"),
  // then base64-encode the raw digest.
  const signature = createHmac('sha256', secretKey)
    .update(`?${queryString}`)
    .digest('base64');

  return NextResponse.json({ signature });
}
