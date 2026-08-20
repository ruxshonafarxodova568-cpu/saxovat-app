-- ============================================================
-- SAXOVAT — Supabase SQL sxemasi
-- Bu faylni Supabase Dashboard > SQL Editor ga to'liq nusxa
-- ko'chirib, "Run" tugmasini bosing.
-- ============================================================

-- 1) PROFILES ------------------------------------------------
-- Har bir auth.users yozuviga mos keladigan ochiq profil
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default 'Foydalanuvchi',
  region text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profillar hammaga ko'rinadi"
  on public.profiles for select
  using (true);

create policy "Foydalanuvchi faqat o'z profilini tahrirlaydi"
  on public.profiles for update
  using (auth.uid() = id);

-- Ro'yxatdan o'tganda avtomatik profil yaratish
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'Foydalanuvchi'));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2) ITEMS (e'lonlar) -----------------------------------------
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null check (category in ('kitob','video','kiyim','maktab','royzgor','oyin')),
  condition text not null check (condition in ('Yangidek','Yaxshi','O''rtacha')),
  region text not null,
  image_url text,
  status text not null default 'faol' check (status in ('faol','band','berildi')),
  created_at timestamptz not null default now()
);

create index if not exists items_category_idx on public.items(category);
create index if not exists items_region_idx on public.items(region);
create index if not exists items_status_idx on public.items(status);

alter table public.items enable row level security;

create policy "E'lonlar hammaga ko'rinadi"
  on public.items for select
  using (true);

create policy "Foydalanuvchi o'z nomidan e'lon qo'shadi"
  on public.items for insert
  with check (auth.uid() = owner_id);

create policy "Faqat egasi o'z e'lonini tahrirlaydi"
  on public.items for update
  using (auth.uid() = owner_id);

create policy "Faqat egasi o'z e'lonini o'chiradi"
  on public.items for delete
  using (auth.uid() = owner_id);


-- 3) REQUESTS (so'rovlar) ---------------------------------------
create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  requester_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  status text not null default 'kutilmoqda' check (status in ('kutilmoqda','qabul_qilindi','rad_etildi')),
  created_at timestamptz not null default now()
);

create index if not exists requests_item_idx on public.requests(item_id);
create index if not exists requests_requester_idx on public.requests(requester_id);

alter table public.requests enable row level security;

-- So'rovni faqat so'rov yuboruvchi yoki e'lon egasi ko'ra oladi
create policy "So'rovlarni tegishli tomonlar ko'radi"
  on public.requests for select
  using (
    auth.uid() = requester_id
    or auth.uid() in (select owner_id from public.items where items.id = requests.item_id)
  );

create policy "Foydalanuvchi o'z nomidan so'rov yuboradi"
  on public.requests for insert
  with check (auth.uid() = requester_id);

-- Faqat e'lon egasi so'rov holatini (qabul/rad) o'zgartira oladi
create policy "E'lon egasi so'rov holatini yangilaydi"
  on public.requests for update
  using (auth.uid() in (select owner_id from public.items where items.id = requests.item_id));


-- 4) MESSAGES (so'rov ichidagi yozishmalar) ----------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "Xabarlarni so'rov tomonlari ko'radi"
  on public.messages for select
  using (
    auth.uid() in (
      select requester_id from public.requests where requests.id = messages.request_id
      union
      select owner_id from public.items
        join public.requests on requests.item_id = items.id
        where requests.id = messages.request_id
    )
  );

create policy "So'rov tomonlari xabar yoza oladi"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and auth.uid() in (
      select requester_id from public.requests where requests.id = messages.request_id
      union
      select owner_id from public.items
        join public.requests on requests.item_id = items.id
        where requests.id = messages.request_id
    )
  );
