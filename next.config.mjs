/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    /* existing config options here */
    typescript: {
      // Allows production builds to succeed even with TypeScript errors
      ignoreBuildErrors: true,
    }
  };
  
  export default nextConfig;