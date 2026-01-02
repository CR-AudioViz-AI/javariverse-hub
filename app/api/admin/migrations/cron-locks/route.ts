/**
 * CR AudioViz AI - Cron Locks Table Migration
 * ============================================
 * 
 * Creates the cron_locks table for distributed locking
 * 
 * @version 1.0.0
 * @date January 2, 2026 - 2:24 AM EST
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
    // Check if table exists by trying to query it
    const { error: checkError } = await supabase
      .from('cron_locks')
      .select('id')
      .limit(1)
    
    if (checkError && checkError.code === '42P01') {
      // Table doesn't exist - return SQL for manual creation
      return NextResponse.json({
        success: false,
        message: 'Table needs creation - run SQL in Supabase Dashboard',
        sql: `
-- Cron Locks Table for Distributed Locking
CREATE TABLE IF NOT EXISTS cron_locks (
  id TEXT PRIMARY KEY,
  job_name TEXT NOT NULL UNIQUE,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  instance_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cron_locks_job_name ON cron_locks(job_name);
CREATE INDEX IF NOT EXISTS idx_cron_locks_expires ON cron_locks(expires_at);

-- Cron Logs Table for Monitoring
CREATE TABLE IF NOT EXISTS cron_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('started', 'success', 'error', 'skipped')),
  duration_ms INTEGER,
  error_message TEXT,
  items_processed INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cron_logs_job_name ON cron_logs(job_name);
CREATE INDEX IF NOT EXISTS idx_cron_logs_created ON cron_logs(created_at);

-- System Config Table for Feature Flags
CREATE TABLE IF NOT EXISTS system_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature Flags Table
CREATE TABLE IF NOT EXISTS feature_flags (
  id TEXT PRIMARY KEY DEFAULT 'default',
  flags JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Incident Logs Table
CREATE TABLE IF NOT EXISTS incident_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  triggered_by TEXT,
  flags_affected TEXT[],
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE cron_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cron_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_logs ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role access" ON cron_locks FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access" ON cron_logs FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access" ON system_config FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access" ON feature_flags FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access" ON incident_logs FOR ALL USING (auth.role() = 'service_role');
        `
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Cron locks table ready',
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // Return current lock status
  try {
    const { data: locks } = await supabase
      .from('cron_locks')
      .select('*')
      .order('acquired_at', { ascending: false })
    
    return NextResponse.json({
      active_locks: locks || [],
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
