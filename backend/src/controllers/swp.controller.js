// controllers/swpController.js
// ============================================================
// SWP API Controller - Node.js (Express)
// ============================================================

import { supabase } from '../config/supabase.js'

/**
 * Build tree structure dari flat array berdasarkan parent_id
 */
function buildTree(items) {
  const map = {};
  const roots = [];

  items.forEach(item => {
    map[item.id] = { ...item, children: [] };
  });

  items.forEach(item => {
    if (item.parent_id && map[item.parent_id]) {
      map[item.parent_id].children.push(map[item.id]);
    } else {
      roots.push(map[item.id]);
    }
  });

  return roots;
}

/**
 * Hitung total SDM dari tree (recursive)
 */
function calcTreeTotals(node) {
  if (!node.children || node.children.length === 0) return node;

  node.children = node.children.map(calcTreeTotals);

  // Jika node parent (level 0), aggregate children
  if (node.level === 0) {
    const totals = node.children.reduce(
      (acc, child) => ({
        ideal: acc.ideal + (child.ideal || 0),
        min_req: acc.min_req + (child.min_req || 0),
        organik: acc.organik + (child.organik || 0),
        tad: acc.tad + (child.tad || 0),
        pemborongan: acc.pemborongan + (child.pemborongan || 0),
        jumlah: acc.jumlah + (child.jumlah || 0),
      }),
      { ideal: 0, min_req: 0, organik: 0, tad: 0, pemborongan: 0, jumlah: 0 }
    );
    node._totals = {
      ...totals,
      selisih_ideal: totals.jumlah - totals.ideal,
      selisih_min: totals.jumlah - totals.min_req,
    };
  }

  return node;
}

/**
 * Get dynamic bulan columns dari period_data JSONB
 */
function extractPeriodColumns(rows) {
  const keys = new Set();
  rows.forEach(r => {
    if (r.period_data) {
      Object.keys(r.period_data).forEach(k => keys.add(k));
    }
  });
  return Array.from(keys).sort(); // ["2026-01", "2026-02", "2026-03"]
}

// ============================================================
// TERMINAL
// ============================================================

export const getTerminals = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('swp_terminal')
      .select('*')
      .eq('is_active', true)
      .order('nama_terminal');

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================================
// KINERJA
// ============================================================

/**
 * GET /api/swp/kinerja
 * Query params: terminal_id, category, tahun_ref
 */
export const getKinerja = async (req, res) => {
  try {
    const { terminal_id, category, tahun_ref = 2026 } = req.query;

    let query = supabase
      .from('swp_kinerja')
      .select('*')
      .eq('tahun_ref', tahun_ref)
      .order('category')
      .order('urutan');

    if (terminal_id) query = query.eq('terminal_id', terminal_id);
    if (category) query = query.eq('category', category);

    const { data, error } = await query;
    if (error) throw error;

    // Kelompokkan per category
    const grouped = {
      keuangan: [],
      operasional: [],
      sdm: [],
    };

    data.forEach(row => {
      if (grouped[row.category]) {
        grouped[row.category].push(row);
      }
    });

    // Extract dynamic period columns
    const periodColumns = extractPeriodColumns(data);

    res.json({
      success: true,
      data: grouped,
      periodColumns,
      totalRows: data.length,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/swp/kinerja
 * Body: { terminal_id, category, indikator, tahun_ref, realisasi_tahun_lalu, rkap_tahun_ini, period_data, ... }
 */
export const createKinerja = async (req, res) => {
  try {
    const payload = req.body;

    // Hitung trend_9 (6:5 = realisasi_sd / realisasi bulan terakhir)
    if (payload.period_data && payload.realisasi_sd_bulan) {
      const periodKeys = Object.keys(payload.period_data).sort();
      const lastKey = periodKeys[periodKeys.length - 1];
      const lastVal = payload.period_data[lastKey];
      if (lastVal && lastVal !== 0) {
        payload.trend_9 = payload.realisasi_sd_bulan / lastVal;
      }
    }

    const { data, error } = await supabase
      .from('swp_kinerja')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/swp/kinerja/:id
 */
export const updateKinerja = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    // Recalculate trend_9
    if (payload.period_data && payload.realisasi_sd_bulan) {
      const periodKeys = Object.keys(payload.period_data).sort();
      const lastKey = periodKeys[periodKeys.length - 1];
      const lastVal = payload.period_data[lastKey];
      if (lastVal && lastVal !== 0) {
        payload.trend_9 = payload.realisasi_sd_bulan / lastVal;
      }
    }

    const { data, error } = await supabase
      .from('swp_kinerja')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/swp/kinerja/:id
 */
export const deleteKinerja = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('swp_kinerja').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /api/swp/kinerja/:id/period
 * Update satu nilai period (inline edit bulan)
 * Body: { period_key: "2026-03", value: 1234567 }
 */
export const updateKinerjaPeriod = async (req, res) => {
  try {
    const { id } = req.params;
    const { period_key, value } = req.body;

    // Fetch existing row
    const { data: existing, error: fetchErr } = await supabase
      .from('swp_kinerja')
      .select('period_data, realisasi_sd_bulan')
      .eq('id', id)
      .single();

    if (fetchErr) throw fetchErr;

    const updatedPeriod = { ...(existing.period_data || {}), [period_key]: value };

    // Recalculate realisasi_sd_bulan (sum semua period)
    const newSd = Object.values(updatedPeriod).reduce((a, b) => a + (Number(b) || 0), 0);

    const { data, error } = await supabase
      .from('swp_kinerja')
      .update({ period_data: updatedPeriod, realisasi_sd_bulan: newSd })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================================
// FASILITAS
// ============================================================

export const getFasilitas = async (req, res) => {
  try {
    const { terminal_id, tahun_ref = 2026 } = req.query;

    let query = supabase
      .from('swp_fasilitas')
      .select('*')
      .eq('tahun_ref', tahun_ref)
      .order('urutan');

    if (terminal_id) query = query.eq('terminal_id', terminal_id);

    const { data, error } = await query;
    if (error) throw error;

    // Group by kategori
    const grouped = {};
    data.forEach(row => {
      const key = row.kategori || 'Lainnya';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(row);
    });

    res.json({ success: true, data, grouped });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createFasilitas = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('swp_fasilitas')
      .insert(req.body)
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateFasilitas = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('swp_fasilitas')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteFasilitas = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('swp_fasilitas').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================================
// SHIFT KERJA
// ============================================================

export const getShift = async (req, res) => {
  try {
    const { terminal_id, tahun_ref = 2026 } = req.query;

    let query = supabase
      .from('swp_shift')
      .select('*')
      .eq('tahun_ref', tahun_ref)
      .order('urutan');

    if (terminal_id) query = query.eq('terminal_id', terminal_id);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createShift = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('swp_shift')
      .insert(req.body)
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateShift = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('swp_shift')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteShift = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('swp_shift').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================================
// SDM STRUCTURE (TREE)
// ============================================================

/**
 * GET /api/swp/sdm
 * Query params: terminal_id, tahun_ref, flat (boolean)
 * flat=true → return flat array (untuk export)
 * flat=false (default) → return tree structure
 */
export const getSDM = async (req, res) => {
  try {
    const { terminal_id, tahun_ref = 2026, flat = 'false' } = req.query;

    let query = supabase
      .from('swp_sdm_structure')
      .select('*')
      .eq('tahun_ref', tahun_ref)
      .order('urutan');

    if (terminal_id) query = query.eq('terminal_id', terminal_id);

    const { data, error } = await query;
    if (error) throw error;

    if (flat === 'true') {
      return res.json({ success: true, data });
    }

    // Build tree
    const tree = buildTree(data);
    const treeWithTotals = tree.map(calcTreeTotals);

    // Hitung grand total
    const grandTotal = data
      .filter(d => d.level === 1) // Hanya leaf nodes
      .reduce(
        (acc, row) => ({
          ideal: acc.ideal + (row.ideal || 0),
          min_req: acc.min_req + (row.min_req || 0),
          organik: acc.organik + (row.organik || 0),
          tad: acc.tad + (row.tad || 0),
          pemborongan: acc.pemborongan + (row.pemborongan || 0),
          jumlah: acc.jumlah + (row.jumlah || 0),
        }),
        { ideal: 0, min_req: 0, organik: 0, tad: 0, pemborongan: 0, jumlah: 0 }
      );

    res.json({
      success: true,
      data: treeWithTotals,
      grandTotal: {
        ...grandTotal,
        selisih_ideal: grandTotal.jumlah - grandTotal.ideal,
        selisih_min: grandTotal.jumlah - grandTotal.min_req,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createSDM = async (req, res) => {
  try {
    const payload = req.body;
    console.log('📝 createSDM request payload:', JSON.stringify(payload, null, 2));

    // Validate only critical field
    if (!payload.nama_jabatan || payload.nama_jabatan.trim() === '') {
      console.warn('⚠️  Missing atau empty nama_jabatan');
      return res.status(400).json({ success: false, message: 'Nama jabatan is required' });
    }

    // Build insert payload - CORE FIELDS ONLY (these must exist in database)
    // Note: jumlah, selisih_ideal, selisih_min are GENERATED/COMPUTED by database
    const insertPayload = {
      terminal_id: payload.terminal_id || null,
      tahun_ref: payload.tahun_ref || new Date().getFullYear(),
      parent_id: payload.parent_id || null,
      nama_jabatan: payload.nama_jabatan,
      jumlah_alat: payload.jumlah_alat || 0,
      ideal: payload.ideal || 0,
      min_req: payload.min_req || 0,
      organik: payload.organik || 0,
      tad: payload.tad || 0,
      pemborongan: payload.pemborongan || 0,
      level: payload.level !== undefined ? payload.level : 0,
      urutan: payload.urutan || 0,
    };

    // Add optional fields if provided
    if (payload.shift !== undefined && payload.shift !== null) insertPayload.shift = payload.shift;
    if (payload.group_count !== undefined && payload.group_count !== null) insertPayload.group_count = payload.group_count;
    if (payload.keterangan) insertPayload.keterangan = payload.keterangan;
    if (payload.keterangan_lanjutan) insertPayload.keterangan_lanjutan = payload.keterangan_lanjutan;
    if (payload.kategori && payload.kategori.trim()) insertPayload.kategori = payload.kategori;

    console.log('💾 Prepared insert payload:', JSON.stringify(insertPayload, null, 2));

    const { data, error } = await supabase
      .from('swp_sdm_structure')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('❌ Insert error:', { code: error.code, message: error.message });
      
      // If error due to missing optional column, retry with ONLY core fields
      if (error.message && error.message.includes('Could not find')) {
        console.warn('⚠️  Optional column missing. Retrying with minimal fields...');
        
        const coreOnly = {
          terminal_id: insertPayload.terminal_id,
          tahun_ref: insertPayload.tahun_ref,
          parent_id: insertPayload.parent_id,
          nama_jabatan: insertPayload.nama_jabatan,
          jumlah_alat: insertPayload.jumlah_alat,
          ideal: insertPayload.ideal,
          min_req: insertPayload.min_req,
          organik: insertPayload.organik,
          tad: insertPayload.tad,
          pemborongan: insertPayload.pemborongan,
          level: insertPayload.level,
          urutan: insertPayload.urutan,
        };
        
        const { data: retryData, error: retryError } = await supabase
          .from('swp_sdm_structure')
          .insert(coreOnly)
          .select()
          .single();
        
        if (!retryError) {
          console.log('✅ SDM created (retry with core fields):', retryData);
          return res.status(201).json({ success: true, data: retryData });
        }
      }
      
      return res.status(400).json({ 
        success: false, 
        message: error.message || 'Database insert failed',
      });
    }
    console.log('✅ SDM created successfully:', data);
    res.status(201).json({ success: true, data });
  } catch (err) {
    console.error('❌ createSDM error:', {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Internal server error',
    });
  }
};

export const updateSDM = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    // Validate ID exists
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID is required' });
    }

    console.log('📝 updateSDM called for ID:', id);
    console.log('   Payload:', JSON.stringify(payload, null, 2));

    // Verify record exists first
    const { data: existing, error: fetchErr } = await supabase
      .from('swp_sdm_structure')
      .select('id')
      .eq('id', id);

    if (fetchErr) {
      console.error('❌ Error fetching existing record:', fetchErr);
      throw new Error(`Cannot fetch record: ${fetchErr.message}`);
    }

    if (!existing || existing.length === 0) {
      console.warn('⚠️  Record not found for ID:', id);
      return res.status(404).json({ success: false, message: `Record with ID ${id} not found` });
    }

    // IMPORTANT: Do NOT include 'jumlah' in payload
    // 'jumlah' is a COMPUTED field (GENERATED or TRIGGER-calculated)
    // Remove it to let database auto-calculate
    const updatePayload = { ...payload };
    if ('jumlah' in updatePayload) {
      console.log('   ℹ️  Removing jumlah from payload (computed field)');
      delete updatePayload.jumlah;
    }

    const { data, error } = await supabase
      .from('swp_sdm_structure')
      .update(updatePayload)
      .eq('id', id)
      .select();

    if (error) {
      console.error('❌ Supabase update error:', error);
      throw new Error(`Update failed: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.warn('⚠️  Update returned no rows for ID:', id);
      return res.status(404).json({ success: false, message: 'Update did not return data' });
    }

    console.log('✅ SDM updated successfully:', data[0].id);
    res.json({ success: true, data: data[0] });
  } catch (err) {
    console.error('❌ updateSDM error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

export const deleteSDM = async (req, res) => {
  try {
    const { id } = req.params;
    // Hapus children dulu
    await supabase.from('swp_sdm_structure').delete().eq('parent_id', id);
    const { error } = await supabase.from('swp_sdm_structure').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================================
// STATUS PEKERJA
// ============================================================

export const getStatus = async (req, res) => {
  try {
    const { terminal_id, tahun_ref = 2026 } = req.query;

    let query = supabase
      .from('swp_status_pekerja')
      .select('*')
      .eq('tahun_ref', tahun_ref)
      .order('urutan');

    if (terminal_id) query = query.eq('terminal_id', terminal_id);

    const { data, error } = await query;
    if (error) throw error;

    // Hitung total
    const total = data.reduce(
      (acc, row) => ({
        rkap: acc.rkap + (row.rkap || 0),
        realisasi: acc.realisasi + (row.realisasi || 0),
      }),
      { rkap: 0, realisasi: 0 }
    );

    res.json({ success: true, data, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createStatus = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('swp_status_pekerja')
      .insert(req.body)
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('swp_status_pekerja')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('swp_status_pekerja').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================================
// FETCH ALL (untuk initial load dashboard)
// ============================================================
export const fetchAll = async (req, res) => {
  try {
    const { terminal_id, tahun_ref = 2026 } = req.query;

    const filters = { tahun_ref };
    if (terminal_id) filters.terminal_id = terminal_id;

    const [kinerjaRes, fasilitasRes, shiftRes, sdmRes, statusRes] = await Promise.all([
      supabase.from('swp_kinerja').select('*').match(filters).order('urutan'),
      supabase.from('swp_fasilitas').select('*').match(filters).order('urutan'),
      supabase.from('swp_shift').select('*').match(filters).order('urutan'),
      supabase.from('swp_sdm_structure').select('*').match(filters).order('urutan'),
      supabase.from('swp_status_pekerja').select('*').match(filters).order('urutan'),
    ]);

    // Process kinerja
    const kinerjaGrouped = { keuangan: [], operasional: [], sdm: [] };
    (kinerjaRes.data || []).forEach(r => {
      if (kinerjaGrouped[r.category]) kinerjaGrouped[r.category].push(r);
    });

    // Process SDM tree
    const sdmTree = buildTree(sdmRes.data || []).map(calcTreeTotals);

    res.json({
      success: true,
      data: {
        kinerja: kinerjaGrouped,
        periodColumns: extractPeriodColumns(kinerjaRes.data || []),
        fasilitas: fasilitasRes.data || [],
        shift: shiftRes.data || [],
        sdm: sdmTree,
        status: statusRes.data || [],
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
