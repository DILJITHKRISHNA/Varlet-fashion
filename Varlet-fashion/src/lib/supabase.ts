import { createClient } from "@supabase/supabase-js";
import type { Database } from "./supabase.types";

// Public config — VITE_ prefix ships to the browser, matching the pattern
// documented in config.server.ts. Same local Supabase backend the mobile
// app (Varlet-app) talks to; see Varlet-app/supabase for schema/migrations.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Copy .env.example to .env.local and fill in the values from `npx supabase status` (run from Varlet-app)."
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
