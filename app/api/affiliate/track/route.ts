import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Affiliate networks and commission rates
const AFFILIATE_NETWORKS = {
  disney: { name: "Disney", baseUrl: "disneyworld.disney.go.com", commission: 0.03 },
  universal: { name: "Universal", baseUrl: "universalorlando.com", commission: 0.04 },
  seaworld: { name: "SeaWorld", baseUrl: "seaworld.com", commission: 0.05 },
  hotels: { name: "Hotels.com", baseUrl: "hotels.com", commission: 0.06 },
  expedia: { name: "Expedia", baseUrl: "expedia.com", commission: 0.05 },
  viator: { name: "Viator", baseUrl: "viator.com", commission: 0.08 },
  getyourguide: { name: "GetYourGuide", baseUrl: "getyourguide.com", commission: 0.08 }
};

// POST /api/affiliate/track-click - Track affiliate link clicks
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      affiliate_network, 
      deal_id, 
      deal_name,
      user_id,
      session_id,
      referrer
    } = body;

    const network = AFFILIATE_NETWORKS[affiliate_network as keyof typeof AFFILIATE_NETWORKS];
    if (!network) {
      return NextResponse.json({ error: "Invalid affiliate network" }, { status: 400 });
    }

    // Generate tracking ID
    const trackingId = `CRV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Record click
    const { data, error } = await supabase
      .from("craiverse_affiliate_clicks")
      .insert({
        tracking_id: trackingId,
        affiliate_network,
        deal_id,
        deal_name,
        user_id: user_id || null,
        session_id,
        referrer,
        ip_country: req.headers.get("x-vercel-ip-country") || null,
        user_agent: req.headers.get("user-agent")?.substring(0, 500) || null
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      tracking_id: trackingId,
      click_id: data.id
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/affiliate/track-conversion - Track affiliate conversions (called by webhook)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { tracking_id, order_amount, commission_amount, order_id } = body;

    // Find the click
    const { data: click, error: clickError } = await supabase
      .from("craiverse_affiliate_clicks")
      .select("id, affiliate_network, user_id")
      .eq("tracking_id", tracking_id)
      .single();

    if (clickError || !click) {
      return NextResponse.json({ error: "Click not found" }, { status: 404 });
    }

    // Record conversion
    const { error: convError } = await supabase
      .from("craiverse_affiliate_conversions")
      .insert({
        click_id: click.id,
        affiliate_network: click.affiliate_network,
        order_id,
        order_amount,
        commission_amount,
        user_id: click.user_id,
        status: "pending"
      });

    if (convError) throw convError;

    // Record platform revenue
    await supabase.from("craiverse_platform_revenue").insert({
      source: `affiliate_${click.affiliate_network}`,
      amount: commission_amount,
      type: "affiliate_commission",
      metadata: { tracking_id, order_id }
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET /api/affiliate/stats - Get affiliate performance stats
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") || "30d";

  try {
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case "7d": startDate.setDate(now.getDate() - 7); break;
      case "30d": startDate.setDate(now.getDate() - 30); break;
      case "90d": startDate.setDate(now.getDate() - 90); break;
    }

    // Get clicks by network
    const { data: clicks } = await supabase
      .from("craiverse_affiliate_clicks")
      .select("affiliate_network, created_at")
      .gte("created_at", startDate.toISOString());

    // Get conversions
    const { data: conversions } = await supabase
      .from("craiverse_affiliate_conversions")
      .select("affiliate_network, order_amount, commission_amount, created_at")
      .gte("created_at", startDate.toISOString());

    // Aggregate stats
    const stats: Record<string, any> = {};
    
    for (const click of clicks || []) {
      const network = click.affiliate_network;
      if (!stats[network]) {
        stats[network] = { clicks: 0, conversions: 0, revenue: 0, commission: 0 };
      }
      stats[network].clicks++;
    }

    for (const conv of conversions || []) {
      const network = conv.affiliate_network;
      if (!stats[network]) {
        stats[network] = { clicks: 0, conversions: 0, revenue: 0, commission: 0 };
      }
      stats[network].conversions++;
      stats[network].revenue += conv.order_amount || 0;
      stats[network].commission += conv.commission_amount || 0;
    }

    const totalClicks = (clicks || []).length;
    const totalConversions = (conversions || []).length;
    const totalCommission = (conversions || []).reduce((sum, c) => sum + (c.commission_amount || 0), 0);

    return NextResponse.json({
      range,
      summary: {
        total_clicks: totalClicks,
        total_conversions: totalConversions,
        conversion_rate: totalClicks ? (totalConversions / totalClicks * 100).toFixed(2) : 0,
        total_commission: totalCommission / 100
      },
      by_network: stats
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
