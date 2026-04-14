import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  workboxOptions: {
    disableDevLogs: true,
    // Add custom caching for API responses as requested
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/learningcloud\.et\/api\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
          networkTimeoutSeconds: 10,
        },
      },
      {
        // Cache images - including those from the storage proxy with query parameters
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)(?:\?.*)?$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "image-cache",
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
          },
        },
      },
      {
        // Cache audio files - essential for educational games
        urlPattern: /\.(?:mp3|wav|m4a|ogg|aac)(?:\?.*)?$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "audio-cache",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
          },
        },
      },
      {
        // Specifically target the storage proxy for media that might not have extensions in the URL
        urlPattern: /^https:\/\/learningcloud\.et\/api\/storage\/proxy.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "storage-proxy-cache",
          expiration: {
            maxEntries: 500,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
          },
        },
      },
    ],

  },
});

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

export default withPWA(nextConfig);

