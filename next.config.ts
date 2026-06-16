import type { NextConfig } from "next";

const PROXY_TARGET = process.env.FASTAPI_PROXY_TARGET ?? "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  async headers() {
    const securityHeaders = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
    ];

    const portalDashboardCacheHeaders = [
      {
        key: "Cache-Control",
        value: "no-store, no-cache, must-revalidate, max-age=0",
      },
    ];

    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/:lang/portal/dashboard",
        headers: portalDashboardCacheHeaders,
      },
      {
        source: "/:lang/portal/dashboard/:path*",
        headers: portalDashboardCacheHeaders,
      },
    ];
  },
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${PROXY_TARGET}/:path*` }];
  },
};

export default nextConfig;
