import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/cron/check-low-credits - Runs daily via Vercel cron
export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find users with low credits (< 20% of their plan allocation)
    const { data: lowCreditUsers, error } = await supabase
      .from("craiverse_credits")
      .select(`
        id,
        user_id,
        balance,
        craiverse_profiles!inner (
          email,
          display_name
        ),
        craiverse_subscriptions!inner (
          plan_id,
          craiverse_subscription_plans (
            credits_monthly
          )
        )
      `)
      .lt("balance", 50); // Users with less than 50 credits

    if (error) throw error;

    let notificationsSent = 0;

    for (const user of lowCreditUsers || []) {
      const profile = user.craiverse_profiles as any;
      
      // Check if we already notified in last 7 days
      const { data: recentNotif } = await supabase
        .from("craiverse_notifications")
        .select("id")
        .eq("user_id", user.user_id)
        .eq("type", "low_credits")
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .limit(1);

      if (recentNotif?.length) continue; // Already notified

      // Create in-app notification
      await supabase.from("craiverse_notifications").insert({
        user_id: user.user_id,
        type: "low_credits",
        title: "Low Credit Balance",
        message: `You have ${user.balance} credits remaining. Top up now to avoid interruption.`,
        action_url: "/dashboard/credits",
        action_label: "Add Credits",
        source_app: "system",
        source_type: "cron"
      });

      // Send email
      if (profile?.email && process.env.RESEND_API_KEY) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: "CR AudioViz AI <noreply@craudiovizai.com>",
            to: profile.email,
            subject: `Low Credits Alert: ${user.balance} credits remaining`,
            html: `
              <h2>Your credits are running low!</h2>
              <p>Hi ${profile.display_name || "there"},</p>
              <p>You currently have <strong>${user.balance} credits</strong> remaining.</p>
              <p>To continue using our AI-powered features without interruption, add more credits now:</p>
              <p><a href="https://craudiovizai.com/dashboard/credits" style="background:#2563eb;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">Add Credits</a></p>
              <p>Or consider upgrading your plan for more monthly credits!</p>
            `
          })
        });
      }

      notificationsSent++;
    }

    return NextResponse.json({ 
      success: true, 
      users_checked: lowCreditUsers?.length || 0,
      notifications_sent: notificationsSent 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
