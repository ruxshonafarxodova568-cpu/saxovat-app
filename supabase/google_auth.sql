-- ============================================================
-- SAXOVAT — Google (Gmail) orqali kirish uchun qo'shimcha SQL
-- schema.sql dan KEYIN, SQL Editor'da ishga tushiring.
-- ============================================================

-- Google profil rasmini saqlash uchun ustun
alter table public.profiles
  add column if not exists avatar_url text;

-- Ro'yxatdan o'tish trigerini yangilaymiz: Google orqali kirilganda
-- ism va profil rasmi avtomatik to'ldiriladi (Google metadata'sidan)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      'Foydalanuvchi'
    ),
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture'
    )
  );
  return new;
end;
$$ language plpgsql security definer;

-- Eslatma: trigger (on_auth_user_created) allaqachon schema.sql'da
-- yaratilgan, funksiyani shu tarzda qayta yozish yetarli.
