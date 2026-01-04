// ================================================================================
// JAVARI MEMORY API - /api/javari/memory (FINAL - SESSION_ID UNIFIED)
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

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }
    
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id') || searchParams.get('conversation_id');
    const userId = searchParams.get('user_id');
    
    // Get capsule for session (system message with thread info)
    let capsule = null;
    let threadInfo = null;
    
    if (sessionId) {
      const { data: systemMsgs } = await supabase
        .from('javari_conversation_memory')
        .select('content, extracted_facts, created_at')
        .eq('session_id', sessionId)
        .eq('role', 'system')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (systemMsgs && systemMsgs[0]) {
        const sys = systemMsgs[0];
        capsule = {
          text: sys.content,
          created_at: sys.created_at,
          thread_number: sys.extracted_facts?.thread_number || 1,
          rollover_from: sys.extracted_facts?.rollover_from || null,
        };
        threadInfo = sys.extracted_facts;
      }
    }
    
    // Get user memories (if any pinned items exist)
    const { data: userMemories } = await supabase
      .from('javari_user_memory')
      .select('*')
      .eq('user_id', userId || '00000000-0000-0000-0000-000000000000')
      .limit(20);
    
    // Get feature flags
    const { data: flags } = await supabase
      .from('feature_flags')
      .select('flag_name, flag_value')
      .limit(20);
    
    const featureFlags = flags?.reduce((acc: any, f: any) => {
      acc[f.flag_name] = f.flag_value;
      return acc;
    }, {}) || {
      MEMORY_ENABLED: true,
      AUTO_THREAD_ROLLOVER_ENABLED: true,
      MEMORY_SUMMARIZATION_ENABLED: true,
    };
    
    // Get Operating Bible and Current State from evidence_artifacts
    const { data: carDocs } = await supabase
      .from('evidence_artifacts')
      .select('artifact_type, file_path, metadata')
      .in('artifact_type', ['operating_bible', 'current_state']);
    
    const carLinks: any = {
      operating_bible: null,
      current_state: null,
    };
    
    carDocs?.forEach((doc: any) => {
      if (doc.artifact_type === 'operating_bible') {
        carLinks.operating_bible = doc.file_path;
      }
      if (doc.artifact_type === 'current_state') {
        carLinks.current_state = doc.file_path;
      }
    });
    
    return NextResponse.json({
      request_id: requestId,
      timestamp: new Date().toISOString(),
      latency_ms: Date.now() - startTime,
      
      session_id: sessionId,
      capsule,
      thread_info: threadInfo,
      
      user_memories: userMemories || [],
      memory_count: userMemories?.length || 0,
      
      feature_flags: featureFlags,
      car_links: carLinks,
    });
    
  } catch (error: any) {
    return NextResponse.json({
      error: 'Memory retrieval failed',
      message: error.message,
      request_id: requestId,
    }, { status: 500 });
  }
}
