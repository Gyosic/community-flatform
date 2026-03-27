import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  output: "standalone",
  reactCompiler: true,
  experimental: {
    authInterrupts: true,
    // ppr: "incremental",
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.devtool = "eval";
    }
    return config;
  },
};

export default nextConfig;
