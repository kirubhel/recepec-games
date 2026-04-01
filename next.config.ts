import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * We removed basePath to allow the app to be accessible from the root port (9014).
   * assetPrefix is kept to ensure domain assets (under /respect-minimal-games) load correctly.
   */
  assetPrefix: "/respect-minimal-games",

  // standalone output is recommended for faster/smaller docker images
  output: 'standalone',

  async rewrites() {
    return [
      {
        // This allows prefixed links to work locally while keeping the app at the root
        source: '/respect-minimal-games/:path((?!api/).*)',
        destination: '/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'https://learningcloud.et/api/:path*',
      },
    ];
  },
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
