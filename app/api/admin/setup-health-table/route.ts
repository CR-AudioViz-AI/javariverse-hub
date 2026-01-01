/**
 * Setup Autopilot Health Logs Table
 * One-time setup endpoint
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Create table using Supabase's SQL execution
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS autopilot_health_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          overall_score INTEGER NOT NULL,
          checks JSONB NOT NULL,
          critical_count INTEGER DEFAULT 0,
          warning_count INTEGER DEFAULT 0,
          healthy_count INTEGER DEFAULT 0,
          execution_time_ms INTEGER,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_health_logs_timestamp 
        ON autopilot_health_logs(timestamp DESC);
      `
    })
    
    if (error) {
      // Table might already exist, try inserting a test record
      const { error: insertError } = await supabase
        .from('autopilot_health_logs')
        .insert({
          overall_score: 100,
          checks: [],
          critical_count: 0,
          warning_count: 0,
          healthy_count: 0,
          execution_time_ms: 0
        })
      
      if (insertError && !insertError.message.includes('already exists')) {
        throw insertError
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Autopilot health logs table ready'
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/admin/setup-health-table',
    method: 'POST',
    description: 'Creates the autopilot_health_logs table in Supabase'
  })
}
