/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // The docs pages and /api/docs read Markdown from content/docs at runtime.
    // Tell Next's file tracing to bundle that folder into the serverless
    // functions, otherwise the files are missing in production (e.g. Vercel).
    outputFileTracingIncludes: {
      // /docs/[slug] is force-dynamic, so it resolves metadata (incl. the
      // openGraph image, which reads the bundled TTFs) at request time — the
      // fonts must be traced into its serverless function too.
      "/docs/[slug]": ["./content/docs/**/*", "./src/assets/fonts/**/*"],
      "/docs": ["./content/docs/**/*"],
      "/api/docs": ["./content/docs/**/*"],
      "/api/docs/[slug]": ["./content/docs/**/*"],
      // OG/Twitter image routes render the cards from these fonts.
      "/opengraph-image": ["./src/assets/fonts/**/*"],
      "/twitter-image": ["./src/assets/fonts/**/*"],
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
