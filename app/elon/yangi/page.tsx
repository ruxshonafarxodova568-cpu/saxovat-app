"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, VILOYATLAR, HOLAT } from "@/lib/constants";

export default function YangiElonPage() {
  const supabase = createClient();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [form, setForm] = useState({
    title: "",
    category: "kitob",
    condition: "Yaxshi",
    region: VILOYATLAR[0],
    description: "",
    price_type: "free",
    price_amount: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, [supabase]);

  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);
    setError(null);

    let image_url: string | null = null;
    if (file) {
      const path = `${userId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("item-images").upload(path, file);
      if (uploadError) {
        setError(`Rasm yuklashda xatolik: ${uploadError.message}`);
        setLoading(false);
        return;
      }
      image_url = supabase.storage.from("item-images").getPublicUrl(path).data.publicUrl;
    }

        const { error: insertError } = await supabase.from("items").insert({
      owner_id: userId,
      title: form.title,
      description: form.description,
      category: form.category,
      condition: form.condition,
      region: form.region,
      image_url,
      price_type: form.price_type,                                              // Add this line
      price_amount: form.price_type === "custom" ? Number(form.price_amount) : 0, // Add this line (saves as clean number)
    });

    setLoading(false);
    if (insertError) setError(insertError.message);
    else setDone(true);
  };

  if (userId === null) {
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center">
        <p className="mb-4 text-ink-soft">E'lon joylash uchun avval tizimga kiring.</p>
        <Link href="/kirish" className="btn-primary">Kirish</Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-mint-100">
          <Check size={26} className="text-teal-700" />
        </span>
        <h2 className="text-2xl font-semibold text-teal-900">E'lon joylandi!</h2>
        <p className="mt-2.5 mb-6 text-ink-soft">
          Buyumingiz katalogga qo'shildi. Kimdir qiziqsa, sizga so'rov keladi.
        </p>
        <div className="flex justify-center gap-2.5">
          <Link href="/katalog" className="btn-outline">Katalogni ko'rish</Link>
          <Link href="/profil" className="btn-primary">Mening sahifam</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-9">
      <h1 className="text-2xl font-semibold text-teal-900">Buyum ulashish</h1>
      <p className="mt-1.5 mb-7 text-ink-soft">
        Kerak bo'lmagan kitob, kiyim yoki o'quv materialingizni shu yerda e'lon qiling — butunlay bepul.
      </p>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <label className="field-label">Buyum nomi</label>
          <input required placeholder="Masalan: 7-sinf ona tili darsligi" className="field" value={form.title} onChange={upd("title")} />
        </div>
        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label className="field-label">Kategoriya</label>
            <select className="field" value={form.category} onChange={upd("category")}>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Holati</label>
            <select className="field" value={form.condition} onChange={upd("condition")}>
              {HOLAT.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="field-label">Viloyat</label>
          <select className="field" value={form.region} onChange={upd("region")}>
            {VILOYATLAR.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
  <label className="field-label">Narxi</label>
  <div className="flex gap-4">
    <select 
      className="field" 
      value={form.price_type} 
      onChange={upd("price_type")}
    >
      <option value="free">Bepul (Free)</option>
      <option value="custom">Narxini kiritish (Set price)</option>
      <option value="negotiable">Kelishilgan narxda (Negotiable)</option>
    </select>

    {form.price_type === "custom" && (
      <input
        type="number"
        className="field"
        placeholder="Narxini kiriting (UZS)"
        required
        value={form.price_amount}
        onChange={upd("price_amount")}
        min="0"
      />
    )}
  </div>
</div>
        <div>
          <label className="field-label">Tavsif</label>
          <textarea required rows={4} className="field resize-none" placeholder="Buyum haqida qisqacha yozing" value={form.description} onChange={upd("description")} />
        </div>
        <div>
          <label className="field-label">Rasm (ixtiyoriy)</label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="field" />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary justify-center disabled:opacity-60">
          {loading ? "Joylanmoqda..." : "E'lonni joylash"} <ArrowRight size={16} />
        </button>
      </form>
    </div>
  );
}
