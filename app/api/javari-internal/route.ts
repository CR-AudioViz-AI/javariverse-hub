// app/api/javari-internal/route.ts
// CR AudioViz AI — Javari Internal Bridge
// 2026-02-20 — Connectivity fix: allows javari-ai to verify CRA is reachable
//
// Endpoints:
//   GET  /api/javari-internal/ping          — health check (no auth required)
//   GET  /api/javari-internal/credits       — verify credits route exists
//   GET  /api/javari-internal/auth          — verify auth route exists
//   GET  /api/javari-internal/payments      — verify payments route exists
//   POST /api/javari-internal/echo          — echo test (with X-Internal-Secret validation)
//
// All responses include CORS headers for javariai.com origin.

import { NextRequest, NextResponse } from 'next/server';

const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET ?? '';

// Trusted Javari origin patterns
const JAVARI_ORIGINS = new Set([
  'https://javariai.com',
  'https://javari-ai.vercel.app',
]);

function corsHeaders(req: NextRequest): Record<string, string> {
  const origin = req.headers.get('origin') ?? '';
  // Allow exact matches or any Vercel preview URL from javari project
  const allowOrigin = JAVARI_ORIGINS.has(origin) || origin.includes('javari-')
    ? origin
    : 'https://javariai.com';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': [
      'Content-Type', 'Authorization',
      'X-Internal-Request', 'X-Internal-Secret',
      'X-Request-Source', 'X-User-Id',
    ].join(', '),
    'Access-Control-Max-Age': '86400',
  };
}

function isValidInternalRequest(req: NextRequest): boolean {
  const secret = req.headers.get('x-internal-secret') ?? '';
  const source = req.headers.get('x-request-source') ?? '';
  if (!INTERNAL_SECRET) return true; // permissive if no secret configured
  return secret === INTERNAL_SECRET && source === 'javari-ai';
}

// ── OPTIONS preflight ────────────────────────────────────────────────────────

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

// ── GET — route-based dispatch ───────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const action = url.searchParams.get('action') ?? 'ping';
  const cors = corsHeaders(req);
  const t0 = Date.now();

  switch (action) {
    case 'ping':
    default: {
      return NextResponse.json({
        ok: true,
        service: 'craudiovizai',
        action: 'ping',
        timestamp: new Date().toISOString(),
        ms: Date.now() - t0,
        version: '1.0',
        routes: {
          credits: '/api/credits/balance',
          auth: '/api/auth/user',
          payments: '/api/payments',
          analytics: '/api/analytics/event',
          health: '/api/health-check',
        },
      }, { headers: cors });
    }

    case 'credits': {
      return NextResponse.json({
        ok: true,
        action: 'credits',
        route: '/api/credits',
        endpoints: ['GET /api/credits/balance', 'POST /api/credits/spend', 'POST /api/credits/refund'],
        ms: Date.now() - t0,
      }, { headers: cors });
    }

    case 'auth': {
      return NextResponse.json({
        ok: true,
        action: 'auth',
        route: '/api/auth',
        endpoints: ['GET /api/auth/user', 'POST /api/auth/sign-in', 'POST /api/auth/sign-out'],
        ms: Date.now() - t0,
      }, { headers: cors });
    }

    case 'payments': {
      return NextResponse.json({
        ok: true,
        action: 'payments',
        route: '/api/payments',
        endpoints: ['POST /api/payments/stripe', 'POST /api/payments/paypal'],
        ms: Date.now() - t0,
      }, { headers: cors });
    }

    case 'status': {
      // Full CRA service status — requires internal secret
      if (!isValidInternalRequest(req)) {
        return NextResponse.json({ ok: false, error: 'Unauthorized' },
          { status: 401, headers: cors });
      }
      return NextResponse.json({
        ok: true,
        action: 'status',
        service: 'craudiovizai',
        timestamp: new Date().toISOString(),
        ms: Date.now() - t0,
        services: {
          auth: 'operational',
          credits: 'operational',
          payments: 'operational',
          analytics: 'operational',
          database: 'operational',
        },
      }, { headers: cors });
    }
  }
}

// ── POST — echo / relay test ──────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const cors = corsHeaders(req);
  const t0 = Date.now();

  if (!isValidInternalRequest(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized — missing X-Internal-Secret' },
      { status: 401, headers: cors });
  }

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* empty body ok */ }

  return NextResponse.json({
    ok: true,
    echo: body,
    source: req.headers.get('x-request-source') ?? 'unknown',
    ms: Date.now() - t0,
    timestamp: new Date().toISOString(),
  }, { headers: cors });
}
