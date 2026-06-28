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

  const init: RequestInit = { method: request.method, headers };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.text();
  }

  try {
    const res = await fetch(target.toString(), init);
    const body = await res.text();

    return new NextResponse(body, {
      status: res.status,
      headers: {
        'Content-Type': res.headers.get('Content-Type') ?? 'application/json',
      },
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
