import type { NextConfig } from 'next';

const isCapacitorBuild = process.env.BUILD_TARGET === 'capacitor';

/**
 * Content-Security-Policy, sent as Report-Only for now: browsers log violations
 * in the console but block nothing. Once the console is clean in production,
 * switch the header name to `Content-Security-Policy` to enforce it.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "connect-src 'self' https: wss:",
  'frame-src https://*.moonpay.com https://*.stripe.com https://www.youtube.com https://www.youtube-nocookie.com https://*.firebaseapp.com https://*.google.com blob:',
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Geolocation (payments) and camera (QR scanner) stay available to the app itself.
  { key: 'Permissions-Policy', value: 'geolocation=(self), camera=(self), microphone=(), payment=(self)' },
  { key: 'Content-Security-Policy-Report-Only', value: contentSecurityPolicy },
];

const nextConfig: NextConfig = {
  transpilePackages: ['@sterling/contracts'],
  compiler: {
    styledComponents: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
  },
  output: isCapacitorBuild ? 'export' : undefined,
  // Static export (Capacitor) cannot send headers; the web build does.
  ...(isCapacitorBuild
    ? {}
    : {
        async redirects() {
          return [
            {
              source: '/',
              destination: '/dashboard',
              permanent: false,
            },
          ];
        },
        async headers() {
          return [{ source: '/:path*', headers: securityHeaders }];
        },
      }),
  turbopack: {},
  webpack: (config) => {
    config.module.exprContextCritical = false;
    config.module.unknownContextCritical = false;
    return config;
  },
};
export default nextConfig;
