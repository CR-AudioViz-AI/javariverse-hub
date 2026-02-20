// app/api/ping/route.ts
// Lightweight internal connectivity check — used by javari-ai internal-router
// Returns 200 immediately — no DB calls, no API calls
// 2026-02-20 — JAVARI_PATCH fix_connectivity_and_branding

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'craudiovizai',
    ts: new Date().toISOString(),
  });
}

export async function POST() {
  return NextResponse.json({
    ok: true,
    service: 'craudiovizai',
    ts: new Date().toISOString(),
  });
}
