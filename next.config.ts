import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Sample catalogue imagery (src/lib/catalog.ts).
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
