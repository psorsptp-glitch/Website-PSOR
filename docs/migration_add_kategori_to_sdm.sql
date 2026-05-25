-- Migration: Add missing columns to swp_sdm_structure
-- Created: 2026-05-25
-- Purpose: Add fields for SDM categorization and metadata

-- Add kategori column
ALTER TABLE swp_sdm_structure
ADD COLUMN IF NOT EXISTS kategori TEXT DEFAULT '';

-- Add status column
ALTER TABLE swp_sdm_structure
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Add optional metadata columns if not exist
ALTER TABLE swp_sdm_structure
ADD COLUMN IF NOT EXISTS shift INTEGER DEFAULT 0;

ALTER TABLE swp_sdm_structure
ADD COLUMN IF NOT EXISTS group_count INTEGER DEFAULT 0;

ALTER TABLE swp_sdm_structure
ADD COLUMN IF NOT EXISTS keterangan TEXT DEFAULT '';

ALTER TABLE swp_sdm_structure
ADD COLUMN IF NOT EXISTS keterangan_lanjutan TEXT DEFAULT '';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_swp_sdm_kategori ON swp_sdm_structure(kategori);
CREATE INDEX IF NOT EXISTS idx_swp_sdm_status ON swp_sdm_structure(status);
CREATE INDEX IF NOT EXISTS idx_swp_sdm_terminal ON swp_sdm_structure(terminal_id);

-- Add comments for documentation
COMMENT ON COLUMN swp_sdm_structure.kategori IS 'Classification category for SDM (e.g., Manajemen, Operasional, Support)';
COMMENT ON COLUMN swp_sdm_structure.status IS 'Record status (active/inactive)';
COMMENT ON COLUMN swp_sdm_structure.shift IS 'Shift assignment number';
COMMENT ON COLUMN swp_sdm_structure.group_count IS 'Group count or team size';
COMMENT ON COLUMN swp_sdm_structure.keterangan IS 'Notes or description';
COMMENT ON COLUMN swp_sdm_structure.keterangan_lanjutan IS 'Additional notes from operations discussion';
