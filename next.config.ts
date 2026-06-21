import type { NextConfig } from 'next';
const nextConfig: NextConfig = { 
  transpilePackages: ['@luxor/contracts'],
  compiler: {
    styledComponents: true,
  },
};
export default nextConfig;
