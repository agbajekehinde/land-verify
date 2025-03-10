/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // 🚨 Disables type checking at build time
  },
  eslint: {
    ignoreDuringBuilds: true, // 🚨 Disables ESLint at build time
  },
};
   
  module.exports = nextConfig