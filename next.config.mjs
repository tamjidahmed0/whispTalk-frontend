/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

    images: {
        remotePatterns: [
          {
            protocol: 'http',
            hostname: 'localhost',
            pathname: '**',
            port:'1024'
          },
          {
            protocol: 'https',
            hostname: 'storage.googleapis.com',
            pathname: '**',
          },
        ],
      },

      poweredByHeader: false

};

export default nextConfig;
