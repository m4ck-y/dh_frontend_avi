import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
};

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  reloadOnOnline: true,
  // `@serwist/next` hooks webpack; disable under Turbopack (dev) and build with
  // `next build --webpack`. Migrate to `@serwist/turbopack` when it stabilizes.
  disable: process.env.NODE_ENV !== "production",
});

export default withSerwist(nextConfig);
