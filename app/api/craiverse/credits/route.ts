import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

  const { data: credits } = await supabase
    .from('craiverse_credits')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return NextResponse.json({
    user_id: user.id,
    balance: credits?.balance || 0,
    bonus_balance: credits?.bonus_balance || 0,
    total_available: (credits?.balance || 0) + (credits?.bonus_balance || 0),
    lifetime_earned: credits?.lifetime_earned || 0,
    lifetime_spent: credits?.lifetime_spent || 0,
  });
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
  const { amount, source_app, source_action, description } = body;

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }

  const { data: credits } = await supabase
    .from('craiverse_credits')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const currentBalance = credits?.balance || 0;
  const bonusBalance = credits?.bonus_balance || 0;
  const totalAvailable = currentBalance + bonusBalance;

  if (totalAvailable < amount) {
    return NextResponse.json({ 
      error: 'Insufficient credits',
      required: amount,
      available: totalAvailable,
    }, { status: 402 });
  }

  let deductFromBonus = Math.min(bonusBalance, amount);
  let deductFromRegular = amount - deductFromBonus;
  const newBonusBalance = bonusBalance - deductFromBonus;
  const newBalance = currentBalance - deductFromRegular;

  await supabase
    .from('craiverse_credits')
    .upsert({
      user_id: user.id,
      balance: newBalance,
      bonus_balance: newBonusBalance,
      lifetime_spent: (credits?.lifetime_spent || 0) + amount,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

  await supabase.from('craiverse_credit_transactions').insert({
    user_id: user.id,
    amount: -amount,
    balance_after: newBalance + newBonusBalance,
    type: 'spend',
    source_app,
    source_action,
    description,
  });

  return NextResponse.json({
    success: true,
    deducted: amount,
    new_balance: newBalance,
    new_bonus_balance: newBonusBalance,
    total_available: newBalance + newBonusBalance,
  });
}
