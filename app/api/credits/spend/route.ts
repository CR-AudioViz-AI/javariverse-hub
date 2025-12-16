import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_ORIGINS = [
  'https://cravbarrels.com',
  'https://cardverse.craudiovizai.com',
  'https://games.craudiovizai.com',
  'https://javariai.com',
  'http://localhost:3000',
]

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin') || ''
  const authHeader = request.headers.get('authorization')
  const appId = request.headers.get('x-app-id') || 'unknown'

  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Authorization required' }, { status: 401 })
  }

  const token = authHeader.substring(7)
  const supabase = createRouteHandlerClient({ cookies })

  // Verify token
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const { amount, description } = await request.json()

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }

  // Get current balance
  const { data: profile } = await supabase
    .from('profiles')
    .select('credits_balance')
    .eq('id', user.id)
    .single()

  if (!profile || profile.credits_balance < amount) {
    return NextResponse.json({ 
      error: 'Insufficient credits',
      required: amount,
      available: profile?.credits_balance || 0,
    }, { status: 402 })
  }

  // Deduct credits
  const newBalance = profile.credits_balance - amount

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ credits_balance: newBalance })
    .eq('id', user.id)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to deduct credits' }, { status: 500 })
  }

  // Record transaction
  await supabase.from('credit_transactions').insert({
    user_id: user.id,
    amount: -amount,
    transaction_type: 'spend',
    description: description || 'Credit usage',
    app_id: appId,
  })

  const response = NextResponse.json({
    success: true,
    remaining: newBalance,
    spent: amount,
  })

  if (ALLOWED_ORIGINS.some(o => origin.startsWith(o))) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }

  return response
}
