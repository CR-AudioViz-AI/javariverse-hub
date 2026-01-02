/**
 * CR AudioViz AI - Feature Flags & Kill Switches
 * ===============================================
 * 
 * Centralized feature flag management with:
 * - Runtime toggles
 * - Incident mode
 * - Gradual rollouts
 * - A/B testing support
 * 
 * @version 1.0.0
 * @date January 2, 2026 - 2:08 AM EST
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Default feature flag configuration
export const DEFAULT_FLAGS = {
  // Core Features
  email_automation: {
    enabled: true,
    description: 'Automated email sequences (welcome, churn)',
    kill_switch: false
  },
  autopilot: {
    enabled: true,
    description: 'Autopilot cron job for platform automation',
    kill_switch: false
  },
  knowledge_processing: {
    enabled: true,
    description: 'AI knowledge ingestion and processing',
    kill_switch: false
  },
  analytics_tracking: {
    enabled: true,
    description: 'Event tracking and analytics collection',
    kill_switch: false
  },
  
  // Payment Features
  stripe_checkout: {
    enabled: true,
    description: 'Stripe payment processing',
    kill_switch: false
  },
  paypal_checkout: {
    enabled: true,
    description: 'PayPal payment processing',
    kill_switch: false
  },
  subscription_management: {
    enabled: true,
    description: 'Subscription upgrades, downgrades, cancellations',
    kill_switch: false
  },
  
  // AI Features
  ai_generation: {
    enabled: true,
    description: 'AI content generation (OpenAI, Anthropic, etc)',
    kill_switch: false,
    rate_limit: 100 // per user per day
  },
  audiobook_conversion: {
    enabled: true,
    description: 'Text-to-speech audiobook conversion',
    kill_switch: false
  },
  
  // Marketing
  marketing_emails: {
    enabled: true,
    description: 'Marketing and promotional emails',
    kill_switch: false
  },
  
  // Incident Mode (Master Kill Switch)
  incident_mode: {
    enabled: false,
    description: 'INCIDENT MODE - Disables non-critical operations',
    kill_switch: true
  }
}

// In-memory cache with TTL
let flagsCache: typeof DEFAULT_FLAGS | null = null
let cacheTimestamp = 0
const CACHE_TTL = 30000 // 30 seconds

async function getFlags(): Promise<typeof DEFAULT_FLAGS> {
  const now = Date.now()
  
  // Return cached if fresh
  if (flagsCache && (now - cacheTimestamp) < CACHE_TTL) {
    return flagsCache
  }
  
  // Try to load from database
  const { data, error } = await supabase
    .from('feature_flags')
    .select('*')
    .single()
  
  if (data && !error) {
    flagsCache = { ...DEFAULT_FLAGS, ...data.flags }
  } else {
    flagsCache = DEFAULT_FLAGS
  }
  
  cacheTimestamp = now
  return flagsCache
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const flag = searchParams.get('flag')
  
  const flags = await getFlags()
  
  // Return specific flag
  if (flag && flag in flags) {
    return NextResponse.json({
      flag,
      ...flags[flag as keyof typeof flags],
      timestamp: new Date().toISOString()
    })
  }
  
  // Return all flags
  return NextResponse.json({
    flags,
    incident_mode_active: flags.incident_mode.enabled,
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { flag, enabled, action } = body
    
    // Handle incident mode toggle
    if (action === 'incident_mode') {
      const newEnabled = body.enabled
      
      // Update all flags based on incident mode
      const updatedFlags = { ...DEFAULT_FLAGS }
      
      if (newEnabled) {
        // INCIDENT MODE ON - disable non-critical operations
        updatedFlags.email_automation.enabled = false
        updatedFlags.autopilot.enabled = false
        updatedFlags.marketing_emails.enabled = false
        updatedFlags.ai_generation.enabled = false
        updatedFlags.incident_mode.enabled = true
        
        // Log incident
        await supabase.from('incident_logs').insert({
          action: 'incident_mode_enabled',
          triggered_by: 'admin',
          flags_affected: ['email_automation', 'autopilot', 'marketing_emails', 'ai_generation'],
          timestamp: new Date().toISOString()
        })
      } else {
        // INCIDENT MODE OFF - restore defaults
        updatedFlags.incident_mode.enabled = false
        
        await supabase.from('incident_logs').insert({
          action: 'incident_mode_disabled',
          triggered_by: 'admin',
          timestamp: new Date().toISOString()
        })
      }
      
      // Save to database
      await supabase.from('feature_flags').upsert({
        id: 'default',
        flags: updatedFlags,
        updated_at: new Date().toISOString()
      })
      
      // Clear cache
      flagsCache = null
      
      return NextResponse.json({
        success: true,
        incident_mode: newEnabled,
        flags: updatedFlags,
        timestamp: new Date().toISOString()
      })
    }
    
    // Handle individual flag toggle
    if (flag) {
      const currentFlags = await getFlags()
      
      if (!(flag in currentFlags)) {
        return NextResponse.json({ error: 'Unknown flag' }, { status: 400 })
      }
      
      const updatedFlags = {
        ...currentFlags,
        [flag]: {
          ...currentFlags[flag as keyof typeof currentFlags],
          enabled: enabled !== undefined ? enabled : !currentFlags[flag as keyof typeof currentFlags].enabled
        }
      }
      
      // Save to database
      await supabase.from('feature_flags').upsert({
        id: 'default',
        flags: updatedFlags,
        updated_at: new Date().toISOString()
      })
      
      // Clear cache
      flagsCache = null
      
      return NextResponse.json({
        success: true,
        flag,
        enabled: updatedFlags[flag as keyof typeof updatedFlags].enabled,
        timestamp: new Date().toISOString()
      })
    }
    
    return NextResponse.json({ error: 'Missing flag or action' }, { status: 400 })
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * Helper function to check if a feature is enabled
 * Use this throughout the application
 */
export async function isFeatureEnabled(flag: keyof typeof DEFAULT_FLAGS): Promise<boolean> {
  const flags = await getFlags()
  
  // If incident mode is active, check if this flag is affected
  if (flags.incident_mode.enabled) {
    const criticalOnly = ['stripe_checkout', 'paypal_checkout', 'subscription_management']
    if (!criticalOnly.includes(flag)) {
      return false
    }
  }
  
  return flags[flag]?.enabled ?? false
}
