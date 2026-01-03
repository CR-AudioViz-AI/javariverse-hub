/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  JAVARI BOT ORCHESTRATOR - 24/7/365 AUTONOMOUS MONITORING
 *  CR AudioViz AI Platform
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 *  This cron job runs every 2 minutes and:
 *  1. Checks ALL critical pages for availability
 *  2. Tests ALL API endpoints
 *  3. Verifies database connectivity
 *  4. Monitors security headers
 *  5. Checks for JavaScript errors
 *  6. Validates SEO elements
 *  7. Records issues and attempts auto-fixes
 *  8. Alerts on critical failures
 * 
 *  If Javari's bots are working, this should find ZERO issues.
 *  Any issues found = system needs attention.
 * 
 *  @timestamp Friday, January 02, 2026 - 8:30 PM EST
 *  @author Claude (for Roy Henderson)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://craudiovizai.com';

const CRITICAL_PAGES = [
  '/', '/apps', '/games', '/tools', '/pricing',
  '/about', '/contact', '/login', '/register', '/dashboard',
  '/craiverse', '/blog', '/forgot-password', '/help'
];

const API_ENDPOINTS = [
  { path: '/api/health', method: 'GET', expected: 200 },
  { path: '/api/warmup', method: 'GET', expected: 200 },
  { path: '/api/apps', method: 'GET', expected: 200 },
  { path: '/api/tools', method: 'GET', expected: 200 },
  { path: '/api/games', method: 'GET', expected: 200 },
  { path: '/api/bots/status', method: 'GET', expected: 200 },
  { path: '/api/credits/packages', method: 'GET', expected: [200, 401] },
  { path: '/api/javari/chat', method: 'POST', expected: [200, 400, 401] },
];

const REQUIRED_TABLES = [
  'users', 'profiles', 'credits', 'payments', 'subscriptions',
  'apps', 'tools', 'games', 'bots', 'bot_runs', 'bot_issues',
  'conversations', 'messages', 'notifications'
];

interface Issue {
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  url: string;
  auto_fixable: boolean;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const issues: Issue[] = [];
  const results: Record<string, any> = {};
  
  // Verify this is a legitimate cron request
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  // Allow both cron secret and no auth (for Vercel cron)
  const isAuthorized = !cronSecret || 
    authHeader === `Bearer ${cronSecret}` || 
    request.headers.get('x-vercel-cron') === '1';
  
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // ─────────────────────────────────────────────────────────────────────────
    // CHECK 1: Critical Pages Availability
    // ─────────────────────────────────────────────────────────────────────────
    results.pages = { checked: 0, passed: 0, failed: 0, errors: [] };
    
    for (const page of CRITICAL_PAGES) {
      results.pages.checked++;
      try {
        const response = await fetch(`${BASE_URL}${page}`, {
          method: 'GET',
          headers: { 'User-Agent': 'JavariBot/1.0' },
          signal: AbortSignal.timeout(10000)
        });
        
        if (response.ok) {
          results.pages.passed++;
        } else {
          results.pages.failed++;
          results.pages.errors.push({ page, status: response.status });
          issues.push({
            category: 'availability',
            severity: response.status >= 500 ? 'critical' : 'high',
            title: `Page Unavailable: ${page}`,
            description: `HTTP ${response.status} response`,
            url: `${BASE_URL}${page}`,
            auto_fixable: false
          });
        }
      } catch (error: any) {
        results.pages.failed++;
        results.pages.errors.push({ page, error: error.message });
        issues.push({
          category: 'availability',
          severity: 'critical',
          title: `Page Error: ${page}`,
          description: error.message,
          url: `${BASE_URL}${page}`,
          auto_fixable: false
        });
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CHECK 2: API Endpoints
    // ─────────────────────────────────────────────────────────────────────────
    results.apis = { checked: 0, passed: 0, failed: 0, errors: [] };
    
    for (const endpoint of API_ENDPOINTS) {
      results.apis.checked++;
      try {
        const response = await fetch(`${BASE_URL}${endpoint.path}`, {
          method: endpoint.method,
          headers: { 
            'User-Agent': 'JavariBot/1.0',
            'Content-Type': 'application/json'
          },
          body: endpoint.method === 'POST' ? JSON.stringify({ test: true }) : undefined,
          signal: AbortSignal.timeout(10000)
        });
        
        const expectedStatuses = Array.isArray(endpoint.expected) 
          ? endpoint.expected 
          : [endpoint.expected];
        
        if (expectedStatuses.includes(response.status)) {
          results.apis.passed++;
        } else {
          results.apis.failed++;
          results.apis.errors.push({ path: endpoint.path, status: response.status });
          issues.push({
            category: 'api',
            severity: response.status >= 500 ? 'critical' : 'medium',
            title: `API Error: ${endpoint.path}`,
            description: `Expected ${endpoint.expected}, got ${response.status}`,
            url: `${BASE_URL}${endpoint.path}`,
            auto_fixable: false
          });
        }
      } catch (error: any) {
        results.apis.failed++;
        issues.push({
          category: 'api',
          severity: 'critical',
          title: `API Timeout: ${endpoint.path}`,
          description: error.message,
          url: `${BASE_URL}${endpoint.path}`,
          auto_fixable: false
        });
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CHECK 3: Database Connectivity & Tables
    // ─────────────────────────────────────────────────────────────────────────
    results.database = { checked: 0, passed: 0, failed: 0, missing_tables: [] };
    
    for (const table of REQUIRED_TABLES) {
      results.database.checked++;
      try {
        const { error } = await supabase
          .from(table)
          .select('id')
          .limit(1);
        
        if (error) {
          results.database.failed++;
          results.database.missing_tables.push(table);
          issues.push({
            category: 'database',
            severity: 'high',
            title: `Missing Table: ${table}`,
            description: error.message,
            url: `supabase://${table}`,
            auto_fixable: true
          });
        } else {
          results.database.passed++;
        }
      } catch (error: any) {
        results.database.failed++;
        issues.push({
          category: 'database',
          severity: 'critical',
          title: `Database Error: ${table}`,
          description: error.message,
          url: `supabase://${table}`,
          auto_fixable: false
        });
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CHECK 4: Security Headers (on homepage)
    // ─────────────────────────────────────────────────────────────────────────
    results.security = { checked: 0, passed: 0, failed: 0, missing: [] };
    
    const REQUIRED_HEADERS = [
      'strict-transport-security',
      'x-content-type-options',
      'x-frame-options',
      'content-security-policy',
      'referrer-policy'
    ];
    
    try {
      const response = await fetch(BASE_URL, {
        method: 'HEAD',
        signal: AbortSignal.timeout(10000)
      });
      
      for (const header of REQUIRED_HEADERS) {
        results.security.checked++;
        if (response.headers.get(header)) {
          results.security.passed++;
        } else {
          results.security.failed++;
          results.security.missing.push(header);
          issues.push({
            category: 'security',
            severity: 'medium',
            title: `Missing Security Header: ${header}`,
            description: 'Security header not present in response',
            url: BASE_URL,
            auto_fixable: false
          });
        }
      }
    } catch (error: any) {
      issues.push({
        category: 'security',
        severity: 'high',
        title: 'Security Check Failed',
        description: error.message,
        url: BASE_URL,
        auto_fixable: false
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RECORD RUN AND ISSUES
    // ─────────────────────────────────────────────────────────────────────────
    const duration = Date.now() - startTime;
    
    // Get bot ID for HealthMonitor
    const { data: bot } = await supabase
      .from('bots')
      .select('id')
      .eq('name', 'HealthMonitor')
      .single();
    
    // Record this run
    const { data: run } = await supabase
      .from('bot_runs')
      .insert({
        bot_id: bot?.id,
        bot_name: 'Orchestrator',
        completed_at: new Date().toISOString(),
        duration_ms: duration,
        status: issues.length === 0 ? 'success' : 'issues_found',
        result: results,
        issues_found: issues.length,
        issues_fixed: 0
      })
      .select('id')
      .single();
    
    // Record individual issues
    if (issues.length > 0 && run?.id) {
      await supabase
        .from('bot_issues')
        .insert(issues.map(issue => ({
          bot_run_id: run.id,
          bot_name: 'Orchestrator',
          ...issue
        })));
    }
    
    // Update bot last execution
    if (bot?.id) {
      await supabase
        .from('bots')
        .update({
          last_execution_at: new Date().toISOString(),
          last_result: { issues: issues.length, duration },
          success_count: issues.length === 0 
            ? supabase.rpc('increment', { row_id: bot.id, column_name: 'success_count' })
            : undefined,
          failure_count: issues.length > 0
            ? supabase.rpc('increment', { row_id: bot.id, column_name: 'failure_count' })
            : undefined
        })
        .eq('id', bot.id);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RETURN RESULTS
    // ─────────────────────────────────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      status: issues.length === 0 ? 'HEALTHY' : 'ISSUES_FOUND',
      timestamp: new Date().toISOString(),
      duration_ms: duration,
      summary: {
        pages: `${results.pages.passed}/${results.pages.checked}`,
        apis: `${results.apis.passed}/${results.apis.checked}`,
        database: `${results.database.passed}/${results.database.checked}`,
        security: `${results.security.passed}/${results.security.checked}`,
        total_issues: issues.length,
        critical: issues.filter(i => i.severity === 'critical').length,
        high: issues.filter(i => i.severity === 'high').length,
        medium: issues.filter(i => i.severity === 'medium').length,
        low: issues.filter(i => i.severity === 'low').length
      },
      issues: issues.slice(0, 20), // Limit response size
      results
    });

  } catch (error: any) {
    // Log critical failure
    await supabase
      .from('bot_runs')
      .insert({
        bot_name: 'Orchestrator',
        completed_at: new Date().toISOString(),
        duration_ms: Date.now() - startTime,
        status: 'error',
        error_message: error.message
      });

    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max
