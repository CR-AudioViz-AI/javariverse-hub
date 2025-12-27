import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

// GET /api/customer/dashboard - Get customer dashboard data
export async function GET(req: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get profile
    const { data: profile } = await supabase
      .from("craiverse_profiles")
      .select("*")
      .eq("auth_user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Parallel fetch all dashboard data
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const [credits, subscription, tickets, notifications, recentActivity, apps] = await Promise.all([
      // Credits
      adminSupabase.from("craiverse_credits")
        .select("balance, lifetime_earned, lifetime_spent")
        .eq("user_id", profile.id)
        .single(),
      
      // Active subscription
      adminSupabase.from("craiverse_subscriptions")
        .select(`
          id, status, current_period_start, current_period_end,
          craiverse_subscription_plans (id, name, price_monthly, credits_monthly, features)
        `)
        .eq("user_id", profile.id)
        .eq("status", "active")
        .single(),
      
      // Recent tickets
      adminSupabase.from("craiverse_tickets")
        .select("id, ticket_number, subject, status, priority, created_at")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(5),
      
      // Unread notifications
      adminSupabase.from("craiverse_notifications")
        .select("id, title, message, type, action_url, created_at")
        .eq("user_id", profile.id)
        .eq("is_read", false)
        .order("created_at", { ascending: false })
        .limit(10),
      
      // Recent activity
      adminSupabase.from("craiverse_activity_log")
        .select("id, action, entity_type, created_at, metadata")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(10),
      
      // Installed apps
      adminSupabase.from("craiverse_user_apps")
        .select(`
          id, installed_at, last_used_at,
          craiverse_apps (id, name, slug, icon_url, category)
        `)
        .eq("user_id", profile.id)
        .order("last_used_at", { ascending: false })
        .limit(6)
    ]);

    return NextResponse.json({
      profile: {
        id: profile.id,
        email: profile.email,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        created_at: profile.created_at
      },
      credits: credits.data || { balance: 0, lifetime_earned: 0, lifetime_spent: 0 },
      subscription: subscription.data || null,
      tickets: tickets.data || [],
      notifications: notifications.data || [],
      recent_activity: recentActivity.data || [],
      installed_apps: apps.data || []
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
