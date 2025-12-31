/**
 * CR AudioViz AI - Central Spirits API
 * Spirits database, distilleries, cocktails, bars
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

const SPIRIT_TYPES = ['whiskey', 'bourbon', 'scotch', 'rum', 'vodka', 'gin', 'tequila', 'mezcal', 'brandy', 'cognac', 'wine', 'beer', 'sake', 'liqueur'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // spirits, distilleries, cocktails, bars
    const spirit_type = searchParams.get('spirit_type');
    const search = searchParams.get('search');
    const id = searchParams.get('id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const user_id = searchParams.get('user_id');

    switch (type) {
      case 'spirits':
        if (id) {
          const { data, error } = await supabase.from('spirits').select('*, tasting_notes(*), spirit_images(*)').eq('id', id).single();
          if (error) return NextResponse.json({ error: 'Spirit not found' }, { status: 404 });
          return NextResponse.json({ spirit: data });
        }
        let spiritQuery = supabase.from('spirits').select('*', { count: 'exact' }).order('name').limit(limit);
        if (spirit_type) spiritQuery = spiritQuery.eq('spirit_type', spirit_type);
        if (search) spiritQuery = spiritQuery.ilike('name', \`%\${search}%\`);
        const { data: spirits, count } = await spiritQuery;
        return NextResponse.json({ spirits: spirits || [], total: count, types: SPIRIT_TYPES });

      case 'distilleries':
        let distQuery = supabase.from('distilleries').select('*').order('name').limit(limit);
        if (search) distQuery = distQuery.ilike('name', \`%\${search}%\`);
        const { data: distilleries } = await distQuery;
        return NextResponse.json({ distilleries: distilleries || [] });

      case 'cocktails':
        let cocktailQuery = supabase.from('cocktails').select('*, cocktail_ingredients(*)').order('name').limit(limit);
        if (search) cocktailQuery = cocktailQuery.ilike('name', \`%\${search}%\`);
        const { data: cocktails } = await cocktailQuery;
        return NextResponse.json({ cocktails: cocktails || [] });

      case 'bars':
        const lat = searchParams.get('lat');
        const lng = searchParams.get('lng');
        let barQuery = supabase.from('bars').select('*').limit(limit);
        if (search) barQuery = barQuery.ilike('name', \`%\${search}%\`);
        const { data: bars } = await barQuery;
        return NextResponse.json({ bars: bars || [] });

      case 'collection':
        if (!user_id) return NextResponse.json({ error: 'user_id required' }, { status: 400 });
        const { data: collection } = await supabase.from('spirit_collections').select('*, spirits(*)').eq('user_id', user_id);
        return NextResponse.json({ collection: collection || [] });

      default:
        return NextResponse.json({ types: ['spirits', 'distilleries', 'cocktails', 'bars', 'collection'], spirit_types: SPIRIT_TYPES });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, user_id, ...data } = body;

    switch (type) {
      case 'tasting_note':
        if (!user_id) return NextResponse.json({ error: 'user_id required' }, { status: 400 });
        const { data: note, error: noteError } = await supabase.from('tasting_notes').insert({
          ...data, user_id, created_at: new Date().toISOString()
        }).select().single();
        if (noteError) return NextResponse.json({ error: noteError.message }, { status: 500 });
        return NextResponse.json({ success: true, note });

      case 'collection_add':
        if (!user_id) return NextResponse.json({ error: 'user_id required' }, { status: 400 });
        const { error: collError } = await supabase.from('spirit_collections').insert({
          user_id, spirit_id: data.spirit_id, created_at: new Date().toISOString()
        });
        if (collError) return NextResponse.json({ error: collError.message }, { status: 500 });
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
