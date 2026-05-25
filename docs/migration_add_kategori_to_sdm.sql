-- Migration: Add kategori column to swp_sdm_structure
-- Created: 2026-05-25
-- Purpose: Add kategori field for SDM classification

ALTER TABLE swp_sdm_structure
ADD COLUMN IF NOT EXISTS kategori TEXT DEFAULT '';

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_swp_sdm_kategori ON swp_sdm_structure(kategori);

-- Optional: Update existing rows with default kategori based on nama_jabatan
-- UPDATE swp_sdm_structure SET kategori = 'General' WHERE kategori = '' OR kategori IS NULL;

COMMENT ON COLUMN swp_sdm_structure.kategori IS 'Classification category for SDM (e.g., Manajemen, Operasional, Support)';
