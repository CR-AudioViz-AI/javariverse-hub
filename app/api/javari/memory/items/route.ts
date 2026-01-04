// ================================================================================
// JAVARI MEMORY ITEMS API - /api/javari/memory/items
// CRUD operations for memory items
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

// GET - List memory items
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');
  const tenantId = searchParams.get('tenant_id') || '00000000-0000-0000-0000-000000000000';
  const category = searchParams.get('category');
  const scope = searchParams.get('scope');
  const pinnedOnly = searchParams.get('pinned') === 'true';
  
  let query = supabase
    .from('javari_memory_items')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('is_active', true);
  
  if (userId) query = query.eq('user_id', userId);
  if (category) query = query.eq('category', category);
  if (scope) query = query.eq('scope', scope);
  if (pinnedOnly) query = query.eq('is_pinned', true);
  
  const { data, error } = await query.order('importance', { ascending: false }).limit(100);
  
  if (error) {
    return NextResponse.json({ error: error.message, request_id: requestId }, { status: 500 });
  }
  
  return NextResponse.json({
    request_id: requestId,
    items: data,
    count: data?.length || 0,
  });
}

// POST - Add memory item
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  
  try {
    const body = await request.json();
    const {
      tenant_id = '00000000-0000-0000-0000-000000000000',
      user_id,
      scope = 'user',
      category,
      key,
      value,
      importance = 5,
      source = 'assistant',
      is_sensitive = false,
      is_pinned = false,
    } = body;
    
    // Validation
    if (!category || !key || !value) {
      return NextResponse.json({ 
        error: 'Missing required fields: category, key, value',
        request_id: requestId 
      }, { status: 400 });
    }
    
    // Detect sensitive content
    const sensitivePatterns = /\b(ssn|social security|credit card|password|secret|token|api.?key)\b/i;
    const detectedSensitive = is_sensitive || sensitivePatterns.test(key + value);
    
    // Upsert memory item
    const { data, error } = await supabase
      .from('javari_memory_items')
      .upsert({
        tenant_id,
        user_id,
        scope,
        category,
        key,
        value,
        importance,
        source,
        is_sensitive: detectedSensitive,
        is_pinned,
        updated_at: new Date().toISOString(),
        last_used_at: new Date().toISOString(),
      }, {
        onConflict: 'tenant_id,user_id,scope,category,key',
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message, request_id: requestId }, { status: 500 });
    }
    
    // Log event
    await supabase.from('javari_memory_events').insert({
      tenant_id,
      user_id,
      event_type: 'memory_added',
      payload: { memory_id: data?.id, category, key },
      request_id: requestId,
    });
    
    return NextResponse.json({
      request_id: requestId,
      success: true,
      item: data,
      sensitive_detected: detectedSensitive,
    });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message, request_id: requestId }, { status: 500 });
  }
}

// PATCH - Update memory item
export async function PATCH(request: NextRequest) {
  const requestId = generateRequestId();
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing id', request_id: requestId }, { status: 400 });
    }
    
    const { data, error } = await supabase
      .from('javari_memory_items')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
        version: supabase.rpc('increment_version'),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message, request_id: requestId }, { status: 500 });
    }
    
    return NextResponse.json({ request_id: requestId, success: true, item: data });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message, request_id: requestId }, { status: 500 });
  }
}

// DELETE - Soft delete memory item
export async function DELETE(request: NextRequest) {
  const requestId = generateRequestId();
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Missing id', request_id: requestId }, { status: 400 });
  }
  
  // Soft delete
  const { error } = await supabase
    .from('javari_memory_items')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id);
  
  if (error) {
    return NextResponse.json({ error: error.message, request_id: requestId }, { status: 500 });
  }
  
  return NextResponse.json({ request_id: requestId, success: true, deleted: id });
}
