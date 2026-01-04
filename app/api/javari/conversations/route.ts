// ================================================================================
// JAVARI CONVERSATIONS API - /api/javari/conversations (FINAL - SESSION_ID UNIFIED)
// ================================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

const generateRequestId = () => `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
const generateSessionId = () => `sess_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

// GET - List sessions or get single session
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id') || searchParams.get('id');
  const userId = searchParams.get('user_id');
  
  if (sessionId) {
    // Get single session with messages
    const { data: messages, error } = await supabase
      .from('javari_conversation_memory')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    
    if (error) {
      return NextResponse.json({ error: error.message, request_id: requestId }, { status: 500 });
    }
    
    // Extract metadata from system message
    const systemMsg = messages?.find((m: any) => m.role === 'system');
    const facts = systemMsg?.extracted_facts || {};
    
    // Find rollover links
    const rolloverMarker = messages?.find((m: any) => m.content?.includes('[ROLLED OVER]'));
    const rolloverTo = rolloverMarker?.extracted_facts?.rollover_to || null;
    
    return NextResponse.json({
      request_id: requestId,
      session_id: sessionId,
      conversation_id: sessionId,
      thread_number: facts.thread_number || 1,
      rollover_from: facts.rollover_from || null,
      rollover_to: rolloverTo,
      messages: messages || [],
      message_count: messages?.length || 0,
      status: rolloverTo ? 'rolled_over' : 'active',
    });
  }
  
  // List all sessions (grouped)
  const { data: allMessages } = await supabase
    .from('javari_conversation_memory')
    .select('session_id, user_id, created_at, role')
    .order('created_at', { ascending: false });
  
  // Group by session_id
  const sessionMap = new Map<string, any>();
  allMessages?.forEach((m: any) => {
    if (!sessionMap.has(m.session_id)) {
      sessionMap.set(m.session_id, {
        session_id: m.session_id,
        user_id: m.user_id,
        first_message_at: m.created_at,
        last_message_at: m.created_at,
        message_count: 0,
      });
    }
    const session = sessionMap.get(m.session_id)!;
    session.message_count++;
    if (m.created_at > session.last_message_at) {
      session.last_message_at = m.created_at;
    }
    if (m.created_at < session.first_message_at) {
      session.first_message_at = m.created_at;
    }
  });
  
  let sessions = Array.from(sessionMap.values());
  
  // Filter by user_id if provided
  if (userId) {
    sessions = sessions.filter(s => s.user_id === userId);
  }
  
  // Sort by last message
  sessions.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
  
  return NextResponse.json({
    request_id: requestId,
    sessions: sessions.slice(0, 50),
    count: sessions.length,
  });
}

// POST - Create new session
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  
  try {
    const body = await request.json();
    const { user_id, title = 'New Conversation' } = body;
    
    const sessionId = generateSessionId();
    
    // Create session with initial system message
    const { data, error } = await supabase
      .from('javari_conversation_memory')
      .insert({
        user_id,
        session_id: sessionId,
        role: 'system',
        content: `[Thread 1] ${title}`,
        extracted_facts: {
          thread_number: 1,
          title,
          created_at: new Date().toISOString(),
        },
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message, request_id: requestId }, { status: 500 });
    }
    
    return NextResponse.json({
      request_id: requestId,
      session_id: sessionId,
      conversation_id: sessionId,
      title,
      thread_number: 1,
      status: 'active',
      created_at: data.created_at,
    });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message, request_id: requestId }, { status: 500 });
  }
}
