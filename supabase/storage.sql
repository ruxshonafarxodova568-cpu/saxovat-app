-- ============================================================
-- SAXOVAT — Storage (rasm yuklash) sozlamalari
-- Buni schema.sql dan KEYIN, SQL Editor'da ishga tushiring.
-- ============================================================

-- 1) Bucket yaratish (agar Dashboard > Storage orqali qo'lda
--    yaratgan bo'lsangiz, bu qatorni o'chirib qo'yavering)
insert into storage.buckets (id, name, public)
values ('item-images', 'item-images', true)
on conflict (id) do nothing;

-- 2) Hamma rasmlarni o'qiy oladi (public bucket)
create policy "Rasmlar hammaga ochiq"
  on storage.objects for select
  using (bucket_id = 'item-images');

-- 3) Faqat tizimga kirgan foydalanuvchi rasm yuklay oladi
create policy "Ro'yxatdan o'tgan foydalanuvchi rasm yuklaydi"
  on storage.objects for insert
  with check (bucket_id = 'item-images' and auth.role() = 'authenticated');

-- 4) Foydalanuvchi faqat o'zi yuklagan rasmni o'chira oladi
create policy "Foydalanuvchi faqat o'z rasmini o'chiradi"
  on storage.objects for delete
  using (bucket_id = 'item-images' and owner = auth.uid());
