/** @type {import('next').NextConfig} */
const resolvedApiOrigin = (() => {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (!raw) return 'https://api.narsub.shop';
  try {
    return new URL(raw).origin;
  } catch {
    return 'https://api.narsub.shop';
  }
})();

const resolvedVignetteOrigin = (() => {
  if (process.env.NEXT_PUBLIC_ENABLE_VIGNETTE !== 'true') return '';
  const raw = process.env.NEXT_PUBLIC_VIGNETTE_SRC;
  if (!raw) return '';
  try {
    return new URL(raw).origin;
  } catch {
    return '';
  }
})();
const monetagOrigin = 'https://nap5k.com';

const ContentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'none'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "img-src 'self' https:",
  "font-src 'self' https:",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://www.googletagservices.com https://adservice.google.com https://securepubads.g.doubleclick.net https://static.cloudflareinsights.com${resolvedVignetteOrigin ? ` ${resolvedVignetteOrigin}` : ''} ${monetagOrigin}`,
  `connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://stats.g.doubleclick.net https://pagead2.googlesyndication.com https://www.googletagmanager.com https://cloudflareinsights.com https://*.api.sanity.io https://cdn.sanity.io ${resolvedApiOrigin}${resolvedVignetteOrigin ? ` ${resolvedVignetteOrigin}` : ''} ${monetagOrigin}`,
  "frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: ContentSecurityPolicy },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
  { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  { key: 'Origin-Agent-Cluster', value: '?1' },
  { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=(), payment=()' },
];

const studioCsp = [
  "default-src 'self'",
  "base-uri 'none'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "img-src 'self' data: https: https://cdn.sanity.io",
  "font-src 'self' https: data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://core.sanity-cdn.com https://cdn.sanity.io",
  "connect-src 'self' https://*.api.sanity.io https://cdn.sanity.io https://core.sanity-cdn.com",
  "frame-src 'self'",
].join('; ');

const studioHeaders = [
  { key: 'Content-Security-Policy', value: studioCsp },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
];

const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },

  // Environment variables
  env: {
    API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  async headers() {
    if (process.env.NODE_ENV !== 'production') {
      return [];
    }
    return [
      {
        source: '/studio/:path*',
        headers: studioHeaders,
      },
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
