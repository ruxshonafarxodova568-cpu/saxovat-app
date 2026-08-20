# Saxovat — ishga tushirish qo'llanmasi

Bepul texnologiyalar: **Next.js** (Vercel'da bepul joylashtiriladi) + **Supabase**
(Postgres baza, autentifikatsiya va fayl saqlash — bepul tarif).

## 1. Supabase loyihasini yaratish

1. https://supabase.com ga kirib, bepul akkaunt oching, **New project** tugmasini bosing.
2. Loyiha yaratilgach, **Project Settings → API** bo'limiga o'ting va quyidagilarni nusxalab oling:
   - `Project URL`
   - `anon public` kaliti
3. **SQL Editor** bo'limini oching, `supabase/schema.sql` faylining butun mazmunini joylashtirib, **Run** bosing.
4. Xuddi shu tartibda `supabase/storage.sql` faylini ham ishga tushiring (rasm yuklash uchun bucket yaratadi).
5. **Authentication → Providers → Email** bo'limida "Confirm email" yoqilganligiga ishonch hosil qiling (standart holatda yoqilgan, bepul).
6. **Authentication → URL Configuration** bo'limida `Site URL`ni keyinchalik domeningiz bilan (masalan `https://saxovat.vercel.app`) to'ldirasiz.

## 2. Loyihani lokal ishga tushirish

```bash
npm install
cp .env.local.example .env.local
# .env.local faylini oching va Supabase URL/kalitni joylashtiring
npm run dev
```

Brauzerda `http://localhost:3000` ni oching.

## 3. Vercel'ga bepul deploy qilish

1. Loyihani GitHub'ga yuklang (`git init`, `git add .`, `git commit`, keyin repo yarating).
2. https://vercel.com ga GitHub akkaunt bilan kiring, **New Project** → repongizni tanlang.
3. **Environment Variables** bo'limiga `NEXT_PUBLIC_SUPABASE_URL` va `NEXT_PUBLIC_SUPABASE_ANON_KEY`ni qo'shing.
4. **Deploy** tugmasini bosing — bir necha daqiqada domen tayyor bo'ladi.
5. Shu domenni Supabase'dagi **Site URL** ga qaytib kiritib qo'ying (magic link to'g'ri ishlashi uchun).

## Loyiha tuzilishi

```
app/
  page.tsx                 — bosh sahifa
  katalog/page.tsx         — e'lonlar ro'yxati (filtr bilan)
  katalog/[id]/page.tsx    — e'lon tafsiloti + so'rov yuborish
  elon/yangi/page.tsx      — yangi e'lon joylash (rasm yuklash bilan)
  profil/page.tsx          — mening e'lonlarim / so'rovlarim
  kirish/page.tsx          — email orqali kirish (magic link)
  auth/callback/route.ts   — kirish havolasini qayta ishlash
components/                — qayta ishlatiladigan UI qismlari
lib/supabase/               — Supabase mijozlari (browser/server)
lib/constants.ts            — kategoriyalar, viloyatlar ro'yxati
supabase/schema.sql         — baza jadvallari + xavfsizlik qoidalari (RLS)
supabase/storage.sql        — rasm saqlash bucket sozlamalari
supabase/google_auth.sql    — Google orqali kirish uchun qo'shimcha SQL
supabase/phone_auth.sql     — telefon orqali kirish uchun qo'shimcha SQL (keyinroq)
supabase/functions/
  send-sms-hook/index.ts    — Eskiz.uz orqali OTP SMS yuboruvchi Edge Function
```

## Google (Gmail) orqali kirish

Kirish sahifasida "Google orqali davom etish" tugmasi bor — foydalanuvchi
bir bosishda, parolsiz kiradi/ro'yxatdan o'tadi. Bu butunlay bepul, faqat
Google tomonida bir martalik sozlash kerak.

### 1. Google Cloud Console'da OAuth ma'lumotlarini olish

1. https://console.cloud.google.com/ ga kiring, yangi loyiha yarating (yoki mavjudini tanlang).
2. **APIs & Services → OAuth consent screen** bo'limida so'rovnomani to'ldiring:
   - User type: **External**
   - App name: `Saxovat`, qo'llab-quvvatlash emaili — o'zingiznikini yozing.
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**
   - **Authorized redirect URIs** ga quyidagini qo'shing (Supabase Dashboard'dagi
     Authentication → Providers → Google sahifasida tayyor holda ko'rsatiladi):
     `https://<project-ref>.supabase.co/auth/v1/callback`
4. Yaratilgach, **Client ID** va **Client Secret** chiqadi — ularni nusxalab oling.

### 2. Supabase Dashboard'da yoqish

1. **Authentication → Providers → Google**ni oching.
2. Google'dan olingan **Client ID** va **Client Secret**ni joylashtiring.
3. **Save** bosing — boshqa hech narsa sozlash shart emas.

### 3. SQL o'zgarishi

`supabase/google_auth.sql` faylini SQL Editor'da ishga tushiring — bu
`profiles` jadvaliga `avatar_url` ustunini qo'shadi va ro'yxatdan o'tish
trigerini yangilaydi, shunda Google orqali kirgan foydalanuvchining ismi
va profil rasmi avtomatik saqlanadi.

**Eslatma:** Google OAuth consent screen "Testing" holatida bo'lsa, faqat
siz qo'shgan test foydalanuvchilar kira oladi. Hammaga ochish uchun
Google Cloud Console'da **Publish App** bosishingiz kerak bo'ladi
(bu tekshiruvdan o'tkazish talab qilmaydigan, oddiy loyihalar uchun tez jarayon).

## Telefon orqali kirish (Eskiz.uz)

Kirish sahifasida endi "Telefon raqami" va "Email" ikkala variant ham bor.
Telefon orqali OTP yuborish uchun Supabase'ning "Send SMS Hook" mexanizmi
Eskiz.uz'ga ulangan — bu quyidagi qadamlarni talab qiladi.

### 1. Eskiz.uz akkaunti

1. https://eskiz.uz/ da ro'yxatdan o'ting, SMS xizmatini yoqing (email + parol beriladi).
2. "Alfa nom" (jo'natuvchi nomi, masalan `4546` — standart test raqami, real ishlatish uchun o'z nomingizni tasdiqlatishingiz kerak bo'ladi) oling.

### 2. Supabase CLI o'rnatish va loyihaga ulanish

```bash
npm install -g supabase
supabase login
supabase link --project-ref <sizning-project-ref>
```

`<sizning-project-ref>` — Supabase loyihangiz URL manzilidagi `xxxxxxxx` qismi.

### 3. Edge Function'ni joylashtirish

```bash
supabase functions deploy send-sms-hook --no-verify-jwt
supabase secrets set ESKIZ_EMAIL=sizning-eskiz-emailingiz
supabase secrets set ESKIZ_PASSWORD=sizning-eskiz-parolingiz
supabase secrets set ESKIZ_FROM=4546
```

### 4. Supabase Dashboard'da hookni yoqish

1. **Authentication → Hooks** bo'limiga o'ting.
2. **Add a new hook → Send SMS hook**ni tanlang.
3. Hook turi: **HTTPS**, URL: `https://<project-ref>.supabase.co/functions/v1/send-sms-hook`
4. **Generate secret** tugmasini bosing — chiqqan `v1,whsec_...` qiymatini nusxalab oling.
5. Terminalda: `supabase secrets set SEND_SMS_HOOK_SECRET=<nusxalangan qiymat>`
6. **Authentication → Providers → Phone**ni yoqing (real SMS provayder tanlash shart emas — hook uni almashtiradi).

### 5. SQL o'zgarishi

`supabase/phone_auth.sql` faylini SQL Editor'da ishga tushiring — bu
`profiles` jadvaliga `phone` ustunini qo'shadi va ro'yxatdan o'tish
trigerini yangilaydi (endi telefon raqamini ham saqlaydi).

### Narxni nazorat qilish

Supabase Dashboard'da **Authentication → Rate Limits** bo'limida SMS
so'rovlari sonini cheklang (masalan, bir soatda bitta raqamga 3 tadan
ortiq kod yubormaslik) — bu tasodifiy yoki niyatli xarajat oshishining
oldini oladi.

## Keyingi bosqichlar (rejadagi)

- So'rovlarni qabul/rad qilish tugmalari va real-vaqt xabarlashish (Supabase Realtime)
- Moderatsiya paneli va foydalanuvchi reytingi
- Arzon pullik bozor bo'limi
