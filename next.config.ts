import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.api.playstation.com", pathname: "/**" },
      { protocol: "https", hostname: "images.igdb.com", pathname: "/**" },
      { protocol: "https", hostname: "images.gog-statics.com", pathname: "/**" },
      { protocol: "https", hostname: "images.greenmangaming.com", pathname: "/**" },
      { protocol: "https", hostname: "cdn1.epicgames.com", pathname: "/**" },
      { protocol: "https", hostname: "shared.fastly.steamstatic.com", pathname: "/**" },
      { protocol: "https", hostname: "shared.akamai.steamstatic.com", pathname: "/**" },
      { protocol: "https", hostname: "cdn.cloudflare.steamstatic.com", pathname: "/**" },
      { protocol: "https", hostname: "steamcdn-a.akamaihd.net", pathname: "/**" },
      { protocol: "https", hostname: "sttc.gamersgate.com", pathname: "/**" },
      { protocol: "https", hostname: "www.wingamestore.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
