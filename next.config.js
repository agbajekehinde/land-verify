/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.paystack.com https://*.typeform.com;
              style-src 'self' 'unsafe-inline' https://*.typeform.com;
              img-src 'self' data: https://*.typeform.com;
              connect-src 'self' https://api.paystack.co https://*.typeform.com;
              frame-src 'self' https://checkout.paystack.com https://*.typeform.com;
              frame-ancestors 'self';
            `.replace(/\s{2,}/g, ' ').trim(),
          },
          {
            key: 'Permissions-Policy',
            value: 'fullscreen=*'
          }
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/sitemap.xml",
        destination: "/api/sitemap.xml",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;