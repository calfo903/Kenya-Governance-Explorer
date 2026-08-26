import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // standalone is useful for Docker; Vercel ignores it and uses its own output.
  output: "standalone",
  reactStrictMode: true,
  typescript: {
    // Keep type-checking on; examples/ are excluded via tsconfig.json
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
