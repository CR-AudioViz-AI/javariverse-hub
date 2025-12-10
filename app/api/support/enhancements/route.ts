// app/api/support/enhancements/route.ts
// API for enhancement request management

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - List enhancement requests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sort') || 'votes'; // 'votes', 'newest', 'oldest'
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('enhancement_requests')
      .select('*')
      .limit(limit);

    if (status) query = query.eq('status', status);
    if (category) query = query.eq('category', category);

    // Sorting
    if (sortBy === 'votes') {
      query = query.order('vote_count', { ascending: false });
    } else if (sortBy === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: true });
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, enhancements: data });
  } catch (error) {
    console.error('Error fetching enhancements:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch enhancements' },
      { status: 500 }
    );
  }
}

// POST - Create new enhancement request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { title, description, category, source_app, user_email, user_id } = body;

    if (!title || !description || !category) {
      return NextResponse.json(
        { success: false, error: 'Title, description, and category are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('enhancement_requests')
      .insert({
        title,
        description,
        category,
        source_app: source_app || 'all',
        user_email,
        user_id,
        status: 'submitted',
        vote_count: 0,
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from('javari_activity_log').insert({
      activity_type: 'enhancement_submitted',
      description: `New enhancement request: ${title}`,
      success: true,
    });

    return NextResponse.json({ success: true, enhancement: data });
  } catch (error) {
    console.error('Error creating enhancement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create enhancement' },
      { status: 500 }
    );
  }
}
