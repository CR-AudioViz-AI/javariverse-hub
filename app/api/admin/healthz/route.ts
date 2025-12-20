// CR AudioViz AI - System Health Check
// Fixed: December 19, 2025 - Uses service role for reliability

import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  const startTime = Date.now()
  const checks: Record<string, any> = {}
  
  // 1. Database Check (using service role for reliability)
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const dbStart = Date.now()
    const { count, error } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
    
    checks.database = {
      status: error ? "fail" : "pass",
      latency_ms: Date.now() - dbStart,
      records: count || 0,
      error: error?.message
    }
  } catch (e: any) {
    checks.database = { status: "fail", error: e.message }
  }
  
  // 2. Environment Check
  const requiredEnvs = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY", 
    "STRIPE_SECRET_KEY",
    "PAYPAL_CLIENT_ID"
  ]
  const missingEnvs = requiredEnvs.filter(e => !process.env[e])
  checks.environment = {
    status: missingEnvs.length === 0 ? "pass" : "fail",
    missing: missingEnvs.length > 0 ? missingEnvs : undefined
  }
  
  // 3. Stripe Check
  try {
    const stripeStart = Date.now()
    const res = await fetch("https://api.stripe.com/v1/balance", {
      headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` }
    })
    checks.stripe = {
      status: res.ok ? "pass" : "fail",
      latency_ms: Date.now() - stripeStart
    }
  } catch (e: any) {
    checks.stripe = { status: "fail", error: e.message }
  }
  
  // 4. Overall Status
  const failedChecks = Object.values(checks).filter((c: any) => c.status === "fail")
  const status = failedChecks.length === 0 ? "healthy" : 
                 failedChecks.length < Object.keys(checks).length / 2 ? "degraded" : "unhealthy"
  
  return NextResponse.json({
    status,
    timestamp: new Date().toISOString(),
    app: "craudiovizai.com",
    version: process.env.NEXT_PUBLIC_APP_VERSION || "2.0.0",
    latency_ms: Date.now() - startTime,
    checks
  }, {
    status: status === "healthy" ? 200 : status === "degraded" ? 200 : 503,
    headers: { "Cache-Control": "no-store" }
  })
}
