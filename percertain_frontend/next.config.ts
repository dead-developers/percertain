import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // The codebase has many pre-existing lint errors (no-explicit-any,
    // no-unused-vars). Don't fail the production build on lint — run it
    // separately via `npm run lint`.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
