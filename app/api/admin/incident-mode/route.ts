/**
 * CR AudioViz AI - Incident Mode API
 * ===================================
 * 
 * Master kill switch for non-critical operations
 * 
 * @version 1.0.0
 * @date January 2, 2026 - 2:09 AM EST
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { enabled } = body
    
    // Get current state
    const { data: current } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'incident_mode')
      .single()
    
    const wasEnabled = current?.value?.enabled || false
    
    // Update incident mode
    await supabase.from('system_config').upsert({
      key: 'incident_mode',
      value: { 
        enabled,
        triggered_at: enabled ? new Date().toISOString() : null,
        resolved_at: !enabled && wasEnabled ? new Date().toISOString() : null
      },
      updated_at: new Date().toISOString()
    })
    
    // Log the incident
    await supabase.from('audit_logs').insert({
      action: enabled ? 'INCIDENT_MODE_ENABLED' : 'INCIDENT_MODE_DISABLED',
      resource_type: 'system',
      resource_id: 'incident_mode',
      metadata: {
        previous_state: wasEnabled,
        new_state: enabled,
        timestamp: new Date().toISOString()
      },
      created_at: new Date().toISOString()
    })
    
    // If enabling, pause non-critical cron jobs
    if (enabled) {
      // The cron jobs will check incident mode before executing
      console.log('INCIDENT MODE ENABLED - Non-critical operations paused')
    } else {
      console.log('INCIDENT MODE DISABLED - Normal operations resumed')
    }
    
    return NextResponse.json({
      success: true,
      incident_mode: enabled,
      timestamp: new Date().toISOString(),
      message: enabled 
        ? 'INCIDENT MODE ACTIVE - Non-critical operations paused'
        : 'INCIDENT MODE RESOLVED - Normal operations resumed'
    })
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { data } = await supabase
      .from('system_config')
      .select('value, updated_at')
      .eq('key', 'incident_mode')
      .single()
    
    return NextResponse.json({
      incident_mode: data?.value?.enabled || false,
      triggered_at: data?.value?.triggered_at,
      last_updated: data?.updated_at,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    return NextResponse.json({
      incident_mode: false,
      error: error.message
    })
  }
}
