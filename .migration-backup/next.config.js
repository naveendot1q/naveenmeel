/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'khjzttvwbpxfegtwkxuv.supabase.co',
      },
    ],
  },
};

// Only wrap with PWA if the package is available (graceful degradation)
let config = nextConfig;
try {
  const withPWA = require('@ducanh2912/next-pwa').default({
    dest: 'public',
    cacheOnFrontEndNav: true,
    aggressiveFrontEndNavCaching: true,
    reloadOnOnline: true,
    disable: process.env.NODE_ENV === 'development',
    workboxOptions: {
      disableDevLogs: true,
    },
    fallbacks: {
      document: '/offline',
    },
  });
  config = withPWA(nextConfig);
} catch (e) {
  console.warn('next-pwa not available, skipping PWA config');
}

module.exports = config;
