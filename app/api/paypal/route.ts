// app/api/paypal/route.ts
// PayPal API main entry point
// Timestamp: Dec 28, 2025

import { NextRequest, NextResponse } from "next/server";

// Redirect GET requests to documentation
export async function GET() {
  return NextResponse.json({
    message: "PayPal API",
    endpoints: {
      orders: "/api/paypal/orders (POST - create/capture orders)",
      subscriptions: "/api/paypal/subscriptions (POST - manage subscriptions)",
      webhook: "/api/paypal/webhook (POST - PayPal webhooks)"
    },
    status: "active"
  });
}

// Handle POST to main paypal endpoint - forward to orders
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // If this is an order request, redirect to orders endpoint
    return NextResponse.json({
      error: "Please use specific endpoints",
      endpoints: {
        createOrder: "/api/paypal/orders",
        captureOrder: "/api/paypal/orders", 
        subscriptions: "/api/paypal/subscriptions"
      }
    }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

