-- ============================================================
-- SAXOVAT — Telefon orqali kirish uchun qo'shimcha SQL
-- Bu faylni schema.sql va storage.sql dan KEYIN ishga tushiring.
-- Eskiz.uz "Send SMS Hook" orqali ulanganda kerak bo'ladi.
-- ============================================================

-- profiles jadvaliga telefon raqamini qo'shamiz (ko'rsatish uchun;
-- autentifikatsiyaning o'zi auth.users.phone orqali ishlaydi, bu esa
-- faqat UI'da "E'lon egasi: +998 90 123 45 67" kabi ko'rsatish uchun)
alter table public.profiles
  add column if not exists phone text;

-- Ro'yxatdan o'tish trigerini yangilaymiz — endi email yoki telefon,
-- qaysi biri orqali ro'yxatdan o'tilgan bo'lsa ham to'g'ri ishlaydi
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Foydalanuvchi'),
    new.phone
  );
  return new;
end;
$$ language plpgsql security definer;

-- Eslatma: trigger (on_auth_user_created) allaqachon schema.sql'da
-- yaratilgan, funksiyani shu tarzda qayta yozish yetarli.
