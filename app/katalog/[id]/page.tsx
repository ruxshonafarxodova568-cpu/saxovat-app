import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronLeft, MapPin, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { categoryLabel } from "@/lib/constants";
import RequestForm from "@/components/RequestForm";
import type { Item } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ItemDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: item } = await supabase
    .from("items")
    .select("*, profiles ( full_name )")
    .eq("id", params.id)
    .single<Item>();

  if (!item) notFound();

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      <Link href="/katalog" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700">
        <ChevronLeft size={16} /> Katalogga qaytish
      </Link>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative flex aspect-square items-center justify-center rounded-2xl border border-line bg-gradient-to-br from-mint-100 to-[#F4EEDD]">
          {item.image_url ? (
            <Image src={item.image_url} alt={item.title} fill className="rounded-2xl object-cover" />
          ) : (
            <span className="text-lg font-semibold text-teal-700">{categoryLabel(item.category)}</span>
          )}
        </div>
        <div>
          <span className="badge-free">BEPUL</span>
          <h1 className="mt-3 text-2xl font-semibold text-teal-900">{item.title}</h1>
          <div className="mt-2.5 flex flex-wrap gap-3.5 text-[13.5px] text-ink-soft">
            <span className="flex items-center gap-1.5"><MapPin size={14} /> {item.region}</span>
            <span>Holati: {item.condition}</span>
            <span>{new Date(item.created_at).toLocaleDateString("uz-UZ")}</span>
          </div>
          <p className="mt-5 leading-relaxed">{item.description}</p>

          <div className="my-5 flex items-center gap-3 rounded-xl border border-line p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-mint-100">
              <User size={18} className="text-teal-700" />
            </span>
            <div>
              <p className="text-[14.5px] font-semibold">{item.profiles?.full_name ?? "Foydalanuvchi"}</p>
              <p className="text-xs text-ink-soft">E'lon egasi</p>
            </div>
          </div>

          <RequestForm itemId={item.id} ownerId={item.owner_id} />
        </div>
      </div>
    </div>
  );
}
