// ================================================================================
// JAVARI CHAT API - /api/javari/chat
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
  TOKEN_ESTIMATE: 90000,  // ~70% of 128k
  CONTENT_SIZE_BYTES: 256000,  // 250KB
  LATENCY_MS_AVG: 2500,
};

// Check if rollover should be triggered
async function shouldRollover(supabase: any, conversationId: string): Promise<boolean> {
  const { data: conv } = await supabase
    .from('javari_conversations')
    .select('*')
    .eq('id', conversationId)
    .single();
  
  if (!conv || conv.status !== 'active') return false;
  
  // Check thresholds
  if (conv.message_count >= ROLLOVER_THRESHOLDS.MESSAGE_COUNT) return true;
  if (conv.token_estimate >= ROLLOVER_THRESHOLDS.TOKEN_ESTIMATE) return true;
  if (conv.content_size_bytes >= ROLLOVER_THRESHOLDS.CONTENT_SIZE_BYTES) return true;
  
  // Check recent latency
  const { data: recentMessages } = await supabase
    .from('javari_messages')
    .select('latency_ms')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (recentMessages && recentMessages.length >= 5) {
    const avgLatency = recentMessages.reduce((sum, m) => sum + (m.latency_ms || 0), 0) / recentMessages.length;
    if (avgLatency >= ROLLOVER_THRESHOLDS.LATENCY_MS_AVG) return true;
  }
  
  return false;
}

// Generate conversation capsule
async function generateCapsule(supabase: any, conversationId: string, tenantId: string): Promise<string> {
  // Get recent messages for summary
  const { data: messages } = await supabase
    .from('javari_messages')
    .select('role, content, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(50);
  
  // Get existing memory items
  const { data: memories } = await supabase
    .from('javari_memory_items')
    .select('category, key, value')
    .eq('tenant_id', tenantId)
    .eq('is_pinned', true);
  
  // Build capsule text
  const capsuleLines = [
    '# Conversation Capsule',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Key Points',
  ];
  
  if (messages && messages.length > 0) {
    capsuleLines.push('- Last ' + messages.length + ' messages summarized');
    // Add key topics (simplified - in production would use LLM)
    const topics = new Set<string>();
    messages.forEach(m => {
      if (m.content.length > 50) {
        topics.add(m.content.slice(0, 100).split(/[.!?]/)[0]);
      }
    });
    topics.forEach(t => capsuleLines.push(`- ${t}...`));
  }
  
  if (memories && memories.length > 0) {
    capsuleLines.push('', '## Active Memory Items');
    memories.forEach(m => {
      capsuleLines.push(`- [${m.category}] ${m.key}: ${m.value}`);
    });
  }
  
  return capsuleLines.join('\n');
}

// Execute rollover
async function executeRollover(
  supabase: any, 
  oldConversationId: string, 
  tenantId: string, 
  userId: string | null,
  requestId: string
): Promise<{ newConversationId: string; capsuleId: string }> {
  
  // 1. Get old conversation
  const { data: oldConv } = await supabase
    .from('javari_conversations')
    .select('*')
    .eq('id', oldConversationId)
    .single();
  
  // 2. Generate capsule for old conversation
  const capsuleText = await generateCapsule(supabase, oldConversationId, tenantId);
  const capsuleHash = Buffer.from(capsuleText).toString('base64').slice(0, 32);
  
  // 3. Store capsule
  const { data: capsule } = await supabase
    .from('javari_memory_capsules')
    .insert({
      tenant_id: tenantId,
      user_id: userId,
      conversation_id: oldConversationId,
      capsule_text: capsuleText,
      capsule_hash: capsuleHash,
      generated_by: 'system',
      token_count: Math.ceil(capsuleText.length / 4),
      is_current: true,
    })
    .select()
    .single();
  
  // 4. Create new conversation
  const rootId = oldConv.root_conversation_id || oldConversationId;
  const newThreadNumber = (oldConv.thread_number || 1) + 1;
  const newTitle = oldConv.title?.includes('(continued)') 
    ? oldConv.title 
    : `${oldConv.title} (continued)`;
  
  const { data: newConv } = await supabase
    .from('javari_conversations')
    .insert({
      tenant_id: tenantId,
      user_id: userId,
      title: newTitle,
      status: 'active',
      rollover_from_conversation_id: oldConversationId,
      thread_number: newThreadNumber,
      root_conversation_id: rootId,
      last_capsule_id: capsule?.id,
      last_capsule_version: 1,
    })
    .select()
    .single();
  
  // 5. Update old conversation
  await supabase
    .from('javari_conversations')
    .update({
      status: 'rolled_over',
      rollover_to_conversation_id: newConv.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', oldConversationId);
  
  // 6. Add system message to new conversation with capsule
  await supabase
    .from('javari_messages')
    .insert({
      conversation_id: newConv.id,
      tenant_id: tenantId,
      user_id: null,
      role: 'system',
      content: `[Thread ${newThreadNumber}] Continuing from previous conversation.\n\n${capsuleText}`,
      tokens_estimate: Math.ceil(capsuleText.length / 4),
    });
  
  // 7. Log rollover event
  await supabase.from('javari_memory_events').insert({
    tenant_id: tenantId,
    user_id: userId,
    conversation_id: newConv.id,
    event_type: 'rollover_completed',
    payload: {
      old_conversation_id: oldConversationId,
      new_conversation_id: newConv.id,
      thread_number: newThreadNumber,
      capsule_id: capsule?.id,
    },
    request_id: requestId,
  });
  
  return {
    newConversationId: newConv.id,
    capsuleId: capsule?.id,
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
    let {
      conversation_id,
      tenant_id = '00000000-0000-0000-0000-000000000000',
      user_id,
      message,
      force_rollover = false,
    } = body;
    
    if (!message) {
      return NextResponse.json({ error: 'Message required', request_id: requestId }, { status: 400 });
    }
    
    // Check feature flags
    const { data: flags } = await supabase
      .from('javari_feature_flags')
      .select('flag_name, flag_value')
      .eq('tenant_id', tenant_id);
    
    const featureFlags = flags?.reduce((acc, f) => ({ ...acc, [f.flag_name]: f.flag_value }), {}) || {};
    const autoRolloverEnabled = featureFlags['AUTO_THREAD_ROLLOVER_ENABLED'] !== false;
    
    // Create conversation if not provided
    if (!conversation_id) {
      const { data: newConv } = await supabase
        .from('javari_conversations')
        .insert({
          tenant_id,
          user_id,
          title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
          status: 'active',
          thread_number: 1,
        })
        .select()
        .single();
      
      conversation_id = newConv.id;
      
      // Set root to self for first conversation
      await supabase
        .from('javari_conversations')
        .update({ root_conversation_id: conversation_id })
        .eq('id', conversation_id);
    }
    
    // Check if rollover needed
    let rolledOver = false;
    let rolloverInfo = null;
    
    if (autoRolloverEnabled && (force_rollover || await shouldRollover(supabase, conversation_id))) {
      const result = await executeRollover(supabase, conversation_id, tenant_id, user_id, requestId);
      conversation_id = result.newConversationId;
      rolledOver = true;
      rolloverInfo = {
        old_conversation_id: body.conversation_id,
        new_conversation_id: result.newConversationId,
        capsule_id: result.capsuleId,
        message: 'Continuing in a new thread to keep performance fast.',
      };
    }
    
    // Store user message
    const userTokens = Math.ceil(message.length / 4);
    await supabase
      .from('javari_messages')
      .insert({
        conversation_id,
        tenant_id,
        user_id,
        role: 'user',
        content: message,
        tokens_estimate: userTokens,
        latency_ms: 0,
      });
    
    // Fetch memory for context
    const { data: memories } = await supabase
      .from('javari_memory_items')
      .select('category, key, value')
      .eq('tenant_id', tenant_id)
      .eq('is_active', true)
      .eq('is_pinned', true)
      .limit(20);
    
    // Generate response (placeholder - would call LLM provider)
    const assistantResponse = `[Javari] Received your message. ${rolledOver ? rolloverInfo?.message : ''} Memory context: ${memories?.length || 0} items loaded.`;
    const responseLatency = Date.now() - startTime;
    const responseTokens = Math.ceil(assistantResponse.length / 4);
    
    // Store assistant response
    await supabase
      .from('javari_messages')
      .insert({
        conversation_id,
        tenant_id,
        user_id: null,
        role: 'assistant',
        content: assistantResponse,
        tokens_estimate: responseTokens,
        latency_ms: responseLatency,
        model_provider: 'placeholder',
        model_name: 'javari-v1',
      });
    
    // Update conversation stats
    await supabase
      .from('javari_conversations')
      .update({
        latency_ms_avg: responseLatency,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversation_id);
    
    return NextResponse.json({
      request_id: requestId,
      conversation_id,
      response: assistantResponse,
      tokens: {
        input: userTokens,
        output: responseTokens,
      },
      latency_ms: responseLatency,
      rolled_over: rolledOver,
      rollover_info: rolloverInfo,
      memory_items_loaded: memories?.length || 0,
    });
    
  } catch (error: any) {
    return NextResponse.json({
      error: 'Chat failed',
      message: error.message,
      request_id: requestId,
    }, { status: 500 });
  }
}
