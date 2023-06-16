/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost', 'host.docker.internal', 'cdn'],
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
