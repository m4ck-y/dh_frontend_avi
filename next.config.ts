import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

const nextConfig: NextConfig = {
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
};

// Serwist hooks webpack and is only needed at build time. Load it lazily so dev
// (Turbopack) never imports it. Migrate to @serwist/turbopack when it stabilizes.
export default async function config(phase: string): Promise<NextConfig> {
  if (phase === PHASE_PRODUCTION_BUILD) {
    const { default: withSerwistInit } = await import("@serwist/next");
    const withSerwist = withSerwistInit({
      swSrc: "src/sw.ts",
      swDest: "public/sw.js",
      reloadOnOnline: true,
    });
    return withSerwist(nextConfig);
  }
  return nextConfig;
}
