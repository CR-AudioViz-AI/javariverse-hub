/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    domains: ['kteobfyferrukqeolofj.supabase.co'],
  },
  // Handle server-side packages
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Dont resolve server-only modules on client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        pg: false,
        crypto: false,
        stream: false,
        dns: false,
        child_process: false,
      };
    }
    // Externalize pg on server side
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('pg', 'pg-native');
    }
    return config;
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Security + CORS Headers
  // 2026-02-20 — Expanded CORS: all javari-*.vercel.app preview URLs + production
  async headers() {
    // NOTE: Access-Control-Allow-Origin cannot use wildcards with credentials.
    // We use the production domain here; dynamic preview URL matching is handled
    // per-route via the X-Internal-Secret bypass (see /api/internal/ping).
    // All javari-ai serverless calls carry X-Internal-Request + X-Internal-Secret.
    const ALLOWED_JAVARI_ORIGINS = [
      'https://javariai.com',
      'https://www.javariai.com',
      // Static preview alias (updated when javari-ai gets a stable alias)
      'https://javari-ai.vercel.app',
    ].join(', ');

    return [
      // ── CORS preflight for all /api/* routes ──────────────────────────
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: ALLOWED_JAVARI_ORIGINS,
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: [
              'Content-Type',
              'Authorization',
              'X-Internal-Request',
              'X-Internal-Secret',
              'X-Request-Source',
              'X-User-Id',
              'X-App-Id',
              'X-Javari-Key',
            ].join(', '),
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400', // 24hr preflight cache
          },
        ],
      },
      // ── Security headers for all other routes ─────────────────────────
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://js.stripe.com https://www.paypal.com https://www.google-analytics.com https://www.googletagmanager.com https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https: http:; connect-src 'self' https://*.supabase.co https://api.stripe.com https://api.paypal.com https://api.openai.com https://api.anthropic.com https://generativelanguage.googleapis.com https://cloudflareinsights.com wss://*.supabase.co; frame-src https://js.stripe.com https://www.paypal.com https://www.youtube.com; object-src 'none'; base-uri 'self';",
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
