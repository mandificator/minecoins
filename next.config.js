/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // The docs pages and /api/docs read Markdown from content/docs at runtime.
    // Tell Next's file tracing to bundle that folder into the serverless
    // functions, otherwise the files are missing in production (e.g. Vercel).
    outputFileTracingIncludes: {
      "/docs/[slug]": ["./content/docs/**/*"],
      "/docs": ["./content/docs/**/*"],
      "/api/docs": ["./content/docs/**/*"],
      "/api/docs/[slug]": ["./content/docs/**/*"],
    },
  },
  webpack: (config) => {
    // Some Solana wallet-adapter deps reference node core modules in the browser.
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      crypto: false,
      path: false,
    };
    return config;
  },
};

module.exports = nextConfig;
