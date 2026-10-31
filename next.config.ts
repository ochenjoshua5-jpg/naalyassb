import type { NextConfig } from "next";

/*
 * Security headers for every route.
 * script-src allows 'unsafe-inline' because Next.js App Router inlines its bootstrap and RSC payload
 * scripts. A nonce-based policy would make every page dynamic (no static HTML), which costs the
 * performance budget, so this trade-off is recorded in the Day 6 QA report.
 * Turnstile (challenges.cloudflare.com) must be added to script-src, frame-src and connect-src when enabled.
 */
// React's development build calls eval() for call-stack reconstruction. That is allowed only in development;
// the production policy does not include it.
const DEV_EVAL = process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'";

const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${DEV_EVAL}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: CSP },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
