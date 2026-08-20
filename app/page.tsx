import Link from "next/link";
import { ArrowRight, MapPin, User, ArrowLeftRight, HandHeart, Check, Sparkles } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";

const STEPS = [
  { icon: User, label: "Beruvchi" },
  { icon: ArrowLeftRight, label: "Saxovatda e'lon" },
  { icon: HandHeart, label: "So'rov va kelishuv" },
  { icon: Check, label: "Yangi egasida" },
];

export default function HomePage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-mint-100 via-cream-50 to-[#F6EBD6] px-5 py-16">
        <div className="mx-auto max-w-6xl">
          <span className="chip mb-5 cursor-default">
            <MapPin size={13} /> O'zbekiston &middot; 14 viloyat
          </span>
          <h1 className="max-w-2xl text-[clamp(34px,5.2vw,56px)] font-semibold leading-[1.08] text-teal-900">
            O'zbekiston bo'ylab yordam bering, ulashing va birga o'qing
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">
            Hududingizdagi mehribonlik uylari, kam ta'minlangan oilalar va boshqa
            insonlarga kerak bo'lmagan kitob, kiyim va o'quv materiallaringizni
            bepul ulashing.
          </p>
          <div className="mt-7 mb-12 flex flex-wrap gap-3">
            <Link href="/katalog" className="btn-primary">
              Katalogni ko'rish <ArrowRight size={16} />
            </Link>
            <Link href="/elon/yangi" className="btn-outline">Buyum ulashish</Link>
          </div>

          <div className="rounded-2xl border border-line bg-white p-6">
            <p className="mb-4 text-xs font-bold uppercase tracking-wide text-ink-soft">
              Har bir buyum shu yo'lni bosib o'tadi
            </p>
            <div className="flex items-center overflow-x-auto">
              {STEPS.map((s, i) => (
                <div key={s.label} className="flex items-center">
                  <div className="flex min-w-[100px] flex-col items-center gap-2">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-teal-700 text-teal-700">
                      <s.icon size={18} />
                    </div>
                    <span className="text-center text-xs font-semibold text-ink-soft">{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="mb-5 h-px w-8 border-t border-dashed border-line sm:w-16" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14">
        <h2 className="text-2xl font-semibold text-teal-900">Kategoriyalar bo'yicha</h2>
        <p className="mb-6 mt-1 text-ink-soft">Kerakli bo'limni tanlang va ulashilgan buyumlarni ko'ring</p>
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-6">
          {CATEGORIES.map((c) => (
            <Link key={c.id} href={`/katalog?cat=${c.id}`} className="card flex flex-col gap-3 p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint-100 text-teal-700 font-semibold">
                {c.label.charAt(0)}
              </span>
              <span className="text-sm font-semibold">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-teal-900 px-5 py-12">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-8">
          <div className="max-w-lg">
            <h3 className="text-2xl font-semibold text-white">
              Sizda kerak bo'lmagan narsa — kimgadir umid bo'lishi mumkin
            </h3>
            <p className="mt-2 text-[#CFE3DC]">
              Buyum joylashtirish bir necha daqiqa vaqt oladi va butunlay bepul.
            </p>
          </div>
          <Link href="/elon/yangi" className="btn bg-amber-500 text-teal-900">
            <Sparkles size={16} /> Hoziroq boshlash
          </Link>
        </div>
      </section>
    </div>
  );
}
