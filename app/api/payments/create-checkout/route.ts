// /api/payments/create-checkout/route.ts
// Stripe Checkout Session Creation - CR AudioViz AI
// Handles subscriptions and one-time credit purchases
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
});

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kteobfyferrukqeolofj.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://craudiovizai.com';

// =============================================================================
// PRICE MAPPING
// =============================================================================

// Map our tier IDs to Stripe price IDs
// These should be created in Stripe Dashboard
const SUBSCRIPTION_PRICES: Record<string, { monthly: string; yearly: string }> = {
  starter: {
    monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY || 'price_starter_monthly',
    yearly: process.env.STRIPE_PRICE_STARTER_YEARLY || 'price_starter_yearly'
  },
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
    yearly: process.env.STRIPE_PRICE_PRO_YEARLY || 'price_pro_yearly'
  },
  business: {
    monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY || 'price_business_monthly',
    yearly: process.env.STRIPE_PRICE_BUSINESS_YEARLY || 'price_business_yearly'
  }
};

// Credit packages with prices
const CREDIT_PRODUCTS: Record<string, { credits: number; price: number; stripePriceId?: string }> = {
  credits_100: { credits: 100, price: 500 }, // $5.00 in cents
  credits_500: { credits: 550, price: 2000 }, // 500 + 50 bonus
  credits_1000: { credits: 1150, price: 3500 }, // 1000 + 150 bonus
  credits_5000: { credits: 6000, price: 15000 }, // 5000 + 1000 bonus
  credits_10000: { credits: 12500, price: 25000 } // 10000 + 2500 bonus
};

// =============================================================================
// CHECKOUT SESSION CREATION
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      mode, // 'subscription' or 'payment'
      tierId, // For subscriptions: 'starter', 'pro', 'business'
      billingCycle, // 'monthly' or 'yearly'
      productId, // For one-time: 'credits_100', etc.
      userId,
      email,
      successUrl,
      cancelUrl
    } = body;

    // Validate required fields
    if (!mode) {
      return NextResponse.json({ error: 'mode is required' }, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Get or create Stripe customer
    let customerId: string | undefined;
    
    if (userId) {
      // Check if user already has a Stripe customer ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id, email')
        .eq('id', userId)
        .single();
      
      if (profile?.stripe_customer_id) {
        customerId = profile.stripe_customer_id;
      } else {
        // Create new Stripe customer
        const customer = await stripe.customers.create({
          email: profile?.email || email,
          metadata: {
            userId,
            platform: 'javari'
          }
        });
        
        // Save customer ID to profile
        await supabase
          .from('profiles')
          .update({ stripe_customer_id: customer.id })
          .eq('id', userId);
        
        customerId = customer.id;
      }
    }

    // Build checkout session parameters
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: mode === 'subscription' ? 'subscription' : 'payment',
      success_url: successUrl || `${BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${BASE_URL}/pricing`,
      customer: customerId,
      customer_email: !customerId ? email : undefined,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      metadata: {
        userId: userId || '',
        mode,
        platform: 'javari'
      }
    };

    // Handle subscription checkout
    if (mode === 'subscription') {
      if (!tierId || !billingCycle) {
        return NextResponse.json({ error: 'tierId and billingCycle required for subscriptions' }, { status: 400 });
      }

      const tierPrices = SUBSCRIPTION_PRICES[tierId];
      if (!tierPrices) {
        return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
      }

      const priceId = billingCycle === 'yearly' ? tierPrices.yearly : tierPrices.monthly;

      sessionParams.line_items = [{
        price: priceId,
        quantity: 1
      }];

      sessionParams.subscription_data = {
        trial_period_days: 7, // 7-day free trial
        metadata: {
          userId: userId || '',
          tierId,
          billingCycle
        }
      };

      sessionParams.metadata!.tierId = tierId;
      sessionParams.metadata!.billingCycle = billingCycle;
    }

    // Handle one-time credit purchase
    if (mode === 'payment') {
      if (!productId) {
        return NextResponse.json({ error: 'productId required for payments' }, { status: 400 });
      }

      const product = CREDIT_PRODUCTS[productId];
      if (!product) {
        return NextResponse.json({ error: 'Invalid product' }, { status: 400 });
      }

      sessionParams.line_items = [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${product.credits.toLocaleString()} Javari Credits`,
            description: 'Credits for AI interactions, creative tools, and premium features. Never expire.',
            images: [`${BASE_URL}/images/credits-icon.png`]
          },
          unit_amount: product.price
        },
        quantity: 1
      }];

      sessionParams.metadata!.productId = productId;
      sessionParams.metadata!.credits = String(product.credits);

      // Add payment intent data for one-time payments
      sessionParams.payment_intent_data = {
        metadata: {
          userId: userId || '',
          productId,
          credits: String(product.credits)
        }
      };
    }

    // Create the checkout session
    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    });

  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// =============================================================================
// GET - Retrieve session details
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'session_id required' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'payment_intent']
    });

    return NextResponse.json({
      status: session.status,
      paymentStatus: session.payment_status,
      customerEmail: session.customer_details?.email,
      amountTotal: session.amount_total,
      metadata: session.metadata
    });

  } catch (error: any) {
    console.error('Session retrieval error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
