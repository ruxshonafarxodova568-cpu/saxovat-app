import { createBrowserClient } from "@supabase/ssr";

// Klient komponentlarda (use client) ishlatiladigan Supabase mijozi.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
