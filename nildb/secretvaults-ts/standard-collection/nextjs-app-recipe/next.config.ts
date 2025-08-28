import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@nillion/secretvaults', '@nillion/nuc'],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      worker_threads: false,
    };
    return config;
  },
};

export default nextConfig;
