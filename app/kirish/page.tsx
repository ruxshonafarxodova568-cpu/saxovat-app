"use client";

import { useState } from "react";
import { Mail, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.03l2.97-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .98 4.97l2.97 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
    </svg>
  );
}

export default function KirishPage() {
  const [googleLoading, setGoogleLoading] = useState(false);
  const supabase = createClient();

  const withGoogle = async () => {
    setGoogleLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    // Brauzer Google'ga yo'naltiradi, shuning uchun loadingni o'chirish shart emas
  };

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <h1 className="text-2xl font-semibold text-teal-900">Xush kelibsiz</h1>
      <p className="mt-2 text-ink-soft">Gmail hisobingiz bilan bir bosishda kiring — parol shart emas.</p>

      <button
        onClick={withGoogle}
        disabled={googleLoading}
        className="mt-7 flex w-full items-center justify-center gap-3 rounded-full border border-line bg-white py-3 text-sm font-semibold text-ink shadow-sm transition hover:border-teal-700 hover:shadow disabled:opacity-60"
      >
        <GoogleLogo />
        {googleLoading ? "Google'ga yo'naltirilmoqda..." : "Google orqali davom etish"}
      </button>

      <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">
        <span className="h-px flex-1 bg-line" /> yoki <span className="h-px flex-1 bg-line" />
      </div>

      <EmailLogin />
    </div>
  );
}

function EmailLogin() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  };

  if (sent) {
    return (
      <div className="flex items-start gap-3 rounded-2xl bg-mint-100 p-4">
        <Check size={18} className="mt-0.5 shrink-0 text-teal-700" />
        <div>
          <p className="font-semibold">Havola yuborildi</p>
          <p className="mt-1 text-sm text-ink-soft">{email} manziliga kirish havolasi yuborildi.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <label className="field-label">Email</label>
        <div className="relative">
          <Mail size={16} className="pointer-events-none absolute left-3.5 top-3 text-ink-soft" />
          <input
            type="email"
            required
            autoComplete="email"
            list="email-suggestions"
            placeholder="siz@gmail.com"
            className="field pl-9"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {/* Email yarim yozilganda @gmail.com kabi keng tarqalgan domenlarni tavsiya qiladi */}
          <datalist id="email-suggestions">
            {["gmail.com", "mail.ru", "yandex.com", "outlook.com"].map((domain) => {
              const name = email.split("@")[0];
              return name ? <option key={domain} value={`${name}@${domain}`} /> : null;
            })}
          </datalist>
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary justify-center disabled:opacity-60">
        {loading ? "Yuborilmoqda..." : "Kirish havolasini yuborish"}
      </button>
    </form>
  );
}
