import type { NextConfig } from 'next';
const nextConfig: NextConfig = { 
  transpilePackages: ['@luxor/contracts'],
  compiler: {
    styledComponents: true,
  },
  output: process.env.BUILD_TARGET === 'capacitor' ? 'export' : undefined,
};
export default nextConfig;
