import { supabase } from '../config/supabase.js'
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js'
import { PAGINATION } from '../config/constants.js'

// ── Helper: build full tree from flat array ──────────────────────────
function buildTree(nodes, parentId = null) {
  return nodes
    .filter(n => n.parent_id === parentId)
    .map(n => ({ ...n, children: buildTree(nodes, n.id) }))
}

// GET /api/jabatan — flat list with optional search & filter
export const getAllJabatan = async (req, res) => {
  try {
    const {
      search, division, status,
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT
    } = req.query

    let query = supabase
      .from('jabatan')
      .select('*', { count: 'exact' })
      .order('id', { ascending: true })

    if (search) {
      query = query.or(`title.ilike.%${search}%,person_name.ilike.%${search}%,kode.ilike.%${search}%`)
    }
    if (division) query = query.eq('division', division)
    if (status)   query = query.eq('status', status)

    const from = (Number(page) - 1) * Number(limit)
    const to   = from + Number(limit) - 1
    query = query.range(from, to)

    const { data, count, error } = await query
    if (error) throw error

    const denormalizedData = data.map(denormalizeResponse)
    return sendPaginated(res, denormalizedData, count, page, limit)
  } catch (err) {
    return sendError(res, err.message)
  }
}

// GET /api/jabatan/tree — hierarchical tree structure
export const getJabatanTree = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('jabatan')
      .select('*')
      .order('id', { ascending: true })

    if (error) throw error
    const denormalizedData = data.map(denormalizeResponse)
    const tree = buildTree(denormalizedData)
    return sendSuccess(res, tree, 'Tree berhasil diambil')
  } catch (err) {
    return sendError(res, err.message)
  }
}

// GET /api/jabatan/:id
export const getJabatanById = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('jabatan')
      .select('*')
      .eq('id', req.params.id)
      .single()

    if (error || !data) return sendError(res, 'Jabatan tidak ditemukan', 404)
    return sendSuccess(res, denormalizeResponse(data))
  } catch (err) {
    return sendError(res, err.message)
  }
}

// ── Helper: denormalize response untuk backward compatibility ──────────────
function denormalizeResponse(record) {
  // Tambahkan field lama yang di-generate dari field baru
  const denormalized = { ...record }
  
  // Generate field lama (tugas, hasil) dari field baru (tugas_tanggung_jawab)
  if (Array.isArray(denormalized.tugas_tanggung_jawab) && denormalized.tugas_tanggung_jawab.length > 0) {
    // Jika field lama belum ada, generate dari field baru
    if (!denormalized.tugas || denormalized.tugas.length === 0) {
      denormalized.tugas = denormalized.tugas_tanggung_jawab.map(t => t.deskripsi_tugas)
    }
    if (!denormalized.hasil || denormalized.hasil.length === 0) {
      denormalized.hasil = denormalized.tugas_tanggung_jawab.flatMap(t => t.hasil_diharapkan || [])
    }
  }
  
  // Alias field baru ke field lama untuk backward compatibility di frontend
  if (denormalized.nama_jabatan && !denormalized.title_new) {
    denormalized.title_new = denormalized.nama_jabatan
  }
  if (denormalized.fungsi_jabatan && !denormalized.fungsi_jabatan_new) {
    denormalized.fungsi_jabatan_new = denormalized.fungsi_jabatan
  }
  
  return denormalized
}

// ── Helper: normalize data untuk backward compatibility ──────────────
function normalizePayload(payload) {
  const normalized = { ...payload }
  
  // Map new field names ke old field names (database masih gunakan old column names)
  // Frontend mengirim: nama_jabatan, nama_pejabat, level_jabatan, dinas, fungsi_jabatan
  // Database punya: title, person_name, level_label, division, fungsi
  
  if (normalized.nama_jabatan && !normalized.title) {
    normalized.title = normalized.nama_jabatan
  }
  if (normalized.nama_pejabat && !normalized.person_name) {
    normalized.person_name = normalized.nama_pejabat
  }
  if (normalized.level_jabatan && !normalized.level_label) {
    normalized.level_label = normalized.level_jabatan
  }
  if (normalized.dinas && normalized.dinas !== '-' && !normalized.division) {
    normalized.division = normalized.dinas
  }
  if (normalized.fungsi_jabatan && !normalized.fungsi) {
    normalized.fungsi = normalized.fungsi_jabatan
  }
  
  // Convert old tugas/hasil format ke new tugas_tanggung_jawab format (jika perlu)
  if (Array.isArray(normalized.tugas) && normalized.tugas.length > 0 && 
      (!normalized.tugas_tanggung_jawab || normalized.tugas_tanggung_jawab.length === 0)) {
    normalized.tugas_tanggung_jawab = normalized.tugas.map(t => ({
      deskripsi_tugas: t,
      hasil_diharapkan: []
    }))
  }
  
  // Validate tugas_tanggung_jawab structure
  if (normalized.tugas_tanggung_jawab) {
    normalized.tugas_tanggung_jawab = normalized.tugas_tanggung_jawab
      .map(t => ({
        deskripsi_tugas: t.deskripsi_tugas || '',
        hasil_diharapkan: Array.isArray(t.hasil_diharapkan) ? t.hasil_diharapkan : []
      }))
      .filter(t => t.deskripsi_tugas.trim())
  }
  
  if (normalized.tugas_tanggung_jawab_umum) {
    normalized.tugas_tanggung_jawab_umum = normalized.tugas_tanggung_jawab_umum
      .map(t => ({
        deskripsi_tugas: t.deskripsi_tugas || '',
        hasil_diharapkan: Array.isArray(t.hasil_diharapkan) ? t.hasil_diharapkan : []
      }))
      .filter(t => t.deskripsi_tugas.trim())
  }
  
  // Ensure dimensi_finansial has correct structure
  if (normalized.dimensi_finansial) {
    normalized.dimensi_finansial = {
      anggaran_operasional: normalized.dimensi_finansial.anggaran_operasional || 
                            normalized.dimensi_finansial.anggaran || ''
    }
  }
  
  return normalized
}

// POST /api/jabatan — create new
export const createJabatan = async (req, res) => {
  try {
    const payload = normalizePayload({ ...req.body, created_by: req.user.id })

    // Validate parent exists if provided
    if (payload.parent_id) {
      const { data: parent } = await supabase
        .from('jabatan').select('id').eq('id', payload.parent_id).single()
      if (!parent) return sendError(res, 'Parent jabatan tidak ditemukan', 404)
    }

    const { data, error } = await supabase
      .from('jabatan')
      .insert(payload)
      .select()
      .single()

    if (error) throw error
    return sendSuccess(res, denormalizeResponse(data), 'Jabatan berhasil dibuat', 201)
  } catch (err) {
    return sendError(res, err.message)
  }
}

// PUT /api/jabatan/:id — update
export const updateJabatan = async (req, res) => {
  try {
    const { id } = req.params

    // Check exists
    const { data: existing } = await supabase
      .from('jabatan').select('id').eq('id', id).single()
    if (!existing) return sendError(res, 'Jabatan tidak ditemukan', 404)

    // Prevent circular parent reference
    if (req.body.parent_id && Number(req.body.parent_id) === Number(id)) {
      return sendError(res, 'Parent tidak boleh dirinya sendiri', 400)
    }

    const payload = normalizePayload(req.body)

    const { data, error } = await supabase
      .from('jabatan')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return sendSuccess(res, denormalizeResponse(data), 'Jabatan berhasil diperbarui')
  } catch (err) {
    return sendError(res, err.message)
  }
}

// PATCH /api/jabatan/:id/gambar — update gambar/foto
export const updateJabatanGambar = async (req, res) => {
  try {
    const { id } = req.params
    const { posisi_gambar_url } = req.body

    // Check jabatan exists
    const { data: existing } = await supabase
      .from('jabatan').select('id').eq('id', id).single()
    if (!existing) return sendError(res, 'Jabatan tidak ditemukan', 404)

    const { data, error } = await supabase
      .from('jabatan')
      .update({ posisi_gambar_url: posisi_gambar_url || null, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return sendSuccess(res, denormalizeResponse(data), 'Gambar berhasil diperbarui')
  } catch (err) {
    return sendError(res, err.message)
  }
}

// DELETE /api/jabatan/:id
export const deleteJabatan = async (req, res) => {
  try {
    const { id } = req.params

    // Check if has children
    const { data: children } = await supabase
      .from('jabatan').select('id').eq('parent_id', id)

    if (children?.length > 0) {
      return sendError(res, `Jabatan memiliki ${children.length} sub-jabatan. Hapus sub-jabatan terlebih dahulu atau pindahkan parentnya.`, 400)
    }

    const { error } = await supabase.from('jabatan').delete().eq('id', id)
    if (error) throw error

    return sendSuccess(res, null, 'Jabatan berhasil dihapus')
  } catch (err) {
    return sendError(res, err.message)
  }
}

// PATCH /api/jabatan/:id/move — change parent (drag & drop)
export const moveJabatan = async (req, res) => {
  try {
    const { id } = req.params
    const { parent_id } = req.body

    if (Number(parent_id) === Number(id))
      return sendError(res, 'Tidak dapat menjadi parent dirinya sendiri', 400)

    const { data, error } = await supabase
      .from('jabatan')
      .update({ parent_id: parent_id ?? null, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return sendSuccess(res, data, 'Posisi jabatan berhasil diperbarui')
  } catch (err) {
    return sendError(res, err.message)
  }
}

// GET /api/jabatan/divisions — distinct list of divisions
export const getDivisions = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('jabatan')
      .select('dinas')
      .not('dinas', 'is', null)
      .neq('dinas', '-')
      .order('dinas')

    if (error) throw error
    const divisions = [...new Set(data.map(d => d.dinas).filter(Boolean))]
    return sendSuccess(res, divisions)
  } catch (err) {
    return sendError(res, err.message)
  }
}

// GET /api/jabatan/organizations — list unique organizations
export const getOrganizations = async (req, res) => {
  try {
    const organizations = ['kantor_pusat', 'terminal', 'anak_perusahaan']
    
    // Optional: check which ones have data
    const { data } = await supabase
      .from('jabatan')
      .select('organization')
      .not('organization', 'is', null)
    
    const activeOrgs = [...new Set(data?.map(d => d.organization) || [])]
    
    return sendSuccess(res, {
      all: organizations,
      active: activeOrgs,
      counts: {
        kantor_pusat: data?.filter(d => d.organization === 'kantor_pusat').length || 0,
        terminal: data?.filter(d => d.organization === 'terminal').length || 0,
        anak_perusahaan: data?.filter(d => d.organization === 'anak_perusahaan').length || 0
      }
    })
  } catch (err) {
    return sendError(res, err.message)
  }
}

// GET /api/jabatan/by-organization/:org — get all jabatan by organization
export const getJabatanByOrganization = async (req, res) => {
  try {
    const { org } = req.params
    const validOrgs = ['kantor_pusat', 'terminal', 'anak_perusahaan']
    
    if (!validOrgs.includes(org)) {
      return sendError(res, 'Invalid organization type', 400)
    }

    const { data, error } = await supabase
      .from('jabatan')
      .select('*')
      .eq('organization', org)
      .eq('status', 'active')
      .order('id', { ascending: true })

    if (error) throw error
    return sendSuccess(res, data)
  } catch (err) {
    return sendError(res, err.message)
  }
}
