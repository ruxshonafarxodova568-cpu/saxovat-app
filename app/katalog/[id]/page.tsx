import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, MapPin, User, Trash2 } from "lucide-react";
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

  // Get current logged-in user to check ownership
  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = item.owner_id === user?.id;

  // Server Action to handle the deletion securely
  async function deleteItem() {
    "use server";
    const supabaseClient = createClient();
    
        const { error } = await supabaseClient
      .from("items")
      .delete()
      .eq("id", item.id);

    if (!error) {
      redirect("/katalog");
    }
  }

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
          {(item as any).price_type === 'negotiable' ? (
            <span className="inline-block rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
              Kelishilgan
            </span>
          ) : Number((item as any).price_amount) > 0 ? (
            <span className="inline-block rounded-md bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-700 ring-1 ring-inset ring-teal-600/20">
              {Number((item as any).price_amount).toLocaleString()} UZS
            </span>
          ) : (
            <span className="badge-free">BEPUL</span>
          )}

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

          {/* If owner logs in, show Delete button. If another user logs in, show Request Form */}
          {isOwner ? (
            <form action={deleteItem} className="mt-4">
              <button 
                type="submit" 
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 border border-red-200 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 active:scale-[0.99]"
              >
                <Trash2 size={16} /> E'lonni o'chirish
              </button>
            </form>
          ) : (
            <RequestForm itemId={item.id} ownerId={item.owner_id} />
          )}
        </div>
      </div>
    </div>
  );
}
