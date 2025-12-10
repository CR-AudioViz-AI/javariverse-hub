/**
 * CR AudioViz AI - Newsletter Subscription API
 * 
 * Handles email subscriptions with:
 * - Duplicate prevention
 * - Customer record creation/update
 * - Granular opt-in/out preferences
 * 
 * @timestamp Tuesday, December 10, 2024 - 12:35 AM EST
 * @author Claude (for Roy Henderson)
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase with service role for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(emailLower)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Check if customer already exists
    const { data: existingCustomer, error: fetchError } = await supabase
      .from('customers')
      .select('*')
      .eq('email', emailLower)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = "not found" which is fine
      console.error('Database fetch error:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Database error. Please try again.' },
        { status: 500 }
      );
    }

    if (existingCustomer) {
      // Customer exists - update their subscription timestamp
      const { error: updateError } = await supabase
        .from('customers')
        .update({
          newsletter_subscribed: true,
          opt_newsletter: true,
          opt_product_updates: true,
          opt_all: true,
          unsubscribed_at: null,
          updated_at: new Date().toISOString(),
          name: name || existingCustomer.name, // Update name if provided
        })
        .eq('email', emailLower);

      if (updateError) {
        console.error('Update error:', updateError);
        return NextResponse.json(
          { success: false, error: 'Failed to update subscription' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Welcome back! Your subscription has been reactivated.',
        isReturning: true,
      });
    }

    // New subscriber - create customer record
    const { error: insertError } = await supabase
      .from('customers')
      .insert({
        email: emailLower,
        name: name || null,
        customer_type: 'subscriber',
        
        // All communication preferences default to TRUE
        newsletter_subscribed: true,
        opt_newsletter: true,
        opt_product_updates: true,
        opt_social_messaging: true,
        opt_cross_sell: true,
        opt_new_features: true,
        opt_promotional: true,
        opt_all: true,
        
        // Tracking
        source: 'website_footer',
        subscribed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Insert error:', insertError);
      
      // Check for unique constraint violation
      if (insertError.code === '23505') {
        return NextResponse.json({
          success: true,
          message: 'You are already subscribed!',
          isReturning: true,
        });
      }
      
      return NextResponse.json(
        { success: false, error: 'Failed to subscribe. Please try again.' },
        { status: 500 }
      );
    }

    // TODO: Send welcome email via SendGrid/Resend
    // await sendWelcomeEmail(emailLower, name);

    return NextResponse.json({
      success: true,
      message: 'Thank you for subscribing! Stay tuned for updates.',
      isNew: true,
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// GET endpoint to check subscription status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json(
      { subscribed: false },
      { status: 200 }
    );
  }

  const { data, error } = await supabase
    .from('customers')
    .select('newsletter_subscribed, opt_all')
    .eq('email', email.toLowerCase())
    .single();

  if (error || !data) {
    return NextResponse.json({ subscribed: false });
  }

  return NextResponse.json({
    subscribed: data.newsletter_subscribed && data.opt_all,
  });
}
