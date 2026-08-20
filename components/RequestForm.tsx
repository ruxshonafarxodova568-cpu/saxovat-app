"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Check, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RequestForm({ itemId, ownerId }: { itemId: string; ownerId: string }) {
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [msg, setMsg] = useState("Assalomu alaykum! Ushbu buyum hali mavjudmi?");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, [supabase]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);
    setError(null);
    const { error } = await supabase.from("requests").insert({
      item_id: itemId,
      requester_id: userId,
      message: msg,
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  };

  if (userId === undefined) return null;

  if (userId === null) {
    return (
      <Link href="/kirish" className="btn-primary w-full justify-center">
        So'rov yuborish uchun kiring
      </Link>
    );
  }

  if (userId === ownerId) {
    return <p className="text-sm text-ink-soft">Bu sizning e'loningiz.</p>;
  }

  if (sent) {
    return (
      <div className="flex items-start gap-2.5 rounded-2xl bg-mint-100 p-4">
        <Check size={18} className="mt-0.5 shrink-0 text-teal-700" />
        <div>
          <p className="text-[14.5px] font-semibold">So'rovingiz yuborildi</p>
          <p className="mt-0.5 text-[13px] text-ink-soft">
            Javob kelganda "Mening sahifam" bo'limida ko'rasiz.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <label className="field-label">Egasiga xabar</label>
      <textarea rows={3} value={msg} onChange={(e) => setMsg(e.target.value)} className="field resize-none" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary w-full justify-center disabled:opacity-60">
        <Send size={16} /> {loading ? "Yuborilmoqda..." : "So'rov yuborish"}
      </button>
    </form>
  );
}
