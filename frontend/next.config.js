/**
 * FILE:     frontend/next.config.js
 * PURPOSE:  Next.js configuration — image domains, bundle optimisation
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Production S3 bucket
      { protocol: "https", hostname: "*.s3.amazonaws.com" },
      // Local Django dev server
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
    ],
    // Serve modern formats when the browser supports them
    formats: ["image/avif", "image/webp"],
  },
  // Tree-shake large icon/chart libraries to reduce bundle size
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
};

module.exports = nextConfig;