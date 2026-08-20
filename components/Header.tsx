"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { HandHeart, Plus, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type AuthedUser = { label: string; avatarUrl: string | null };

export default function Header() {
  const [user, setUser] = useState<AuthedUser | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const toUser = (
      u: { email?: string | null; phone?: string | null; user_metadata?: Record<string, unknown> } | null | undefined
    ): AuthedUser | null => {
      if (!u) return null;
      const label = u.email?.split("@")[0] ?? u.phone ?? "Profil";
      const avatarUrl = (u.user_metadata?.avatar_url as string | undefined) ?? null;
      return { label, avatarUrl };
    };

    supabase.auth.getUser().then(({ data }) => setUser(toUser(data.user)));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toUser(session?.user));
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-cream-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-900">
              <HandHeart size={17} color="white" />
            </span>
            <span className="font-display text-xl font-semibold text-teal-900">Saxovat</span>
          </Link>
          <nav className="hidden gap-5 sm:flex">
            <Link href="/katalog" className="text-sm font-semibold text-ink-soft hover:text-teal-900">Katalog</Link>
            <Link href="/elon/yangi" className="text-sm font-semibold text-ink-soft hover:text-teal-900">E'lon joylash</Link>
            <Link href="/profil" className="text-sm font-semibold text-ink-soft hover:text-teal-900">Mening sahifam</Link>
          </nav>
        </div>
        <div className="flex items-center gap-2.5">
          {user ? (
            <Link href="/profil" className="btn-outline">
              {user.avatarUrl ? (
                <span className="relative -ml-1 h-5 w-5 overflow-hidden rounded-full">
                  <Image src={user.avatarUrl} alt="" fill className="object-cover" />
                </span>
              ) : (
                <User size={16} />
              )}
              {user.label}
            </Link>
          ) : (
            <Link href="/kirish" className="btn-outline">Kirish</Link>
          )}
          <Link href="/elon/yangi" className="btn-primary">
            <Plus size={16} /> E'lon berish
          </Link>
        </div>
      </div>
    </header>
  );
}
