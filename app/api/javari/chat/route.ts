// ================================================================================
// JAVARI CHAT API - /api/javari/chat (V2 - Works with existing schema)
// Main chat endpoint with auto-rollover support
// ================================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const maxDuration = 60;

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

const generateRequestId = () => `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

// Rollover thresholds
const ROLLOVER_THRESHOLDS = {
  MESSAGE_COUNT: 120,
  TOKEN_ESTIMATE: 90000,
  CONTENT_SIZE_BYTES: 256000,
  LATENCY_MS_AVG: 2500,
};

// Check if rollover should be triggered
async function shouldRollover(supabase: any, conversationId: string): Promise<boolean> {
  // Get message count for this conversation
  const { count } = await supabase
    .from('javari_messages')
    .select('*', { count: 'exact', head: true })
    .eq('conversation_id', conversationId);
  
  if (count && count >= ROLLOVER_THRESHOLDS.MESSAGE_COUNT) return true;
  
  // Get conversation metadata
  const { data: conv } = await supabase
    .from('javari_conversations')
    .select('metadata')
    .eq('id', conversationId)
    .single();
  
  const metadata = conv?.metadata || {};
  if (metadata.token_estimate >= ROLLOVER_THRESHOLDS.TOKEN_ESTIMATE) return true;
  
  // Check recent latency
  const { data: recentMessages } = await supabase
    .from('javari_messages')
    .select('latency_ms')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (recentMessages && recentMessages.length >= 5) {
    const avgLatency = recentMessages.reduce((sum: number, m: any) => sum + (m.latency_ms || 0), 0) / recentMessages.length;
    if (avgLatency >= ROLLOVER_THRESHOLDS.LATENCY_MS_AVG) return true;
  }
  
  return false;
}

// Generate conversation capsule
async function generateCapsule(supabase: any, conversationId: string): Promise<string> {
  const { data: messages } = await supabase
    .from('javari_messages')
    .select('role, content, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(30);
  
  const capsuleLines = [
    '# Conversation Capsule',
    `Generated: ${new Date().toISOString()}`,
    `Messages: ${messages?.length || 0}`,
    '',
    '## Key Points',
  ];
  
  messages?.slice(0, 10).forEach((m: any) => {
    if (m.role === 'user' && m.content) {
      capsuleLines.push(`- User: ${m.content.slice(0, 100)}...`);
    }
  });
  
  return capsuleLines.join('\n');
}

// Execute rollover
async function executeRollover(
  supabase: any,
  oldConversationId: string,
  userId: string | null,
  requestId: string
): Promise<{ newConversationId: string; capsuleText: string }> {
  
  // Get old conversation
  const { data: oldConv } = await supabase
    .from('javari_conversations')
    .select('*')
    .eq('id', oldConversationId)
    .single();
  
  const oldMetadata = oldConv?.metadata || {};
  const threadNumber = (oldMetadata.thread_number || 1) + 1;
  
  // Generate capsule
  const capsuleText = await generateCapsule(supabase, oldConversationId);
  
  // Create new conversation
  const { data: newConv } = await supabase
    .from('javari_conversations')
    .insert({
      user_id: userId,
      role: 'user',
      metadata: {
        title: `${oldMetadata.title || 'Conversation'} (continued)`,
        thread_number: threadNumber,
        rollover_from_conversation_id: oldConversationId,
        message_count: 0,
        token_estimate: 0,
        status: 'active',
        capsule: capsuleText,
      }
    })
    .select()
    .single();
  
  // Update old conversation
  await supabase
    .from('javari_conversations')
    .update({
      metadata: {
        ...oldMetadata,
        status: 'rolled_over',
        rollover_to_conversation_id: newConv.id,
      }
    })
    .eq('id', oldConversationId);
  
  // Add system message with capsule to new conversation
  await supabase
    .from('javari_messages')
    .insert({
      conversation_id: newConv.id,
      role: 'system',
      content: `[Thread ${threadNumber}] Continuing from previous conversation.\n\n${capsuleText}`,
      tokens_used: Math.ceil(capsuleText.length / 4),
    });
  
  return {
    newConversationId: newConv.id,
    capsuleText,
  };
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }
    
    const body = await request.json();
    let { conversation_id, user_id, message, force_rollover = false } = body;
    
    if (!message) {
      return NextResponse.json({ error: 'Message required', request_id: requestId }, { status: 400 });
    }
    
    // Create conversation if not provided
    if (!conversation_id) {
      const { data: newConv } = await supabase
        .from('javari_conversations')
        .insert({
          user_id,
          role: 'user',
          metadata: {
            title: message.slice(0, 50),
            thread_number: 1,
            message_count: 0,
            token_estimate: 0,
            status: 'active',
          }
        })
        .select()
        .single();
      
      conversation_id = newConv.id;
    }
    
    // Check if rollover needed
    let rolledOver = false;
    let rolloverInfo = null;
    
    if (force_rollover || await shouldRollover(supabase, conversation_id)) {
      const result = await executeRollover(supabase, conversation_id, user_id, requestId);
      const oldId = conversation_id;
      conversation_id = result.newConversationId;
      rolledOver = true;
      rolloverInfo = {
        old_conversation_id: oldId,
        new_conversation_id: result.newConversationId,
        capsule_generated: true,
        message: 'Continuing in a new thread to keep performance fast.',
      };
    }
    
    // Store user message
    const userTokens = Math.ceil(message.length / 4);
    await supabase
      .from('javari_messages')
      .insert({
        conversation_id,
        role: 'user',
        content: message,
        tokens_used: userTokens,
        latency_ms: 0,
      });
    
    // Generate response (placeholder)
    const assistantResponse = `[Javari] Received: "${message.slice(0, 50)}..." ${rolledOver ? '(Thread rolled over)' : ''}`;
    const responseLatency = Date.now() - startTime;
    
    // Store assistant response
    await supabase
      .from('javari_messages')
      .insert({
        conversation_id,
        role: 'assistant',
        content: assistantResponse,
        tokens_used: Math.ceil(assistantResponse.length / 4),
        latency_ms: responseLatency,
        model: 'javari-v1',
      });
    
    // Update conversation metadata
    const { data: conv } = await supabase
      .from('javari_conversations')
      .select('metadata')
      .eq('id', conversation_id)
      .single();
    
    const metadata = conv?.metadata || {};
    await supabase
      .from('javari_conversations')
      .update({
        metadata: {
          ...metadata,
          message_count: (metadata.message_count || 0) + 2,
          token_estimate: (metadata.token_estimate || 0) + userTokens + Math.ceil(assistantResponse.length / 4),
        }
      })
      .eq('id', conversation_id);
    
    return NextResponse.json({
      request_id: requestId,
      conversation_id,
      response: assistantResponse,
      tokens: { input: userTokens, output: Math.ceil(assistantResponse.length / 4) },
      latency_ms: responseLatency,
      rolled_over: rolledOver,
      rollover_info: rolloverInfo,
    });
    
  } catch (error: any) {
    return NextResponse.json({
      error: 'Chat failed',
      message: error.message,
      request_id: requestId,
    }, { status: 500 });
  }
}
