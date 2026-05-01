import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  experimental: {
    globalNotFound: true,
  },
  htmlLimitedBots: /.*/,

  // ✅ Built-in Next.js env injection — no webpack/turbopack plugins needed
  env: {
    KUNSUL_IGNORE_IN_BUILD: JSON.stringify(isProd),
  },

  // ✅ Silence the turbopack warning
  turbopack: {},

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.ebayimg.com" },
      { protocol: "https", hostname: "m.media-amazon.com" },
      { protocol: "https", hostname: "ir.ebaystatic.com" },
      { protocol: "https", hostname: "media.crocs.com" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
