import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/customer/notifications
export async function GET(req: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("craiverse_profiles")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unread") === "true";
    const limit = parseInt(searchParams.get("limit") || "50");

    let query = supabaseAdmin
      .from("craiverse_notifications")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (unreadOnly) {
      query = query.eq("is_read", false);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Get unread count
    const { count } = await supabaseAdmin
      .from("craiverse_notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .eq("is_read", false);

    return NextResponse.json({
      notifications: data,
      unread_count: count || 0
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/customer/notifications - Mark as read
export async function PATCH(req: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("craiverse_profiles")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const body = await req.json();
    const { notification_ids, mark_all_read } = body;

    if (mark_all_read) {
      await supabaseAdmin
        .from("craiverse_notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("user_id", profile.id)
        .eq("is_read", false);
    } else if (notification_ids?.length) {
      await supabaseAdmin
        .from("craiverse_notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("user_id", profile.id)
        .in("id", notification_ids);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
