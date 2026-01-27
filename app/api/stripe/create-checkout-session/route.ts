// /app/api/stripe/create-checkout-session/route.ts
// Stripe Checkout Session API - CR AudioViz AI
// Timestamp: January 1, 2026 - 6:16 PM EST

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import {
  NO_REFUND_POLICY,
  buildNoRefundMetadata
} from '@/lib/payments/no-refund-policy';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { priceId, mode, successUrl, cancelUrl, customerId, metadata } = body;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: mode || 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      consent_collection: {
        terms_of_service: 'required'
      },
      custom_text: {
        submit: {
          message: NO_REFUND_POLICY.CONSENT_MESSAGE
        }
      },
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/checkout?cancelled=true`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      metadata: {
        source: 'craudiovizai',
        ...metadata,
        ...buildNoRefundMetadata()
      },
    };

    // Add customer if provided
    if (customerId) {
      sessionParams.customer = customerId;
    }

    // Add subscription-specific options
    if (mode === 'subscription') {
      sessionParams.subscription_data = {
        trial_period_days: undefined, // Set to 7 for free trial
        metadata: {
          source: 'craudiovizai',
          ...buildNoRefundMetadata()
        },
      };
    }

    // Add payment intent metadata for one-time payments
    if (mode === 'payment') {
      sessionParams.payment_intent_data = {
        metadata: {
          ...buildNoRefundMetadata()
        }
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('[Stripe Checkout] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
