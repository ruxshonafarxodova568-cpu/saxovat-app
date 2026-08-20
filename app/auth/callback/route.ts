import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Supabase magic link foydalanuvchini shu manzilga qaytaradi (?code=...).
// Kodni sessiyaga almashtiramiz va bosh sahifaga yo'naltiramiz.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/profil";

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
