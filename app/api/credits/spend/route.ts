// /app/api/credits/spend/route.ts
// Credits spending endpoint with ADMIN BYPASS
// Timestamp: January 3, 2026
// Roy & Cindy get FREE unlimited access

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { isAdmin, ADMIN_EMAILS } from '@/lib/admin-utils'

const ALLOWED_ORIGINS = [
  'https://craudiovizai.com',
  'https://cravbarrels.com',
  'https://cardverse.craudiovizai.com',
  'https://games.craudiovizai.com',
  'https://javariai.com',
  'https://javari-books.vercel.app',
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

  // ============================================
  // ADMIN BYPASS - Roy & Cindy get free access
  // ============================================
  if (isAdmin(user.email)) {
    console.log(`[ADMIN BYPASS] ${user.email} - skipping ${amount} credits for: ${description}`)
    
    // Record transaction as 0 for tracking (but don't deduct)
    await supabase.from('credit_transactions').insert({
      user_id: user.id,
      amount: 0,
      type: 'spend',
      description: `[ADMIN FREE] ${description}`,
      app_id: appId,
      metadata: { 
        original_amount: amount,
        admin_bypass: true,
        timestamp: new Date().toISOString()
      }
    })

    // Get current balance for response
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits_balance')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      success: true,
      admin_bypass: true,
      amount_charged: 0,
      original_amount: amount,
      remaining_balance: profile?.credits_balance || 999999,
      message: 'Admin bypass - no credits charged'
    })
  }
  // ============================================
  // END ADMIN BYPASS
  // ============================================

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
    type: 'spend',
    description: description || 'Credit usage',
    app_id: appId,
    metadata: {
      remaining_balance: newBalance,
      timestamp: new Date().toISOString()
    }
  })

  const response = NextResponse.json({
    success: true,
    amount_charged: amount,
    remaining_balance: newBalance
  })

  // CORS headers
  if (ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }

  return response
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || ''
  
  const response = new NextResponse(null, { status: 204 })
  
  if (ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-App-Id')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }
  
  return response
}
