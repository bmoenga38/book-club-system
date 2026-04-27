import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  turbopack: {},
};

const sentryEnabled = !!process.env.NEXT_PUBLIC_SENTRY_DSN;

const finalConfig = sentryEnabled
  ? withSentryConfig(withSerwist(nextConfig), {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      widenClientFileUpload: true,
      tunnelRoute: "/monitoring",
      silent: !process.env.CI,
      disableSourceMapUpload: !process.env.SENTRY_AUTH_TOKEN,
    })
  : withSerwist(nextConfig);

export default finalConfig;
