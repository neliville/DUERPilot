/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    // Optimisations pour PWA
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  webpack: (config) => {
    // Alias pour résoudre @chakra-ui/icon vers @chakra-ui/icons
    config.resolve.alias = {
      ...config.resolve.alias,
      '@chakra-ui/icon': require.resolve('@chakra-ui/icons'),
    };
    return config;
  },
  // Headers de sécurité et CORS
  async headers() {
    const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://duerpilot.fr';
    
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ],
      },
      {
        source: '/api/landing/waitlist',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: allowedOrigin
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'POST, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type'
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400'
          }
        ],
      },
    ];
  },
};

module.exports = nextConfig;

