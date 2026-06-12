import type { NextConfig } from 'next';

const solanaApiOrigin =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://127.0.0.1:3008';

const nextConfig: NextConfig = {
  transpilePackages: ['@luxor/contracts'],
  compiler: {
    styledComponents: true,
  },
  /** Proxy API through Next so the browser only needs port 3000 (fixes Failed to fetch via SSH/Cursor). */
  async rewrites() {
    return [
      {
        source: '/luxor-api/:path*',
        destination: `${solanaApiOrigin}/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      { source: '/dashboard/radar', destination: '/dashboard/settings/radar', permanent: false },
      { source: '/dashboard/disputes', destination: '/dashboard/transactions', permanent: false },
      { source: '/dashboard/disputes/:id', destination: '/dashboard/transactions', permanent: false },
      { source: '/dashboard/analytics', destination: '/dashboard/reporting', permanent: false },
      { source: '/dashboard/identity', destination: '/dashboard/settings', permanent: false },
      { source: '/dashboard/connect', destination: '/dashboard/settings', permanent: false },
      { source: '/dashboard/billing/usage', destination: '/dashboard/billing', permanent: false },
      {
        source: '/dashboard/billing/revenue-recovery',
        destination: '/dashboard/billing/pending',
        permanent: false,
      },
      { source: '/dashboard/webhooks', destination: '/dashboard/developers', permanent: false },
      { source: '/dashboard/payments/checkout', destination: '/dashboard/payments/sell', permanent: false },
      { source: '/dashboard/settings/desarrolladores', destination: '/dashboard/developers', permanent: false },
      { source: '/dashboard/settings/perfil', destination: '/dashboard/settings/empresa', permanent: false },
      { source: '/dashboard/settings/impuesto', destination: '/dashboard/tax', permanent: false },
    ];
  },
};

export default nextConfig;
