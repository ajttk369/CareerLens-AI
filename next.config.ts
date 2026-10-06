import type { NextConfig } from "next";
const development = process.env.NODE_ENV !== "production";
const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    const policy = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'" + (development ? " 'unsafe-eval'" : ""),
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self' data:",
      "connect-src 'self'" + (development ? " ws: wss:" : ""),
      "object-src 'none'", "frame-ancestors 'none'", "base-uri 'self'", "form-action 'self'",
      ...(development ? [] : ["upgrade-insecure-requests"]),
    ].join("; ");
    return [
      { source: "/:path*", headers: [
        { key: "Content-Security-Policy", value: policy },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "no-referrer" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ] },
      ...["/report/:path*", "/share/:path*"].map((source) => ({ source, headers: [
        { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        { key: "Cache-Control", value: "private, no-store, max-age=0" },
      ] })),
    ];
  },
};
export default nextConfig;
