import Link from "next/link";
import Image from "next/image";
import { User } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { categoryLabel } from "@/lib/constants";
import type { Item, ItemRequest } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/kirish");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  const { data: myListings } = await supabase
    .from("items")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .returns<Item[]>();

  const { data: myRequests } = await supabase
    .from("requests")
    .select("*, items ( title, image_url )")
    .eq("requester_id", user.id)
    .order("created_at", { ascending: false })
    .returns<ItemRequest[]>();

  return (
    <div className="mx-auto max-w-3xl px-5 py-9">
      <div className="mb-7 flex items-center gap-3.5">
        <span className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-teal-900">
          {profile?.avatar_url ? (
            <Image src={profile.avatar_url} alt="" fill className="object-cover" />
          ) : (
            <User size={24} color="white" />
          )}
        </span>
        <div>
          <p className="text-[17px] font-semibold">{profile?.full_name ?? "Foydalanuvchi"}</p>
          <p className="text-sm text-ink-soft">{user.email ?? user.phone}</p>
        </div>
      </div>

      <section className="mb-9">
        <h2 className="mb-3.5 text-lg font-semibold text-teal-900">Mening e'lonlarim ({myListings?.length ?? 0})</h2>
        {myListings && myListings.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {myListings.map((it) => (
              <Link key={it.id} href={`/katalog/${it.id}`} className="flex items-center gap-3.5 rounded-2xl border border-line p-3 hover:border-teal-700">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-mint-100 text-xs font-bold text-teal-700">
                  {categoryLabel(it.category).charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14.5px] font-semibold">{it.title}</p>
                  <p className="text-xs text-ink-soft">{it.region}</p>
                </div>
                <span className="text-xs font-semibold capitalize text-amber-500">{it.status}</span>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState text="Hali e'lon joylamagansiz." cta="Birinchi e'lonni joylash" href="/elon/yangi" />
        )}
      </section>

      <section>
        <h2 className="mb-3.5 text-lg font-semibold text-teal-900">So'rovlarim ({myRequests?.length ?? 0})</h2>
        {myRequests && myRequests.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {myRequests.map((r) => (
              <Link key={r.id} href={`/katalog/${r.item_id}`} className="flex items-center gap-3.5 rounded-2xl border border-line p-3 hover:border-teal-700">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14.5px] font-semibold">{r.items?.title}</p>
                  <p className="text-xs text-ink-soft">{new Date(r.created_at).toLocaleDateString("uz-UZ")}</p>
                </div>
                <span className="text-xs font-semibold capitalize text-amber-500">{r.status.replace("_", " ")}</span>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState text="Hali hech kimga so'rov yubormagansiz." cta="Katalogni ko'rish" href="/katalog" />
        )}
      </section>
    </div>
  );
}

function EmptyState({ text, cta, href }: { text: string; cta: string; href: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line px-5 py-10 text-center">
      <p className="mb-4 text-ink-soft">{text}</p>
      <Link href={href} className="btn-primary">{cta}</Link>
    </div>
  );
}
