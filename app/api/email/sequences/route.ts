// Email Marketing Sequences API
// Timestamp: January 2, 2026 - 6:05 PM EST

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Email sequence templates
const EMAIL_SEQUENCES = {
  welcome: {
    name: 'Welcome Sequence',
    emails: [
      {
        delay_hours: 0,
        subject: 'Welcome to Javari Library! 🎉 Your 112 Free eBooks Await',
        template: 'welcome_1_access'
      },
      {
        delay_hours: 24,
        subject: 'Quick Start: 5 Must-Read eBooks for Your Goals',
        template: 'welcome_2_recommendations'
      },
      {
        delay_hours: 72,
        subject: 'Did you know? Convert any eBook to audiobook instantly',
        template: 'welcome_3_features'
      },
      {
        delay_hours: 168,
        subject: 'Unlock 88 more premium eBooks (special offer inside)',
        template: 'welcome_4_upgrade'
      }
    ]
  },
  subscriber_onboarding: {
    name: 'Subscriber Onboarding',
    emails: [
      {
        delay_hours: 0,
        subject: 'You\'re In! Here\'s how to get the most from your subscription',
        template: 'sub_1_welcome'
      },
      {
        delay_hours: 24,
        subject: 'Your first audiobook conversion is on us 🎧',
        template: 'sub_2_audiobook'
      },
      {
        delay_hours: 72,
        subject: 'Pro tip: How top users organize their library',
        template: 'sub_3_tips'
      },
      {
        delay_hours: 168,
        subject: 'New this week: 5 fresh eBooks just added',
        template: 'sub_4_new_content'
      }
    ]
  },
  abandoned_cart: {
    name: 'Abandoned Cart Recovery',
    emails: [
      {
        delay_hours: 1,
        subject: 'You left something behind...',
        template: 'cart_1_reminder'
      },
      {
        delay_hours: 24,
        subject: 'Still thinking it over? Here\'s what you\'re missing',
        template: 'cart_2_benefits'
      },
      {
        delay_hours: 72,
        subject: 'Last chance: Your cart expires in 24 hours',
        template: 'cart_3_urgency'
      }
    ]
  },
  win_back: {
    name: 'Win Back Campaign',
    emails: [
      {
        delay_hours: 0,
        subject: 'We miss you! 50+ new eBooks since you left',
        template: 'winback_1_updates'
      },
      {
        delay_hours: 168,
        subject: 'Special offer: Come back and save 20%',
        template: 'winback_2_offer'
      }
    ]
  },
  weekly_digest: {
    name: 'Weekly Digest',
    emails: [
      {
        delay_hours: 0,
        subject: 'This Week in Javari Library: New Releases & Top Picks',
        template: 'digest_weekly'
      }
    ]
  }
}

// GET - List sequences and subscriber stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'stats') {
      // Get email subscriber stats
      const { data: subscribers, error } = await supabase
        .from('email_subscribers')
        .select('status, sequence, created_at')

      if (error && error.code !== '42P01') throw error

      const stats = {
        total: subscribers?.length || 0,
        active: subscribers?.filter(s => s.status === 'active').length || 0,
        sequences: Object.keys(EMAIL_SEQUENCES).map(key => ({
          name: EMAIL_SEQUENCES[key as keyof typeof EMAIL_SEQUENCES].name,
          key,
          emails: EMAIL_SEQUENCES[key as keyof typeof EMAIL_SEQUENCES].emails.length
        }))
      }

      return NextResponse.json({ stats })
    }

    return NextResponse.json({ sequences: EMAIL_SEQUENCES })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Subscribe user to sequence
export async function POST(request: NextRequest) {
  try {
    const { email, sequence, source } = await request.json()

    if (!email || !sequence) {
      return NextResponse.json(
        { error: 'Missing email or sequence' },
        { status: 400 }
      )
    }

    if (!EMAIL_SEQUENCES[sequence as keyof typeof EMAIL_SEQUENCES]) {
      return NextResponse.json(
        { error: 'Invalid sequence' },
        { status: 400 }
      )
    }

    // Add to subscribers table
    const { data, error } = await supabase
      .from('email_subscribers')
      .upsert({
        email,
        sequence,
        source: source || 'website',
        status: 'active',
        current_email_index: 0,
        subscribed_at: new Date().toISOString()
      }, {
        onConflict: 'email,sequence'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      message: `Subscribed to ${EMAIL_SEQUENCES[sequence as keyof typeof EMAIL_SEQUENCES].name}` 
    })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
