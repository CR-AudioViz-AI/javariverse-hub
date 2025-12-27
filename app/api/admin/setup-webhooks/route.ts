import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// This endpoint sets up payment webhooks
// Run ONCE after deployment, then disable
// GET /api/admin/setup-webhooks?secret=YOUR_ADMIN_SECRET

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: any = { stripe: null, paypal: null };

  // Setup Stripe Webhook
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2024-06-20",
    });

    // Check existing webhooks
    const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });
    const existingWebhook = webhooks.data.find(
      (w) => w.url === "https://craudiovizai.com/api/webhooks/stripe"
    );

    if (existingWebhook) {
      results.stripe = { status: "exists", id: existingWebhook.id };
    } else {
      // Create new webhook
      const webhook = await stripe.webhookEndpoints.create({
        url: "https://craudiovizai.com/api/webhooks/stripe",
        enabled_events: [
          "checkout.session.completed",
          "customer.subscription.created",
          "customer.subscription.updated",
          "customer.subscription.deleted",
          "invoice.paid",
          "invoice.payment_failed",
        ],
      });
      results.stripe = { 
        status: "created", 
        id: webhook.id,
        secret: webhook.secret // SAVE THIS!
      };
    }
  } catch (error: any) {
    results.stripe = { status: "error", message: error.message };
  }

  // Setup PayPal Webhook
  try {
    // Get PayPal access token
    const authResponse = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": "Basic " + Buffer.from(
          `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
        ).toString("base64"),
      },
      body: "grant_type=client_credentials",
    });

    const authData = await authResponse.json();
    
    if (!authData.access_token) {
      results.paypal = { status: "error", message: "Failed to get access token" };
    } else {
      // Check existing webhooks
      const webhooksResponse = await fetch(
        "https://api-m.paypal.com/v1/notifications/webhooks",
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authData.access_token}`,
          },
        }
      );
      
      const webhooksData = await webhooksResponse.json();
      const existingWebhook = webhooksData.webhooks?.find(
        (w: any) => w.url === "https://craudiovizai.com/api/webhooks/paypal"
      );

      if (existingWebhook) {
        results.paypal = { status: "exists", id: existingWebhook.id };
      } else {
        // Create new webhook
        const createResponse = await fetch(
          "https://api-m.paypal.com/v1/notifications/webhooks",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${authData.access_token}`,
            },
            body: JSON.stringify({
              url: "https://craudiovizai.com/api/webhooks/paypal",
              event_types: [
                { name: "PAYMENT.CAPTURE.COMPLETED" },
                { name: "BILLING.SUBSCRIPTION.ACTIVATED" },
                { name: "BILLING.SUBSCRIPTION.CANCELLED" },
                { name: "BILLING.SUBSCRIPTION.SUSPENDED" },
                { name: "BILLING.SUBSCRIPTION.PAYMENT.FAILED" },
              ],
            }),
          }
        );
        
        const createData = await createResponse.json();
        results.paypal = { 
          status: "created", 
          id: createData.id,
          webhookId: createData.id // Store this in PAYPAL_WEBHOOK_ID
        };
      }
    }
  } catch (error: any) {
    results.paypal = { status: "error", message: error.message };
  }

  return NextResponse.json({
    message: "Webhook setup complete",
    results,
    nextSteps: [
      "If Stripe webhook was created, save the secret to STRIPE_WEBHOOK_SECRET",
      "If PayPal webhook was created, save the ID to PAYPAL_WEBHOOK_ID",
    ],
  });
}

export const dynamic = "force-dynamic";
