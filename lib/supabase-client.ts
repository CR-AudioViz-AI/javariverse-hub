// ================================================================================
// SUPABASE CLIENT - Compatibility Export
// Re-exports from lib/supabase.ts for backwards compatibility
// ================================================================================

import { createClient } from "@supabase/supabase-js";

// Re-export from main supabase.ts
export { supabase, supabaseAdmin } from "./supabase";

// Browser client factory function
export function createSupabaseBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Alias for compatibility
export const createBrowserClient = createSupabaseBrowserClient;
