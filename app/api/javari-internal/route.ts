// app/api/javari-internal/route.ts
// CRA Internal API — Multipurpose endpoint for Javari-AI service verification
// ?action=ping     → reachability check (no auth, wildcard CORS)
// ?action=auth     → auth service chain (X-Internal-Secret required)
// ?action=credits  → credits service chain (X-Internal-Secret required)
// ?action=payments → payments service chain (X-Internal-Secret required)
// 2026-02-20 — JAVARI_PATCH fix_connectivity_and_branding

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function corsHeaders(req?: NextRequest): Record<string, string> {
  const origin = req?.headers.get('origin') ?? '';
  const isAllowed = !origin
    || origin.endsWith('.vercel.app')
    || origin === 'https://javariai.com'
    || origin === 'https://craudiovizai.com';
  return {
    'Access-Control-Allow-Origin': isAllowed && origin ? origin : 'https://javariai.com',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Internal-Request, X-Internal-Secret, X-Request-Source, X-User-Id',
    'Cache-Control': 'no-store',
  };
}

function validateSecret(req: NextRequest): boolean {
  const provided = req.headers.get('x-internal-secret') ?? '';
  const expected = process.env.INTERNAL_API_SECRET ?? '';
  return expected.length > 0 && provided === expected;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') ?? 'ping';

  // ── ping — no auth, wildcard CORS, edge-safe ────────────────────────────
  if (action === 'ping') {
    return NextResponse.json({
      ok: true, service: 'craudiovizai', action: 'ping',
      timestamp: new Date().toISOString(),
      secretValid: validateSecret(req),
      source: req.headers.get('x-request-source') ?? 'unknown',
    }, { headers: corsHeaders(req) });
  }

  // ── All other actions require X-Internal-Secret ──────────────────────────
  if (!validateSecret(req)) {
    return NextResponse.json(
      { ok: false, action, error: 'X-Internal-Secret required' },
      { status: 401, headers: corsHeaders(req) }
    );
  }

  const t0 = Date.now();

  if (action === 'auth') {
    try {
      const supa = createClient(SUPABASE_URL, SUPABASE_KEY);
      const { count, error } = await supa.from('user_credits').select('*', { count: 'exact', head: true });
      return NextResponse.json({
        ok: !error, action: 'auth',
        endpoints: ['/api/auth/user', '/api/auth/session', '/api/auth/callback'],
        userCount: count ?? 0, ms: Date.now() - t0,
      }, { headers: corsHeaders(req) });
    } catch (e) {
      return NextResponse.json(
        { ok: false, action: 'auth', error: (e as Error).message.slice(0, 80), ms: Date.now() - t0 },
        { status: 500, headers: corsHeaders(req) }
      );
    }
  }

  if (action === 'credits') {
    try {
      const supa = createClient(SUPABASE_URL, SUPABASE_KEY);
      const { count, error } = await supa.from('credit_transactions').select('*', { count: 'exact', head: true });
      return NextResponse.json({
        ok: !error, action: 'credits',
        endpoints: ['/api/credits/balance', '/api/credits/spend', '/api/credits/refund'],
        transactionCount: count ?? 0, ms: Date.now() - t0,
      }, { headers: corsHeaders(req) });
    } catch (e) {
      return NextResponse.json(
        { ok: false, action: 'credits', error: (e as Error).message.slice(0, 80), ms: Date.now() - t0 },
        { status: 500, headers: corsHeaders(req) }
      );
    }
  }

  if (action === 'payments') {
    return NextResponse.json({
      ok: !!process.env.STRIPE_SECRET_KEY || !!process.env.PAYPAL_CLIENT_SECRET,
      action: 'payments',
      endpoints: ['/api/payments/stripe', '/api/payments/paypal'],
      stripe: process.env.STRIPE_SECRET_KEY ? 'key_present' : 'key_missing',
      paypal: process.env.PAYPAL_CLIENT_SECRET ? 'key_present' : 'key_missing',
      ms: 0,
    }, { headers: corsHeaders(req) });
  }

  return NextResponse.json(
    { ok: false, error: `Unknown action: ${action}` },
    { status: 400, headers: corsHeaders(req) }
  );
}

export async function OPTIONS(req: NextRequest) {
  return new Response(null, { status: 204, headers: corsHeaders(req) });
}
