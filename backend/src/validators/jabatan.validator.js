import Joi from 'joi'

// ── Schema untuk tugas_tanggung_jawab (nested) ─────────────────────
const tugasSchema = Joi.object({
  deskripsi_tugas: Joi.string().trim().min(5).max(3000).required(),
  hasil_diharapkan: Joi.array()
    .items(Joi.string().trim().min(3).max(1000))
    .default([])
})

// ── Main schema untuk CREATE jabatan ─────────────────────────────────
export const createJabatanSchema = Joi.object({
  // ── Hierarchy ──
  parent_id: Joi.number().integer().positive().allow(null).default(null),
  
  // ── Informasi Dasar ──
  nama_jabatan: Joi.string().trim().min(2).max(200).required(),
  nama_pejabat: Joi.string().trim().max(200).allow('', null),
  level_jabatan: Joi.string().trim().max(100).allow('', null),
  kode: Joi.string().trim().max(50).allow('', null),
  email: Joi.string().email().allow('', null),
  
  dinas: Joi.string().trim().max(150).default('-'),
  sub_dinas: Joi.string().trim().max(150).default('-'),
  unit_kerja: Joi.string().trim().max(150).allow('', null),
  lokasi: Joi.string().trim().max(150).allow('', null),
  direktorat: Joi.string().trim().max(150).allow('', null),
  
  atasan: Joi.string().trim().max(200).allow('', null),
  atasan_langsung: Joi.string().trim().max(200).allow('', null),
  
  keyword: Joi.array()
    .items(Joi.string().trim().max(50))
    .default([]),
  
  revisi_ke: Joi.number().integer().min(1).default(1),
  organization: Joi.string().valid('kantor_pusat', 'terminal', 'anak_perusahaan').default('kantor_pusat'),
  status: Joi.string().valid('active', 'inactive').default('active'),
  
  // ── Fungsi & Tugas ──
  fungsi_jabatan: Joi.string().trim().allow('', null),
  
  tugas_tanggung_jawab: Joi.array()
    .items(tugasSchema)
    .default([]),
  
  tugas_tanggung_jawab_umum: Joi.array()
    .items(tugasSchema)
    .default([]),
  
  wewenang: Joi.array()
    .items(Joi.string().trim().max(300))
    .default([]),
  
  // ── Koordinasi ──
  koordinasi_internal: Joi.array()
    .items(
      Joi.object({
        pihak: Joi.string().trim().max(200).required(),
        aktivitas: Joi.string().trim().max(500).required()
      })
    )
    .default([]),
  
  relasi_eksternal: Joi.array()
    .items(
      Joi.object({
        pihak: Joi.string().trim().max(200).required(),
        aktivitas: Joi.string().trim().max(500).required()
      })
    )
    .default([]),
  
  // ── Dimensi ──
  dimensi_finansial: Joi.object({
    anggaran_operasional: Joi.string().trim().max(500).allow('', null)
  }).default({}),
  
  dimensi_non_finansial: Joi.string().trim().allow('', null),
  deskripsi_dimensi_finansial: Joi.string().trim().allow('', null),
  
  // ── DEPRECATED (backward compatibility) ──
  title: Joi.string().trim().max(200).allow('', null),
  level_label: Joi.string().trim().max(100).allow('', null),
  person_name: Joi.string().trim().max(200).allow('', null),
  division: Joi.string().trim().max(100).allow('', null),
  fungsi: Joi.string().trim().allow('', null),
  tugas: Joi.array().items(Joi.string()).default([]),
  hasil: Joi.array().items(Joi.string()).default([])
})

export const updateJabatanSchema = createJabatanSchema.fork(
  ['nama_jabatan'], (schema) => schema.optional()
)
