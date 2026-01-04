// ================================================================================
// CR AUDIOVIZ AI - USER API ENDPOINT
// Get current user info
// ================================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({ 
        authenticated: false, 
        user: null,
        message: 'No authorization header' 
      }, { status: 200 }); // 200 not 401 - graceful handling
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = getSupabase();
    
    if (!supabase) {
      return NextResponse.json({ 
        authenticated: false,
        user: null,
        error: 'Database not configured' 
      }, { status: 200 });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return NextResponse.json({ 
        authenticated: false,
        user: null,
        error: 'Invalid or expired token' 
      }, { status: 200 });
    }

    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Get credits
    const { data: credits } = await supabase
      .from('credits')
      .select('balance, lifetime_earned, lifetime_spent')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        ...profile
      },
      credits: credits || { balance: 0, lifetime_earned: 0, lifetime_spent: 0 }
    });

  } catch (error: any) {
    console.error('User API error:', error);
    return NextResponse.json({ 
      authenticated: false,
      user: null,
      error: 'Internal server error' 
    }, { status: 200 }); // Graceful, not 500
  }
}
