import type { NextConfig } from 'next';

const nextConfig: NextConfig = { 
  transpilePackages: ['@luxor/contracts'],
  compiler: {
    styledComponents: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3008/:path*',
      },
    ];
  },
};

export default nextConfig;

