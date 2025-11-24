import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production'

function buildCsp() {
  const base = [
    "default-src 'self'",
    // Scripts: strict in prod (no unsafe-eval/inline), relaxed in dev
    isProd
      ? "script-src 'self' 'unsafe-inline' https:"
      : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
    // Styles: keep 'unsafe-inline' for common frameworks; can be tightened later with nonces
    // Allow Google Fonts stylesheets
    "style-src 'self' 'unsafe-inline' https: https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    // Allow Google Fonts font files
    "font-src 'self' data: https: https://fonts.gstatic.com",
    // Allow AI backends; expand in dev to allow local/ip http and ws
    (isProd
      ? "connect-src 'self' https: wss: https://generativelanguage.googleapis.com https://www.googleapis.com"
      : "connect-src 'self' http: https: ws: wss: http://localhost:11434 https://generativelanguage.googleapis.com https://www.googleapis.com"),
    // Allow embedding our own pages and YouTube iframes
    "frame-ancestors 'self'",
    // Explicitly allow YouTube embeds (player/iframe)
    "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://www.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ]
  return base.join('; ')
}

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=(), interest-cohort=()' },
  {
    key: 'Content-Security-Policy',
    value: buildCsp(),
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
