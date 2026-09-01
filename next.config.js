/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Note: For APK build, GitHub Actions workflow creates a temporary
  // static export config. This config is for web/development mode.
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

module.exports = nextConfig;
