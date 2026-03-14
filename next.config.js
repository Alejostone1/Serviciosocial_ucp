/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Dominios legados (retrocompatibilidad)
    domains: ['localhost', 'res.cloudinary.com', 'images.unsplash.com'],
    // Forma moderna y más segura (Next.js 14+)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
    ],
  },
};

module.exports = nextConfig;
