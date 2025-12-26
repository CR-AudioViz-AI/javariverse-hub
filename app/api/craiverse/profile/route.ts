import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/craiverse/profile - Get current user profile
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  // Get profile
  const { data: profile } = await supabase
    .from('craiverse_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Get credits
  const { data: credits } = await supabase
    .from('craiverse_credits')
    .select('balance, bonus_balance')
    .eq('user_id', user.id)
    .single();

  // Get subscription
  const { data: subscription } = await supabase
    .from('craiverse_subscriptions')
    .select('plan, status, current_period_end')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  return NextResponse.json({
    id: user.id,
    email: user.email,
    display_name: profile?.display_name || user.user_metadata?.display_name,
    avatar_url: profile?.avatar_url,
    xp: profile?.xp || 0,
    level: profile?.level || 1,
    credits: {
      balance: credits?.balance || 0,
      bonus: credits?.bonus_balance || 0,
      total: (credits?.balance || 0) + (credits?.bonus_balance || 0),
    },
    subscription: subscription ? {
      plan: subscription.plan,
      status: subscription.status,
      expires: subscription.current_period_end,
    } : { plan: 'free', status: 'active' },
    created_at: profile?.created_at || user.created_at,
  });
}

// PATCH /api/craiverse/profile - Update profile
export async function PATCH(request: NextRequest) {
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
  const allowedFields = ['display_name', 'avatar_url', 'bio', 'theme', 'timezone', 'notification_preferences'];
  
  const updates: Record<string, any> = { updated_at: new Date().toISOString() };
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  }

  const { error: updateError } = await supabase
    .from('craiverse_profiles')
    .upsert({ id: user.id, email: user.email!, ...updates }, { onConflict: 'id' });

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, updated: Object.keys(updates) });
}
