// =============================================================================
// CR AUDIOVIZ AI - CENTRALIZED TICKETS API (SIMPLIFIED)
// =============================================================================
// Production Ready - December 15, 2025
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kteobfyferrukqeolofj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Simple fetch wrapper for Supabase
async function supabaseQuery(table: string, options: {
  method?: string;
  select?: string;
  filters?: Record<string, string>;
  body?: any;
  single?: boolean;
} = {}) {
  const { method = 'GET', select = '*', filters = {}, body, single } = options;
  
  let url = `${SUPABASE_URL}/rest/v1/${table}`;
  const params = new URLSearchParams();
  
  if (select) params.set('select', select);
  Object.entries(filters).forEach(([key, value]) => {
    params.set(key, value);
  });
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  const headers: Record<string, string> = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
  };
  
  if (method === 'POST' || method === 'PATCH') {
    headers['Prefer'] = 'return=representation';
  }
  
  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || `Supabase error: ${response.status}`);
  }
  
  return single && Array.isArray(data) ? data[0] : data;
}

// ============ GET - List/Get Tickets ============
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const user_id = searchParams.get('user_id');
    const status = searchParams.get('status');
    const source_app = searchParams.get('source_app');
    const limit = searchParams.get('limit') || '50';
    
    // Build filters
    const filters: Record<string, string> = {};
    if (id) filters['id'] = `eq.${id}`;
    if (user_id) filters['user_id'] = `eq.${user_id}`;
    if (status) filters['status'] = `eq.${status}`;
    if (source_app) filters['source_app'] = `eq.${source_app}`;
    filters['limit'] = limit;
    filters['order'] = 'created_at.desc';
    
    const tickets = await supabaseQuery('support_tickets', { filters });
    
    // Get stats
    const allTickets = await supabaseQuery('support_tickets', { 
      select: 'status,source_app,auto_fix_successful' 
    });
    
    const stats = {
      total: allTickets?.length || 0,
      byStatus: {} as Record<string, number>,
      bySource: {} as Record<string, number>,
      autoFixed: 0
    };
    
    (allTickets || []).forEach((t: any) => {
      stats.byStatus[t.status] = (stats.byStatus[t.status] || 0) + 1;
      stats.bySource[t.source_app || 'platform'] = (stats.bySource[t.source_app || 'platform'] || 0) + 1;
      if (t.auto_fix_successful) stats.autoFixed++;
    });
    
    return NextResponse.json({
      success: true,
      tickets: tickets || [],
      stats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('GET tickets error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get tickets',
      debug: {
        supabase_url: SUPABASE_URL,
        has_key: !!SUPABASE_KEY
      }
    }, { status: 500 });
  }
}

// ============ POST - Create Ticket ============
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.description || !body.category) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: title, description, category'
      }, { status: 400 });
    }
    
    // Generate ticket number
    const ticketNumber = `TKT-${Date.now().toString(36).toUpperCase()}`;
    
    // Create ticket
    const ticket = await supabaseQuery('support_tickets', {
      method: 'POST',
      body: {
        ticket_number: ticketNumber,
        title: body.title,
        description: body.description,
        category: body.category,
        priority: body.priority || 'medium',
        status: 'open',
        user_id: body.user_id || null,
        user_email: body.user_email || null,
        user_name: body.user_name || null,
        source_app: body.source_app || 'platform',
        source_url: body.source_url || null,
        error_logs: body.error_logs || null,
        browser_info: body.browser_info || null,
        assigned_bot: 'javari-autofix-v1'
      },
      single: true
    });
    
    // Add system comment
    await supabaseQuery('ticket_comments', {
      method: 'POST',
      body: {
        ticket_id: ticket.id,
        author_type: 'system',
        author_name: 'System',
        content: `🎫 Ticket ${ticketNumber} created.\n📍 Source: ${body.source_app || 'platform'}\n\n🤖 Javari Auto-Fix Bot will analyze this issue.`
      }
    });
    
    // Log activity
    await supabaseQuery('ticket_activity', {
      method: 'POST',
      body: {
        ticket_id: ticket.id,
        action: 'ticket_created',
        actor_type: 'user',
        actor_name: body.user_name || 'Anonymous',
        new_value: { status: 'open', source_app: body.source_app || 'platform' }
      }
    });
    
    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.id,
        ticket_number: ticketNumber,
        status: 'open',
        message: 'Ticket created successfully. Javari Auto-Fix Bot will analyze your issue.'
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('POST ticket error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create ticket'
    }, { status: 500 });
  }
}

// ============ PATCH - Update Ticket ============
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Missing ticket id'
      }, { status: 400 });
    }
    
    // Update via REST API
    const url = `${SUPABASE_URL}/rest/v1/support_tickets?id=eq.${id}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(updates)
    });
    
    const ticket = await response.json();
    
    return NextResponse.json({
      success: true,
      ticket: Array.isArray(ticket) ? ticket[0] : ticket
    });
    
  } catch (error) {
    console.error('PATCH ticket error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update ticket'
    }, { status: 500 });
  }
}

// ============ PUT - Add Comment ============
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticket_id, content, author_type, author_name } = body;
    
    if (!ticket_id || !content) {
      return NextResponse.json({
        success: false,
        error: 'Missing ticket_id or content'
      }, { status: 400 });
    }
    
    const comment = await supabaseQuery('ticket_comments', {
      method: 'POST',
      body: {
        ticket_id,
        author_type: author_type || 'user',
        author_name: author_name || 'User',
        content,
        is_internal: false
      },
      single: true
    });
    
    return NextResponse.json({
      success: true,
      comment
    });
    
  } catch (error) {
    console.error('PUT comment error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add comment'
    }, { status: 500 });
  }
}
