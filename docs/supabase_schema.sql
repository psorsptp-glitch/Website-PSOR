-- ═══════════════════════════════════════════════════════════════
-- PELINDO ORGCHART — Supabase PostgreSQL Schema
-- ═══════════════════════════════════════════════════════════════

-- ── 1. USERS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id              BIGSERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer')),
  is_active       BOOLEAN NOT NULL DEFAULT true,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. JABATAN (org nodes) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.jabatan (
  id                    BIGSERIAL PRIMARY KEY,
  parent_id             BIGINT REFERENCES public.jabatan(id) ON DELETE SET NULL,
  title                 TEXT NOT NULL,
  level_label           TEXT,                       -- e.g. "LEVEL DIREKSI (BOD)"
  kode                  TEXT,                       -- e.g. "DIR-OPS-001"
  person_name           TEXT,
  email                 TEXT,
  division              TEXT,
  status                TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),

  -- Deskripsi jabatan
  fungsi                TEXT,
  tugas                 JSONB NOT NULL DEFAULT '[]'::jsonb,       -- string[]
  hasil                 JSONB NOT NULL DEFAULT '[]'::jsonb,       -- string[]
  wewenang              JSONB NOT NULL DEFAULT '[]'::jsonb,       -- string[]

  -- Koordinasi
  koordinasi_internal   JSONB NOT NULL DEFAULT '[]'::jsonb,       -- {pihak, aktivitas}[]
  relasi_eksternal      JSONB NOT NULL DEFAULT '[]'::jsonb,       -- {pihak, aktivitas}[]

  -- Dimensi
  dimensi_finansial     JSONB NOT NULL DEFAULT '{}'::jsonb,       -- {anggaran, approval, keterangan}
  dimensi_non_finansial JSONB NOT NULL DEFAULT '{}'::jsonb,       -- {bawahan, wilayah, kpi}

  -- Audit
  created_by            BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 3. AUDIT LOG ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,          -- 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN'
  table_name  TEXT NOT NULL,
  record_id   BIGINT,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 4. INDEXES ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_jabatan_parent_id  ON public.jabatan(parent_id);
CREATE INDEX IF NOT EXISTS idx_jabatan_status     ON public.jabatan(status);
CREATE INDEX IF NOT EXISTS idx_jabatan_division   ON public.jabatan(division);
CREATE INDEX IF NOT EXISTS idx_jabatan_title_trgm ON public.jabatan USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_users_email        ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_audit_user_id      ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_table        ON public.audit_logs(table_name, record_id);

-- Enable trigram extension for full-text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ── 5. UPDATED_AT TRIGGER ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_updated_at   BEFORE UPDATE ON public.users   FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_jabatan_updated_at BEFORE UPDATE ON public.jabatan FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 6. ROW LEVEL SECURITY ─────────────────────────────────────
ALTER TABLE public.users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jabatan      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs   ENABLE ROW LEVEL SECURITY;

-- NOTE: Backend uses SERVICE ROLE KEY which bypasses RLS.
-- These policies protect direct client access (anon key):

-- Users: only admins can see all users
CREATE POLICY "Service role full access"
  ON public.users FOR ALL USING (true);

CREATE POLICY "Service role full access jabatan"
  ON public.jabatan FOR ALL USING (true);

CREATE POLICY "Service role full access audit"
  ON public.audit_logs FOR ALL USING (true);

-- ── 7. SEED DATA (sample) ─────────────────────────────────────
-- Default admin user (password: admin123 — change immediately!)
INSERT INTO public.users (name, email, password_hash, role) VALUES
('Administrator', 'admin@pelindo.co.id',
 '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeQGqQ/J/6Xb0BKAK', -- admin123
 'admin')
ON CONFLICT (email) DO NOTHING;

-- Root jabatan
INSERT INTO public.jabatan (parent_id, title, level_label, kode, person_name, email, division, status, fungsi, tugas, hasil, wewenang) VALUES
(NULL, 'Direktur Utama', 'LEVEL DIREKSI (BOD)', 'DIR-001', 'Budi Hartono', 'dirut@pelindo.co.id', 'Direksi', 'active',
  'Memimpin seluruh operasional PT Pelindo Terminal Petikemas dan menetapkan arah strategis jangka panjang.',
  '["Menetapkan visi, misi, dan strategi perusahaan","Memimpin rapat direksi bulanan","Menandatangani dokumen dan perjanjian korporat"]'::jsonb,
  '["Pertumbuhan pendapatan min. 15%/tahun","Kepuasan stakeholder > 90%"]'::jsonb,
  '["Approval semua anggaran","Pengangkatan dan pemberhentian direktur"]'::jsonb
);
