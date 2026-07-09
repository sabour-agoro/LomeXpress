import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "cdn.lomexpress.tg" },
      { protocol: "https", hostname: "th.bing.com" },
      { protocol: "https", hostname: "*.bing.com" },
      { protocol: "https", hostname: "example.com" },
      { protocol: "http", hostname: "example.com" },
    ],
  },
};

export default nextConfig;
