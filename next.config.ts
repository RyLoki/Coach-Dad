import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "www.mlbstatic.com" },
      { hostname: "upload.wikimedia.org" },
    ],
  },
};

export default nextConfig;
