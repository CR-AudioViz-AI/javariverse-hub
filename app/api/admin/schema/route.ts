import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { db: { schema: "public" } }
);

// This endpoint creates the CRAIverse schema
// Run once, then disable
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  
  // Simple auth check - must provide admin secret
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sql } = await req.json();
    
    if (!sql) {
      return NextResponse.json({ error: "No SQL provided" }, { status: 400 });
    }

    // Execute raw SQL using Supabase
    const { data, error } = await supabaseAdmin.rpc("exec_sql", { query: sql });

    if (error) {
      // If exec_sql doesnt exist, try creating individual tables
      return NextResponse.json({ 
        error: error.message,
        hint: "Run schema in Supabase SQL Editor first"
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  // Check what CRAIverse tables exist
  const tables = [
    "craiverse_profiles",
    "craiverse_credits", 
    "craiverse_subscriptions",
    "craiverse_tickets",
    "craiverse_knowledge_articles",
    "craiverse_forum_threads",
    "craiverse_enhancements",
    "craiverse_apps"
  ];

  const status: Record<string, boolean> = {};

  for (const table of tables) {
    const { error } = await supabaseAdmin.from(table).select("id").limit(1);
    status[table] = !error;
  }

  const existing = Object.values(status).filter(Boolean).length;

  return NextResponse.json({
    message: `${existing}/${tables.length} CRAIverse tables exist`,
    tables: status,
    schemaReady: existing === tables.length,
  });
}

export const dynamic = "force-dynamic";
