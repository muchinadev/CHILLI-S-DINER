import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Meal photo uploads go through a Server Action; leave headroom above
      // the 8MB raw-file cap enforced in image-processing.ts for multipart overhead.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
