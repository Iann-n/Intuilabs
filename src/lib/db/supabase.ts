import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

let supabase: ReturnType<typeof createClient<Database>>;
// This module implements a singleton factory that creates one strongly-typed Supabase client instance and reuses it everywhere, 
// ensuring TypeScript knows the exact database schema when performing queries.

export function getSupabase() {

  if (supabase) {
    return supabase;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  supabase = createClient<Database>(
    url,
    key
  );
  const test = supabase.from("cached_lessons");
  return supabase;
}

// Before:
// Supabase Client
//       ↓
// Unknown database structure
//       ↓
// TypeScript guesses

// After:
// Supabase Client<Database>
//       ↓
// Known database structure
//       ↓
// TypeScript knows every table, column, insert, update, and RPC