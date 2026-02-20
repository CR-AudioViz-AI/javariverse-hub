// app/api/internal/verify/route.ts
// CRA Internal Verify — used by Javari-AI diagnostic to verify service chain
// Validates X-Internal-Secret then returns health status of:
//   - Supabase credits table
//   - Auth service
//   - Payments service
// 2026-02-20 — JAVARI_PATCH fix_connectivity_and_branding

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(req: NextRequest) {
  // Validate internal secret
  const secret = req.headers.get('x-internal-secret') ?? '';
  const expectedSecret = process.env.INTERNAL_API_SECRET ?? '';

  if (!expectedSecret || secret !== expectedSecret) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized — X-Internal-Secret required' },
      { status: 401, headers: corsHeaders() }
    );
  }

  const checks: Record<string, { ok: boolean; detail: string; ms: number }> = {};

  // Check credits table
  const t1 = Date.now();
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const { count, error } = await supabase
      .from('credit_transactions')
      .select('*', { count: 'exact', head: true });
    checks.credits = { ok: !error, detail: error ? error.message : `${count ?? 0} rows`, ms: Date.now() - t1 };
  } catch (e) {
    checks.credits = { ok: false, detail: (e as Error).message.slice(0, 80), ms: Date.now() - t1 };
  }

  // Check users table
  const t2 = Date.now();
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const { count, error } = await supabase
      .from('user_credits')
      .select('*', { count: 'exact', head: true });
    checks.auth = { ok: !error, detail: error ? error.message : `${count ?? 0} users`, ms: Date.now() - t2 };
  } catch (e) {
    checks.auth = { ok: false, detail: (e as Error).message.slice(0, 80), ms: Date.now() - t2 };
  }

  // Check payments (stripe key presence)
  checks.payments = {
    ok: !!process.env.STRIPE_SECRET_KEY,
    detail: process.env.STRIPE_SECRET_KEY ? 'stripe key present' : 'STRIPE_SECRET_KEY missing',
    ms: 0,
  };

  const allOk = Object.values(checks).every(c => c.ok);

  return NextResponse.json(
    { ok: allOk, service: 'craudiovizai', checks, timestamp: new Date().toISOString() },
    { status: 200, headers: corsHeaders() }
  );
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Internal-Request, X-Internal-Secret, X-Request-Source',
    'Cache-Control': 'no-store',
  };
}
