// ================================================================================
// CR AUDIOVIZ AI - SUPPORT TICKETS API
// Central ticketing with AI triage, auto-fix, and SLA tracking
// ================================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

async function getUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  const supabase = getSupabase();
  if (!supabase) return null;
  const token = authHeader.replace('Bearer ', '');
  const { data: { user } } = await supabase.auth.getUser(token);
  return user;
}

// Generate ticket number
function generateTicketNumber(): string {
  const date = new Date();
  const prefix = 'TKT';
  const timestamp = date.getFullYear().toString().slice(-2) + 
    (date.getMonth() + 1).toString().padStart(2, '0') +
    date.getDate().toString().padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// ============================================================================
// GET /api/tickets - List tickets
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');
    const adminView = searchParams.get('admin') === 'true';

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    let query = supabase
      .from('support_tickets')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(limit);

    // Non-admin users only see their own tickets
    if (!adminView && user) {
      query = query.eq('user_id', user.id);
    }

    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    if (category) query = query.eq('category', category);

    const { data: tickets, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
    }

    // Calculate SLA metrics
    const slaMetrics = {
      total: count || 0,
      open: tickets?.filter(t => t.status === 'open').length || 0,
      in_progress: tickets?.filter(t => t.status === 'in_progress').length || 0,
      resolved: tickets?.filter(t => t.status === 'resolved').length || 0,
      avg_resolution_hours: 0
    };

    return NextResponse.json({
      tickets: tickets || [],
      total: count || 0,
      sla_metrics: slaMetrics,
      limit
    });

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// POST /api/tickets - Create new ticket
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request);
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const body = await request.json();
    const {
      title,
      description,
      category = 'general',
      priority = 'medium',
      source_app,
      source_url,
      browser_info,
      error_logs,
      screenshots = []
    } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'title and description required' }, { status: 400 });
    }

    // Create ticket
    const ticketNumber = generateTicketNumber();
    
    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .insert({
        ticket_number: ticketNumber,
        user_id: user?.id,
        user_email: user?.email || body.email,
        user_name: body.name || user?.user_metadata?.full_name,
        title,
        description,
        category,
        priority,
        status: 'open',
        source_app,
        source_url,
        browser_info,
        error_logs,
        screenshots
      })
      .select()
      .single();

    if (error) {
      console.error('Ticket creation error:', error);
      return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: user?.id,
      action: 'ticket_created',
      resource_type: 'support_ticket',
      resource_id: ticket.id,
      details: { ticket_number: ticketNumber, title, category, priority }
    });

    return NextResponse.json({ 
      ticket, 
      success: true,
      message: `Ticket ${ticketNumber} created successfully`
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// PATCH /api/tickets - Update ticket
// ============================================================================
export async function PATCH(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { id, status, resolution, assigned_to, priority } = body;

    if (!id) {
      return NextResponse.json({ error: 'Ticket ID required' }, { status: 400 });
    }

    const updates: any = { updated_at: new Date().toISOString() };
    if (status) updates.status = status;
    if (resolution) updates.resolution = resolution;
    if (assigned_to) updates.assigned_to = assigned_to;
    if (priority) updates.priority = priority;

    if (status === 'resolved') {
      updates.resolved_at = new Date().toISOString();
      updates.resolved_by = user.id;
    }

    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
    }

    return NextResponse.json({ ticket, success: true });

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
