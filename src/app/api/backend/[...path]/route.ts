import { NextRequest, NextResponse } from 'next/server';

function getBackendBaseUrl(): string {
  return (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3008').replace(
    /\/$/,
    ''
  );
}

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const backendPath = `/${path.join('/')}`;
  const target = new URL(backendPath, `${getBackendBaseUrl()}/`);

  request.nextUrl.searchParams.forEach((value, key) => {
    target.searchParams.set(key, value);
  });

  const headers = new Headers();
  const authorization = request.headers.get('authorization');
  if (authorization) headers.set('Authorization', authorization);
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('Content-Type', contentType);
  // Treasury writes carry a wallet-signed session the backend verifies (WalletAuthGuard).
  for (const name of ['x-luxor-wallet', 'x-luxor-message', 'x-luxor-signature']) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  const init: RequestInit = { method: request.method, headers };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.text();
  }

  try {
    const res = await fetch(target.toString(), init);

    // Read the raw bytes so binary payloads (e.g. application/pdf statements)
    // are proxied intact. Text/JSON responses are unaffected since the client
    // decodes them the same way regardless of how the body was buffered here.
    const body = await res.arrayBuffer();

    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', res.headers.get('Content-Type') ?? 'application/json');
    const disposition = res.headers.get('Content-Disposition');
    if (disposition) responseHeaders.set('Content-Disposition', disposition);

    return new NextResponse(body, {
      status: res.status,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json({ message: 'Backend unavailable' }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
