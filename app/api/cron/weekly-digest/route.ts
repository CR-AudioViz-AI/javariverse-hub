import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { emailTemplates, sendEmail } from "@/lib/email-templates";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/cron/weekly-digest - Send weekly activity digest (Sundays)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Get active users with activity
    const { data: users, error } = await supabase
      .from("craiverse_profiles")
      .select("id, email, display_name")
      .eq("status", "active")
      .not("email", "is", null);

    if (error) throw error;

    let sent = 0;
    for (const user of users || []) {
      // Get credit usage this week
      const { data: creditTxs } = await supabase
        .from("craiverse_credit_transactions")
        .select("amount, source_app")
        .eq("user_id", user.id)
        .eq("type", "spend")
        .gte("created_at", oneWeekAgo.toISOString());

      // Skip if no activity
      if (!creditTxs?.length) continue;

      const creditsUsed = creditTxs.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      
      // Count unique apps
      const appUsage: Record<string, number> = {};
      for (const tx of creditTxs) {
        if (tx.source_app) {
          appUsage[tx.source_app] = (appUsage[tx.source_app] || 0) + 1;
        }
      }
      
      const appsUsed = Object.keys(appUsage).length;
      const topApp = Object.entries(appUsage).sort((a, b) => b[1] - a[1])[0]?.[0] || "CRAIverse";

      const template = emailTemplates.weeklyDigest(
        user.display_name || "there",
        { creditsUsed, appsUsed, topApp }
      );

      const result = await sendEmail(user.email, template);
      if (result.success) sent++;

      // Rate limit
      await new Promise(r => setTimeout(r, 100));
    }

    return NextResponse.json({ 
      success: true, 
      users_checked: users?.length || 0,
      digests_sent: sent 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
