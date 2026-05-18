-- Add persyaratan_jabatan field to jabatan table
ALTER TABLE public.jabatan 
ADD COLUMN IF NOT EXISTS persyaratan_jabatan TEXT;
