/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static export for Capacitor (Android APK)
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Asset prefix for Capacitor — serves from local files
  assetPrefix: './',
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

module.exports = nextConfig;
