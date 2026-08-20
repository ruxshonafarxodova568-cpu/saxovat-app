// supabase/functions/send-sms-hook/index.ts
//
// Bu funksiya Supabase Auth "Send SMS Hook" tomonidan chaqiriladi
// (foydalanuvchi telefon raqami bilan kirishga uringanda). Vazifasi:
// 1) Supabase yuborgan so'rovni imzo (signature) orqali tekshirish
// 2) Telefon raqami va OTP kodni ajratib olish
// 3) Eskiz.uz API orqali haqiqiy SMS yuborish
//
// Joylashtirish:
//   supabase functions deploy send-sms-hook --no-verify-jwt
//   supabase secrets set ESKIZ_EMAIL=sizning-emailingiz
//   supabase secrets set ESKIZ_PASSWORD=sizning-eskiz-parolingiz
//   supabase secrets set ESKIZ_FROM=4546
//   supabase secrets set SEND_SMS_HOOK_SECRET=<Dashboard bergan v1,whsec_... qiymat>
//
// Batafsil: README.md dagi "Telefon orqali kirish (Eskiz.uz)" bo'limi.

import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

const ESKIZ_BASE_URL = "https://notify.eskiz.uz/api";

// Funksiya sovuq ishga tushganda (cold start) tokenni xotirada saqlaymiz,
// shu bilan har bir SMS uchun qayta login qilishning oldini olamiz.
let cachedToken: string | null = null;

async function getEskizToken(forceRefresh = false): Promise<string> {
  if (cachedToken && !forceRefresh) return cachedToken;

  const email = Deno.env.get("ESKIZ_EMAIL");
  const password = Deno.env.get("ESKIZ_PASSWORD");
  if (!email || !password) {
    throw new Error("ESKIZ_EMAIL yoki ESKIZ_PASSWORD sozlanmagan (supabase secrets set orqali qo'shing)");
  }

  const res = await fetch(`${ESKIZ_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error(`Eskiz login xato: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const token = data?.data?.token;
  if (!token) throw new Error("Eskiz javobida token topilmadi");

  cachedToken = token;
  return token;
}

async function sendEskizSms(phone: string, message: string) {
  const from = Deno.env.get("ESKIZ_FROM") || "4546";
  // Eskiz raqamni "+" belgisisiz, 998 bilan kutadi
  const cleanPhone = phone.replace(/[^\d]/g, "");

  const doSend = async (token: string) =>
    fetch(`${ESKIZ_BASE_URL}/message/sms/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        mobile_phone: cleanPhone,
        message,
        from,
      }),
    });

  let token = await getEskizToken();
  let res = await doSend(token);

  // Token muddati tugagan bo'lsa, bir marta yangilab qayta urinamiz
  if (res.status === 401) {
    token = await getEskizToken(true);
    res = await doSend(token);
  }

  if (!res.ok) {
    throw new Error(`Eskiz SMS yuborishda xato: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

Deno.serve(async (req: Request) => {
  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);

  const secret = Deno.env.get("SEND_SMS_HOOK_SECRET");
  if (!secret) {
    return new Response(
      JSON.stringify({ error: { message: "SEND_SMS_HOOK_SECRET sozlanmagan" } }),
      { status: 500 }
    );
  }

  try {
    // Supabase Dashboard bergan maxfiy kalit "v1,whsec_..." formatida,
    // Webhook kutubxonasi esa faqat base64 qismini kutadi.
    const base64Secret = secret.replace("v1,whsec_", "");
    const wh = new Webhook(base64Secret);
    const { user, sms } = wh.verify(payload, headers) as {
      user: { phone: string };
      sms: { otp: string };
    };

    const message = `Saxovat: kirish kodingiz ${sms.otp}. Kodni hech kimga bermang.`;
    await sendEskizSms(user.phone, message);

    // Muvaffaqiyat — bo'sh 200 javob yetarli
    return new Response(null, { status: 200 });
  } catch (err) {
    console.error("send-sms-hook xatosi:", err);
    return new Response(
      JSON.stringify({
        error: {
          http_code: 500,
          message: err instanceof Error ? err.message : "Noma'lum xatolik",
        },
      }),
      { status: 500 }
    );
  }
});
