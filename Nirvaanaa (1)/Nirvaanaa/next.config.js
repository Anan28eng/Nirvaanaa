module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/image/upload/:path*', // safer than '/**'
      },
      {
        protocol: 'https',
        hostname: 'th.bing.com',
        pathname: '/:path*', // safer than '/th/**'
      },
    ],
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/sitemap',
        destination: '/sitemap.xml',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*', // recommended syntax
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ];
  },
};


