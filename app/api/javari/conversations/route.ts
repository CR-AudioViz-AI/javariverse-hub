// ================================================================================
// JAVARI CONVERSATIONS API - /api/javari/conversations
// UPDATED to work with existing schema
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

// GET - Get conversation by ID or list conversations
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const userId = searchParams.get('user_id');
  
  if (id) {
    // Get single conversation
    const { data: conv, error } = await supabase
      .from('javari_conversations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message, request_id: requestId }, { status: 404 });
    }
    
    // Get messages
    const { data: messages } = await supabase
      .from('javari_messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true })
      .limit(50);
    
    // Get thread chain from metadata
    const metadata = conv.metadata || {};
    
    return NextResponse.json({
      request_id: requestId,
      conversation: conv,
      thread_number: metadata.thread_number || 1,
      rollover_from: metadata.rollover_from_conversation_id || null,
      rollover_to: metadata.rollover_to_conversation_id || null,
      messages: messages || [],
      message_count: messages?.length || 0,
    });
  }
  
  // List conversations
  let query = supabase
    .from('javari_conversations')
    .select('*');
  
  if (userId) query = query.eq('user_id', userId);
  
  const { data, error } = await query.order('created_at', { ascending: false }).limit(50);
  
  if (error) {
    return NextResponse.json({ error: error.message, request_id: requestId }, { status: 500 });
  }
  
  return NextResponse.json({
    request_id: requestId,
    conversations: data || [],
    count: data?.length || 0,
  });
}

// POST - Create new conversation
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  
  try {
    const body = await request.json();
    const { user_id, title = 'New Conversation' } = body;
    
    // Create conversation using existing schema (role is required)
    const { data: conv, error } = await supabase
      .from('javari_conversations')
      .insert({
        user_id,
        role: 'user',  // Required field in existing schema
        metadata: { 
          title,
          thread_number: 1,
          message_count: 0,
          token_estimate: 0,
          status: 'active'
        }
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message, request_id: requestId }, { status: 500 });
    }
    
    return NextResponse.json({
      request_id: requestId,
      conversation: conv,
      title,
    });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message, request_id: requestId }, { status: 500 });
  }
}
