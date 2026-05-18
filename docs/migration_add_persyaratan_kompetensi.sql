-- Add persyaratan_jabatan field to jabatan table
-- Structure: [{kompetensi_inti: string, level: string}]
ALTER TABLE public.jabatan 
ADD COLUMN IF NOT EXISTS persyaratan_jabatan JSONB NOT NULL DEFAULT '[]'::jsonb;
