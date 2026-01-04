// ================================================================================
// CR AUDIOVIZ AI - SELF-HEALING ENGINE
// Autonomous system repair with safe/forbidden action boundaries
// ================================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';
export const maxDuration = 120;

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

// =============================================================================
// SAFE vs FORBIDDEN ACTIONS
// =============================================================================

const SAFE_ACTIONS = {
  // Database operations
  'db:retry-connection': { risk: 'low', auto_execute: true },
  'db:clear-cache': { risk: 'low', auto_execute: true },
  'db:restart-pool': { risk: 'medium', auto_execute: true },
  
  // API operations
  'api:restart-function': { risk: 'low', auto_execute: true },
  'api:clear-edge-cache': { risk: 'low', auto_execute: true },
  'api:warmup-endpoints': { risk: 'low', auto_execute: true },
  
  // Monitoring
  'monitor:increase-logging': { risk: 'low', auto_execute: true },
  'monitor:trigger-health-check': { risk: 'low', auto_execute: true },
  
  // Cron operations
  'cron:skip-failing-task': { risk: 'medium', auto_execute: true },
  'cron:reschedule-task': { risk: 'medium', auto_execute: true },
};

const FORBIDDEN_ACTIONS = {
  // Data operations - NEVER auto-execute
  'db:delete-data': { reason: 'Data loss risk' },
  'db:truncate-table': { reason: 'Data loss risk' },
  'db:drop-table': { reason: 'Schema destruction' },
  'db:modify-schema': { reason: 'Schema corruption risk' },
  
  // Security operations
  'auth:reset-credentials': { reason: 'Security risk' },
  'auth:disable-user': { reason: 'User impact' },
  'auth:modify-permissions': { reason: 'Security risk' },
  
  // Financial operations
  'billing:modify-charges': { reason: 'Financial impact' },
  'billing:refund-auto': { reason: 'Financial impact' },
  
  // Deployment operations
  'deploy:rollback-production': { reason: 'Requires human approval' },
  'deploy:modify-env-vars': { reason: 'Security risk' },
};

// =============================================================================
// HEALING STRATEGIES
// =============================================================================

interface HealingStrategy {
  issue: string;
  detection: string[];
  actions: string[];
  escalate_after: number;
}

const HEALING_STRATEGIES: HealingStrategy[] = [
  {
    issue: 'api_500_error',
    detection: ['status_code=500', 'internal_error'],
    actions: ['api:restart-function', 'db:retry-connection', 'api:clear-edge-cache'],
    escalate_after: 3,
  },
  {
    issue: 'database_connection_failed',
    detection: ['connection_refused', 'timeout', 'ECONNRESET'],
    actions: ['db:retry-connection', 'db:restart-pool', 'db:clear-cache'],
    escalate_after: 5,
  },
  {
    issue: 'high_latency',
    detection: ['response_time>5000', 'slow_query'],
    actions: ['db:clear-cache', 'api:clear-edge-cache', 'monitor:increase-logging'],
    escalate_after: 10,
  },
  {
    issue: 'cron_failure',
    detection: ['cron_error', 'scheduled_task_failed'],
    actions: ['cron:skip-failing-task', 'cron:reschedule-task', 'monitor:trigger-health-check'],
    escalate_after: 3,
  },
  {
    issue: 'memory_pressure',
    detection: ['memory_limit', 'heap_out_of_memory'],
    actions: ['api:restart-function', 'db:clear-cache'],
    escalate_after: 2,
  },
];

// =============================================================================
// HEALING EXECUTION
// =============================================================================

async function executeAction(action: string, context: any): Promise<{ success: boolean; result?: any; error?: string }> {
  const actionConfig = SAFE_ACTIONS[action as keyof typeof SAFE_ACTIONS];
  
  if (!actionConfig) {
    if (action in FORBIDDEN_ACTIONS) {
      return { 
        success: false, 
        error: `Forbidden action: ${FORBIDDEN_ACTIONS[action as keyof typeof FORBIDDEN_ACTIONS].reason}` 
      };
    }
    return { success: false, error: `Unknown action: ${action}` };
  }
  
  if (!actionConfig.auto_execute) {
    return { success: false, error: `Action requires manual approval: ${action}` };
  }
  
  // Execute the action
  try {
    switch (action) {
      case 'api:warmup-endpoints':
        const endpoints = ['/api/health', '/api/apps', '/api/credits'];
        const results = await Promise.all(
          endpoints.map(ep => fetch(`${context.base_url || 'https://craudiovizai.com'}${ep}`).catch(() => null))
        );
        return { success: true, result: { warmed: endpoints.length, successful: results.filter(Boolean).length } };
        
      case 'monitor:trigger-health-check':
        const healthCheck = await fetch(`${context.base_url || 'https://craudiovizai.com'}/api/health`);
        return { success: healthCheck.ok, result: { status: healthCheck.status } };
        
      case 'db:retry-connection':
        // Simulated - in production would actually retry
        return { success: true, result: { message: 'Connection retry triggered' } };
        
      case 'api:clear-edge-cache':
        // In production, this would call Vercel's cache purge API
        return { success: true, result: { message: 'Edge cache clear requested' } };
        
      default:
        return { success: true, result: { message: `Action ${action} executed (simulated)` } };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function detectIssue(errorSignals: string[]): Promise<HealingStrategy | null> {
  for (const strategy of HEALING_STRATEGIES) {
    const matches = strategy.detection.some(pattern => 
      errorSignals.some(signal => signal.toLowerCase().includes(pattern.toLowerCase()))
    );
    if (matches) {
      return strategy;
    }
  }
  return null;
}

// =============================================================================
// API HANDLERS
// =============================================================================

// GET /api/self-heal - Get healing status and capabilities
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  
  if (action === 'capabilities') {
    return NextResponse.json({
      safe_actions: Object.keys(SAFE_ACTIONS),
      forbidden_actions: Object.entries(FORBIDDEN_ACTIONS).map(([k, v]) => ({ action: k, reason: v.reason })),
      strategies: HEALING_STRATEGIES.map(s => ({ issue: s.issue, actions: s.actions })),
    });
  }
  
  // Get recent healing events
  const supabase = getSupabase();
  if (supabase) {
    const { data: events } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('action', 'self_heal')
      .order('created_at', { ascending: false })
      .limit(20);
    
    return NextResponse.json({ recent_events: events || [] });
  }
  
  return NextResponse.json({ message: 'Self-healing engine active' });
}

// POST /api/self-heal - Trigger healing
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const supabase = getSupabase();
  
  try {
    const body = await request.json();
    const { error_signals = [], force_action, context = {} } = body;
    
    let healingResult: any = {
      triggered_at: new Date().toISOString(),
      actions_taken: [],
      success: false,
    };
    
    // If specific action forced
    if (force_action) {
      const result = await executeAction(force_action, context);
      healingResult.actions_taken.push({ action: force_action, ...result });
      healingResult.success = result.success;
    } else {
      // Auto-detect and heal
      const strategy = await detectIssue(error_signals);
      
      if (!strategy) {
        return NextResponse.json({
          success: false,
          message: 'No matching healing strategy found',
          error_signals,
        });
      }
      
      healingResult.detected_issue = strategy.issue;
      healingResult.strategy = strategy;
      
      // Execute actions in sequence
      for (const action of strategy.actions) {
        const result = await executeAction(action, context);
        healingResult.actions_taken.push({ action, ...result });
        
        if (result.success) {
          // Check if issue resolved
          const healthCheck = await fetch(`${context.base_url || 'https://craudiovizai.com'}/api/health`);
          if (healthCheck.ok) {
            healingResult.success = true;
            healingResult.resolved_after = action;
            break;
          }
        }
      }
      
      // Check if escalation needed
      if (!healingResult.success) {
        healingResult.escalation_recommended = true;
        healingResult.escalation_reason = `Failed after ${healingResult.actions_taken.length} actions`;
      }
    }
    
    healingResult.duration_ms = Date.now() - startTime;
    
    // Log to audit
    if (supabase) {
      await supabase.from('audit_logs').insert({
        action: 'self_heal',
        resource_type: 'system',
        details: healingResult,
        created_at: new Date().toISOString(),
      });
    }
    
    return NextResponse.json(healingResult);
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      duration_ms: Date.now() - startTime,
    }, { status: 500 });
  }
}
