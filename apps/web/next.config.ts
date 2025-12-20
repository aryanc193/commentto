import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@commentto/types",
    "@commentto/utils",
    "@commentto/ui",
    "@commentto/voices",
  ],
};

export default nextConfig;
