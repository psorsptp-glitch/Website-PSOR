-- ═══════════════════════════════════════════════════════════════
-- MIGRATION: JABATAN REFACTOR v2
-- Menambah fields baru dan mengubah struktur tugas/hasil
-- ═══════════════════════════════════════════════════════════════
-- Created: 2026-05-10
-- ═══════════════════════════════════════════════════════════════

-- ── STEP 1: Add new columns to existing jabatan table ──────────────
ALTER TABLE public.jabatan
ADD COLUMN IF NOT EXISTS nama_jabatan TEXT,
ADD COLUMN IF NOT EXISTS nama_pejabat TEXT,
ADD COLUMN IF NOT EXISTS level_jabatan TEXT,
ADD COLUMN IF NOT EXISTS dinas TEXT DEFAULT '-',
ADD COLUMN IF NOT EXISTS sub_dinas TEXT DEFAULT '-',
ADD COLUMN IF NOT EXISTS unit_kerja TEXT,
ADD COLUMN IF NOT EXISTS lokasi TEXT,
ADD COLUMN IF NOT EXISTS direktorat TEXT,
ADD COLUMN IF NOT EXISTS atasan TEXT,
ADD COLUMN IF NOT EXISTS atasan_langsung TEXT,
ADD COLUMN IF NOT EXISTS keyword JSONB NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS revisi_ke INT DEFAULT 1,
ADD COLUMN IF NOT EXISTS organization TEXT DEFAULT 'kantor_pusat' CHECK (organization IN ('kantor_pusat', 'terminal', 'anak_perusahaan')),
ADD COLUMN IF NOT EXISTS fungsi_jabatan TEXT;

-- ── STEP 2: Migrate old struktur tugas/hasil ke struktur baru ──────
-- Struktur lama: tugas = string[], hasil = string[]
-- Struktur baru: tugas_tanggung_jawab = [{deskripsi_tugas, hasil_diharapkan[]}]
--                tugas_tanggung_jawab_umum = [{deskripsi_tugas, hasil_diharapkan[]}]

ALTER TABLE public.jabatan
ADD COLUMN IF NOT EXISTS tugas_tanggung_jawab JSONB NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS tugas_tanggung_jawab_umum JSONB NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS deskripsi_dimensi_finansial TEXT;

-- ── STEP 3: Migrate data dari struktur lama ke baru ──────────────────
-- Catatan: Jika tugas lama ada, kita konversi ke struktur baru
-- Logika: 1 tugas → 1 object dengan hasil_diharapkan dari hasil lama
UPDATE public.jabatan
SET tugas_tanggung_jawab = 
  CASE 
    WHEN jsonb_array_length(tugas) > 0 THEN
      jsonb_agg(
        jsonb_build_object(
          'deskripsi_tugas', value,
          'hasil_diharapkan', jsonb_build_array()  -- Kosong, akan diisi user
        )
      ) OVER (PARTITION BY id)
    ELSE '[]'::jsonb
  END,
  fungsi_jabatan = COALESCE(fungsi_jabatan, fungsi),
  nama_jabatan = COALESCE(nama_jabatan, title),
  nama_pejabat = COALESCE(nama_pejabat, person_name),
  level_jabatan = COALESCE(level_jabatan, level_label)
WHERE tugas IS NOT NULL AND jsonb_array_length(tugas) > 0;

-- Jika migration di atas kompleks, gunakan cara ini yang lebih simpel:
-- Buat function untuk convert data
CREATE OR REPLACE FUNCTION migrate_tugas_struktur()
RETURNS void AS $$
DECLARE
  rec RECORD;
  new_tugas JSONB;
  i INT;
BEGIN
  FOR rec IN SELECT id, tugas FROM public.jabatan WHERE tugas IS NOT NULL AND jsonb_array_length(tugas) > 0
  LOOP
    new_tugas := '[]'::jsonb;
    FOR i IN 0..jsonb_array_length(rec.tugas)-1
    LOOP
      new_tugas := new_tugas || jsonb_build_object(
        'deskripsi_tugas', rec.tugas->i,
        'hasil_diharapkan', '[]'::jsonb
      );
    END LOOP;
    
    UPDATE public.jabatan 
    SET tugas_tanggung_jawab = new_tugas
    WHERE id = rec.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run migration function
SELECT migrate_tugas_struktur();

-- Drop function after use
DROP FUNCTION IF EXISTS migrate_tugas_struktur();

-- ── STEP 4: Keep old columns untuk backward compatibility (optional) ──
-- Anda bisa set comment untuk indicate deprecated:
COMMENT ON COLUMN public.jabatan.tugas IS 'DEPRECATED: Use tugas_tanggung_jawab instead';
COMMENT ON COLUMN public.jabatan.hasil IS 'DEPRECATED: Use tugas_tanggung_jawab.hasil_diharapkan instead';
COMMENT ON COLUMN public.jabatan.fungsi IS 'DEPRECATED: Use fungsi_jabatan instead';
COMMENT ON COLUMN public.jabatan.level_label IS 'DEPRECATED: Use level_jabatan instead';
COMMENT ON COLUMN public.jabatan.person_name IS 'DEPRECATED: Use nama_pejabat instead';
COMMENT ON COLUMN public.jabatan.title IS 'DEPRECATED: Use nama_jabatan instead';

-- ── STEP 5: Add new indexes untuk performance ──────────────────────
CREATE INDEX IF NOT EXISTS idx_jabatan_organization ON public.jabatan(organization);
CREATE INDEX IF NOT EXISTS idx_jabatan_level_jabatan ON public.jabatan(level_jabatan);
CREATE INDEX IF NOT EXISTS idx_jabatan_keyword ON public.jabatan USING GIN(keyword);
CREATE INDEX IF NOT EXISTS idx_jabatan_dinas ON public.jabatan(dinas);

-- ── STEP 6: Update trigger untuk updated_at ────────────────────────
-- Trigger sudah ada, tidak perlu diubah

-- ── STEP 7: Verify migration ────────────────────────────────────────
-- Run these queries untuk verify:
-- SELECT COUNT(*) as total_jabatan FROM public.jabatan;
-- SELECT COUNT(*) as has_new_tugas FROM public.jabatan WHERE jsonb_array_length(tugas_tanggung_jawab) > 0;
-- SELECT * FROM public.jabatan LIMIT 1; -- Check struktur data

-- ── NOTES ──────────────────────────────────────────────────────────
-- 1. Backup data sebelum menjalankan migration ini
-- 2. Test di environment development terlebih dahulu
-- 3. Old columns (tugas, hasil, fungsi, title, level_label, person_name) tetap ada untuk safety
-- 4. Frontend perlu diupdate untuk menggunakan kolom baru
-- 5. Jika ada foreign key dari kolom lama, pastikan sudah dihandle
