// ================================================================================
// CR AUDIOVIZ AI - HEALTH API (NEVER 503)
// Returns 200 + x-cr-degraded header on failure
// ================================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs'; // Force Node.js runtime for stability

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const checks: Record<string, { status: string; latency_ms?: number; error?: string }> = {};
  let isDegraded = false;
  let errorId: string | undefined;
  
  // Check database
  try {
    const supabase = getSupabase();
    if (supabase) {
      const dbStart = Date.now();
      const { error } = await supabase.from('apps').select('id').limit(1);
      checks.database = {
        status: error ? 'degraded' : 'healthy',
        latency_ms: Date.now() - dbStart,
        error: error?.message,
      };
      if (error) isDegraded = true;
    } else {
      checks.database = { status: 'unconfigured' };
    }
  } catch (error: any) {
    checks.database = { status: 'degraded', error: error.message };
    isDegraded = true;
  }
  
  // Check API endpoints
  const apiChecks = [
    { name: 'apps_api', url: `${new URL(request.url).origin}/api/apps` },
    { name: 'credits_api', url: `${new URL(request.url).origin}/api/credits` },
  ];
  
  for (const check of apiChecks) {
    try {
      const checkStart = Date.now();
      const res = await fetch(check.url, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      checks[check.name] = {
        status: res.ok ? 'healthy' : 'degraded',
        latency_ms: Date.now() - checkStart,
      };
      if (!res.ok) isDegraded = true;
    } catch (error: any) {
      checks[check.name] = { status: 'degraded', error: error.message };
      isDegraded = true;
    }
  }
  
  if (isDegraded) {
    errorId = crypto.randomUUID().slice(0, 8);
  }
  
  const response = NextResponse.json({
    status: isDegraded ? 'degraded' : 'healthy',
    timestamp: new Date().toISOString(),
    latency_ms: Date.now() - startTime,
    checks,
    error_id: errorId,
  });
  
  // Always return 200, but set degraded headers
  if (isDegraded) {
    response.headers.set('x-cr-degraded', 'true');
    response.headers.set('x-cr-error-id', errorId!);
  }
  
  // Caching headers for stability
  response.headers.set('Cache-Control', 'public, s-maxage=5, stale-while-revalidate=30');
  
  return response;
}
