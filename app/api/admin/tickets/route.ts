import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/admin/tickets - List tickets with filters
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const status = searchParams.get("status") || "";
  const priority = searchParams.get("priority") || "";
  const category = searchParams.get("category") || "";

  try {
    let query = supabase
      .from("craiverse_tickets")
      .select(`
        *,
        craiverse_profiles!craiverse_tickets_user_id_fkey (
          id, email, display_name, avatar_url
        ),
        assigned_to:craiverse_profiles!craiverse_tickets_assigned_to_fkey (
          id, email, display_name
        )
      `, { count: "exact" });

    if (status) query = query.eq("status", status);
    if (priority) query = query.eq("priority", priority);
    if (category) query = query.eq("category", category);

    const from = (page - 1) * limit;
    query = query
      .order("created_at", { ascending: false })
      .range(from, from + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      tickets: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/admin/tickets - Update ticket
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticket_id, updates, admin_id } = body;

    const allowedFields = ["status", "priority", "assigned_to", "internal_notes"];
    const safeUpdates: Record<string, any> = {};
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        safeUpdates[field] = updates[field];
      }
    }

    // Track status changes
    if (updates.status) {
      if (updates.status === "in_progress" && !safeUpdates.first_response_at) {
        safeUpdates.first_response_at = new Date().toISOString();
      }
      if (updates.status === "resolved") {
        safeUpdates.resolved_at = new Date().toISOString();
      }
    }

    const { data, error } = await supabase
      .from("craiverse_tickets")
      .update({ ...safeUpdates, updated_at: new Date().toISOString() })
      .eq("id", ticket_id)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from("craiverse_activity_log").insert({
      user_id: admin_id,
      action: "ticket_updated",
      entity_type: "ticket",
      entity_id: ticket_id,
      metadata: { updates: safeUpdates }
    });

    return NextResponse.json({ success: true, ticket: data });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
