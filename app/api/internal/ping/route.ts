// app/api/internal/ping/route.ts
// CRA Internal Ping — used by Javari-AI to verify CRA reachability
// No auth required. Returns 200 with timestamp.
// X-Internal-Secret header is validated for informational logging only.
// 2026-02-20 — JAVARI_PATCH fix_connectivity_and_branding

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const source = req.headers.get('x-request-source') ?? 'unknown';
  const secret = req.headers.get('x-internal-secret') ?? '';
  const expectedSecret = process.env.INTERNAL_API_SECRET ?? '';

  const secretValid = expectedSecret.length > 0 && secret === expectedSecret;

  return NextResponse.json({
    ok: true,
    service: 'craudiovizai',
    timestamp: new Date().toISOString(),
    source,
    secretValid,
    version: '1.0',
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Internal-Request, X-Internal-Secret, X-Request-Source',
      'Cache-Control': 'no-store',
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Internal-Request, X-Internal-Secret, X-Request-Source',
    },
  });
}
