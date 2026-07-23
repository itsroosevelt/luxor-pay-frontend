import type { NextConfig } from 'next';
const nextConfig: NextConfig = { 
  transpilePackages: ['@luxor/contracts'],
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
  output: process.env.BUILD_TARGET === 'capacitor' ? 'export' : undefined,
  turbopack: {},
  webpack: (config) => {
    config.module.exprContextCritical = false;
    config.module.unknownContextCritical = false;
    return config;
  },
};
export default nextConfig;
