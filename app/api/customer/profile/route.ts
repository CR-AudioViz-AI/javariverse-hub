import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/customer/profile
export async function GET(req: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error } = await supabase
      .from("craiverse_profiles")
      .select("*")
      .eq("auth_user_id", user.id)
      .single();

    if (error) throw error;

    return NextResponse.json({
      profile: {
        ...profile,
        auth_email: user.email
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/customer/profile - Update profile
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
    
    // Allowed fields for user to update
    const allowedFields = [
      "display_name", 
      "avatar_url", 
      "bio", 
      "website", 
      "location",
      "timezone",
      "notification_preferences",
      "theme_preference"
    ];
    
    const updates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("craiverse_profiles")
      .update(updates)
      .eq("id", profile.id)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabaseAdmin.from("craiverse_activity_log").insert({
      user_id: profile.id,
      action: "profile_updated",
      entity_type: "profile",
      entity_id: profile.id,
      metadata: { fields_updated: Object.keys(updates) }
    });

    return NextResponse.json({ success: true, profile: data });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
