-- Add posisi_gambar_url field to jabatan table
ALTER TABLE public.jabatan 
ADD COLUMN IF NOT EXISTS posisi_gambar_url TEXT;

-- Create storage bucket for jabatan images (run from Supabase dashboard)
-- insert into storage.buckets (id, name, public) 
-- values ('jabatan-images', 'jabatan-images', true);

-- Create RLS policy for jabatan-images bucket
-- CREATE POLICY "Public Access"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'jabatan-images');

-- CREATE POLICY "Authenticated Upload"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'jabatan-images' AND auth.role() = 'authenticated');
