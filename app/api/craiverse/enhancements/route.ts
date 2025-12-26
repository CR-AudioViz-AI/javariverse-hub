import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const sort = searchParams.get('sort') || 'votes';

  let query = supabase
    .from('craiverse_enhancements')
    .select('*');

  if (status) {
    query = query.eq('status', status);
  }

  if (sort === 'votes') {
    query = query.order('upvote_count', { ascending: false });
  } else if (sort === 'newest') {
    query = query.order('created_at', { ascending: false });
  }

  const { data: enhancements, error } = await query.limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ enhancements: enhancements || [] });
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, category, target_app } = body;

  if (!title || !description) {
    return NextResponse.json({ error: 'Title and description required' }, { status: 400 });
  }

  const { data: enhancement, error } = await supabase
    .from('craiverse_enhancements')
    .insert({
      title,
      description,
      category: category || 'feature',
      target_app,
      author_id: user.id,
      status: 'submitted',
      upvote_count: 1, // Auto-upvote by creator
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Add creator's vote
  await supabase.from('craiverse_enhancement_votes').insert({
    enhancement_id: enhancement.id,
    user_id: user.id,
    vote: 1,
  });

  return NextResponse.json({ success: true, enhancement });
}
