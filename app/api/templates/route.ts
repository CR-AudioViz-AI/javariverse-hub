/**
 * CR AudioViz AI - Central Templates API
 * Design templates, backgrounds, fonts, icons, stickers
 * 
 * @author CR AudioViz AI, LLC
 * @created December 31, 2025
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Asset categories
const CATEGORIES = [
  'templates', 'backgrounds', 'fonts', 'icons', 'stickers',
  'illustrations', 'patterns', 'gradients', 'frames', 'shapes',
  'text-effects', 'color-palettes', 'mockups', 'logos'
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const style = searchParams.get('style');
    const premium = searchParams.get('premium');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!category) {
      return NextResponse.json({ categories: CATEGORIES });
    }

    if (!CATEGORIES.includes(category)) {
      return NextResponse.json({ error: `Invalid category. Must be: ${CATEGORIES.join(', ')}` }, { status: 400 });
    }

    let query = supabase
      .from('design_assets')
      .select('*', { count: 'exact' })
      .eq('category', category)
      .order('downloads', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) query = query.or(`name.ilike.%${search}%,tags.cs.{${search}}`);
    if (style) query = query.eq('style', style);
    if (premium === 'true') query = query.eq('premium', true);
    if (premium === 'false') query = query.eq('premium', false);

    const { data, error, count } = await query;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      assets: data,
      total: count,
      category,
      limit,
      offset
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, name, url, thumbnail_url, tags, style, premium, app_id } = body;

    if (!category || !name || !url) {
      return NextResponse.json({ error: 'category, name, and url required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('design_assets')
      .insert({
        category,
        name,
        url,
        thumbnail_url,
        tags: tags || [],
        style,
        premium: premium || false,
        downloads: 0,
        app_id: app_id || 'unknown',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, asset: data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Track download
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { asset_id } = body;

    if (!asset_id) return NextResponse.json({ error: 'asset_id required' }, { status: 400 });

    const { error } = await supabase.rpc('increment_downloads', { asset_id });
    if (error) {
      // Fallback if RPC doesn't exist
      await supabase
        .from('design_assets')
        .update({ downloads: supabase.rpc('increment', { x: 1 }) })
        .eq('id', asset_id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
