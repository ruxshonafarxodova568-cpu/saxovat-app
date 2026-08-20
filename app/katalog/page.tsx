import Link from "next/link";
import { Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES, VILOYATLAR } from "@/lib/constants";
import ItemCard from "@/components/ItemCard";
import type { Item } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function KatalogPage({
  searchParams,
}: {
  searchParams: { cat?: string; viloyat?: string; q?: string };
}) {
  const supabase = createClient();
  const { cat, viloyat, q } = searchParams;

  let query = supabase
    .from("items")
    .select("*")
    .eq("status", "faol")
    .order("created_at", { ascending: false });

  if (cat) query = query.eq("category", cat);
  if (viloyat) query = query.eq("region", viloyat);
  if (q) query = query.ilike("title", `%${q}%`);

  const { data: items, error } = await query.returns<Item[]>();

  const mk = (params: Record<string, string | undefined>) => {
    const usp = new URLSearchParams();
    Object.entries({ cat, viloyat, q, ...params }).forEach(([k, v]) => {
      if (v) usp.set(k, v);
    });
    return `/katalog?${usp.toString()}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-9">
      <form className="mb-5 flex items-center gap-2.5" action="/katalog">
        {cat && <input type="hidden" name="cat" value={cat} />}
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-3 text-ink-soft" />
          <input name="q" defaultValue={q} placeholder="Buyum nomini qidiring..." className="field pl-9" />
        </div>
        <select name="viloyat" defaultValue={viloyat ?? ""} className="field w-52">
          <option value="">Barcha viloyatlar</option>
          {VILOYATLAR.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </form>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1.5">
        <Link href={mk({ cat: undefined })} className={!cat ? "chip-active" : "chip"}>Barchasi</Link>
        {CATEGORIES.map((c) => (
          <Link key={c.id} href={mk({ cat: c.id })} className={cat === c.id ? "chip-active" : "chip"}>
            {c.label}
          </Link>
        ))}
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Ma'lumotlarni yuklashda xatolik: {error.message}. Supabase ulanish sozlamalarini tekshiring.
        </p>
      )}

      {!error && (
        <>
          <p className="mb-4 text-sm text-ink-soft">{items?.length ?? 0} ta e'lon topildi</p>
          {items && items.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((it) => (
                <ItemCard key={it.id} item={it} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-line px-5 py-14 text-center">
              <p className="font-semibold">Hech narsa topilmadi</p>
              <p className="mt-1.5 text-sm text-ink-soft">
                Filtrlarni o'zgartirib ko'ring yoki birinchi bo'lib e'lon joylang.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
