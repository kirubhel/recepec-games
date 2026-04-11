import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * We are using assetPrefix to ensure assets load from the subpath.
   * basePath is removed because the proxy on kokeb.et is stripping the prefix.
   */
  assetPrefix: "/respect-minimal-games",

  // standalone output is recommended for faster/smaller docker images
  output: 'standalone',

  async rewrites() {
    return [
      {
        // This allows prefixed links to work while the app is hosted behind a proxy stripping the prefix
        source: '/respect-minimal-games/:path((?!api/).*)',
        destination: '/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'https://learningcloud.et/api/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS" },
        ],
      },
      {
        source: "/RESPECT_MANIFEST.json",
        headers: [
          { key: "Content-Type", value: "application/json" },
          { key: "Cache-Control", value: "public, max-age=3600" },
        ],
      },
      {
        source: "/opds.json",
        headers: [
          { key: "Content-Type", value: "application/json" },
        ],
      },
    ];
  },
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
