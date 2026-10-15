import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import type { Item } from "@/lib/types";
import { categoryLabel } from "@/lib/constants";

export default function ItemCard({ item }: { item: Item }) {
  return (
    <Link href={`/katalog/${item.id}`} className="card block">
      <div className="relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-mint-100 to-[#F4EEDD]">
        {item.image_url ? (
          <Image src={item.image_url} alt={item.title} fill className="object-cover" />
        ) : (
          <span className="text-sm font-semibold text-teal-700">{categoryLabel(item.category)}</span>
        )}
      </div>
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          {Number(item.price) > 0 ? (
            <span className="font-semibold text-teal-600 text-sm">
              {Number(item.price).toLocaleString()} UZS
            </span>
          ) : (
            <span className="badge-free">BEPUL</span>
          )}
          <span className="text-xs text-ink-soft">{item.condition}</span>
        </div>
        <h4 className="line-clamp-2 text-[15px] font-semibold leading-snug">{item.title}</h4>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-ink-soft">
          <MapPin size={12} /> {item.region}
        </div>
      </div>
    </Link>
  );
}
