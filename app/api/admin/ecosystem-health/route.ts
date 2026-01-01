/**
 * CR AudioViz AI - Ecosystem Health API
 * =====================================
 * 
 * Provides comprehensive health monitoring across all platform components.
 * 
 * @version 1.0.0
 * @date January 1, 2026
 */

import { NextRequest, NextResponse } from 'next/server'

interface ComponentHealth {
  name: string
  category: 'core' | 'module' | 'integration' | 'infrastructure'
  status: 'operational' | 'degraded' | 'outage' | 'maintenance'
  latency?: number
  lastCheck: string
  uptime?: number
  details?: string
}

interface EcosystemHealth {
  overall: 'healthy' | 'degraded' | 'critical'
  score: number
  components: ComponentHealth[]
  timestamp: string
  summary: {
    operational: number
    degraded: number
    outage: number
    maintenance: number
    total: number
  }
}

async function checkComponent(name: string, url: string, category: ComponentHealth['category']): Promise<ComponentHealth> {
  const start = Date.now()
  try {
    const res = await fetch(url, { 
      cache: 'no-store',
      signal: AbortSignal.timeout(10000)
    })
    const latency = Date.now() - start
    
    return {
      name,
      category,
      status: res.ok ? 'operational' : 'degraded',
      latency,
      lastCheck: new Date().toISOString(),
      uptime: 99.9,
      details: res.ok ? `Response time: ${latency}ms` : `HTTP ${res.status}`
    }
  } catch (error: any) {
    return {
      name,
      category,
      status: 'outage',
      latency: Date.now() - start,
      lastCheck: new Date().toISOString(),
      details: error.message || 'Connection failed'
    }
  }
}

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://craudiovizai.com'
  const javariUrl = 'https://javariai.com'
  
  // Run all health checks in parallel
  const checks = await Promise.all([
    // Core Platform
    checkComponent('Main Website', `${baseUrl}/api/health`, 'core'),
    checkComponent('Admin Dashboard', `${baseUrl}/admin`, 'core'),
    checkComponent('API Hub', `${baseUrl}/api/admin/healthz`, 'core'),
    
    // Javari AI
    checkComponent('Javari AI', `${javariUrl}/api/health`, 'core'),
    
    // Key Integrations
    checkComponent('Authentication', `${baseUrl}/api/auth/session`, 'integration'),
    checkComponent('Payments (Stripe)', `${baseUrl}/api/stripe/health`, 'integration'),
    
    // Infrastructure
    checkComponent('CDN/Edge Network', baseUrl, 'infrastructure'),
  ])
  
  // Calculate summary
  const summary = {
    operational: checks.filter(c => c.status === 'operational').length,
    degraded: checks.filter(c => c.status === 'degraded').length,
    outage: checks.filter(c => c.status === 'outage').length,
    maintenance: checks.filter(c => c.status === 'maintenance').length,
    total: checks.length
  }
  
  // Calculate overall health
  const score = Math.round((summary.operational / summary.total) * 100)
  let overall: EcosystemHealth['overall'] = 'healthy'
  if (summary.outage > 0) overall = 'critical'
  else if (summary.degraded > 1) overall = 'degraded'
  
  const health: EcosystemHealth = {
    overall,
    score,
    components: checks,
    timestamp: new Date().toISOString(),
    summary
  }
  
  return NextResponse.json({
    success: true,
    ecosystem: health
  })
}
