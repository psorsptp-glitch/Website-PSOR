<template>
  <!-- SWPSDMTreeTable.vue -->
  <div class="sdm-wrap">
    <!-- Toolbar -->
    <div class="sdm-toolbar">
      <button class="btn btn-primary" @click="openAddModal(null)">+ Tambah Nomenklatur</button>
      <button class="btn btn-outline" @click="toggleAll">
        {{ allExpanded ? '⊟ Tutup Semua' : '⊞ Buka Semua' }}
      </button>
      <button class="btn btn-outline" @click="exportExcel">↓ Export Excel</button>
      <div class="sdm-toolbar__stats" v-if="store.sdmGrandTotal.jumlah !== undefined">
        Total SDM:
        <span class="stat-chip stat-existing">{{ store.sdmGrandTotal.jumlah }} Existing</span>
        <span class="stat-chip stat-ideal">{{ store.sdmGrandTotal.ideal }} Ideal</span>
        <span class="stat-chip" :class="store.sdmGrandTotal.selisih_ideal >= 0 ? 'stat-surplus' : 'stat-deficit'">
          {{ store.sdmGrandTotal.selisih_ideal >= 0 ? '+' : '' }}{{ store.sdmGrandTotal.selisih_ideal }} Selisih
        </span>
      </div>
    </div>

    <!-- TABLE SCROLL WRAPPER -->
    <div class="table-scroll-wrap">
      <table class="swp-table sdm-table">
        <colgroup>
          <col style="min-width: 260px" />
          <col style="min-width: 80px" />
          <col style="min-width: 75px" />
          <col style="min-width: 75px" />
          <col style="min-width: 75px" />
          <col style="min-width: 75px" />
          <col style="min-width: 80px" />
          <col style="min-width: 80px" />
          <col style="min-width: 80px" />
          <col style="min-width: 85px" />
          <col style="min-width: 80px" />
          <col style="min-width: 80px" />
          <col style="min-width: 150px" />
          <col style="min-width: 180px" />
          <col style="min-width: 90px" />
        </colgroup>
        <thead>
          <tr>
            <th rowspan="3" class="th-left">Nomenklatur / Jabatan</th>
            <th rowspan="3">Jumlah Alat (Unit)</th>
            <th colspan="2">Jumlah SDM (Orang)</th>
            <th colspan="5">Eksisting</th>
            <th rowspan="3">Jumlah</th>
            <th colspan="2">Selisih</th>
            <th rowspan="3">Keterangan</th>
            <th rowspan="3">Keterangan setelah bahas dengan operasi</th>
            <th rowspan="3">Aksi</th>
          </tr>
          <tr>
            <th rowspan="2">Ideal</th>
            <th rowspan="2">Min Req</th>
            <th rowspan="2">Shift</th>
            <th rowspan="2">Group</th>
            <th rowspan="2">Organik</th>
            <th rowspan="2">TAD</th>
            <th rowspan="2">Pemborongan</th>
            <th rowspan="2">Eks - Ideal</th>
            <th rowspan="2">Eks - Min</th>
          </tr>
        </thead>
        <tbody>
          <!-- Tree rendering (recursive) -->
          <template v-for="node in store.sdm" :key="node.id">
            <SDMTreeRow
              :node="node"
              :depth="0"
              :expanded-ids="expandedIds"
              :editing-id="editingId"
              :edit-form="editForm"
              @toggle="toggleNode"
              @start-edit="startEdit"
              @save-edit="saveEdit"
              @cancel-edit="cancelEdit"
              @add-child="openAddModal"
              @delete="confirmDelete"
            />
          </template>

          <!-- Grand Total Row -->
          <tr class="total-row" v-if="store.sdm.length > 0">
            <td class="th-left"><strong>TOTAL</strong></td>
            <td></td>
            <td class="col-num"><strong>{{ store.sdmGrandTotal.ideal }}</strong></td>
            <td class="col-num"><strong>{{ store.sdmGrandTotal.min_req }}</strong></td>
            <td class="col-num"></td>
            <td class="col-num"></td>
            <td class="col-num"><strong>{{ store.sdmGrandTotal.organik }}</strong></td>
            <td class="col-num"><strong>{{ store.sdmGrandTotal.tad }}</strong></td>
            <td class="col-num"><strong>{{ store.sdmGrandTotal.pemborongan }}</strong></td>
            <td class="col-num"><strong>{{ store.sdmGrandTotal.jumlah }}</strong></td>
            <td class="col-num" :class="selisihClass(store.sdmGrandTotal.selisih_ideal)">
              <strong>{{ fmtSelisih(store.sdmGrandTotal.selisih_ideal) }}</strong>
            </td>
            <td class="col-num" :class="selisihClass(store.sdmGrandTotal.selisih_min)">
              <strong>{{ fmtSelisih(store.sdmGrandTotal.selisih_min) }}</strong>
            </td>
            <td></td>
            <td></td>
            <td></td>
          </tr>

          <tr v-if="store.sdm.length === 0">
            <td colspan="15" class="empty-row">Belum ada data SDM. Tambah Nomenklatur untuk memulai.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ADD MODAL -->
    <Teleport to="body">
      <div v-if="showAddModal" class="modal-backdrop" @click.self="showAddModal = false">
        <div class="modal">
          <div class="modal__header">
            <h3>{{ addForm.parent_id ? 'Tambah Jabatan (Sub)' : 'Tambah Nomenklatur' }}</h3>
            <button @click="showAddModal = false">✕</button>
          </div>
          <div class="modal__body">
            <div class="form-group">
              <label>Kategori *</label>
              <input v-model="addForm.kategori" class="form-input" placeholder="cth: Manajemen, Operasional, Support..." />
            </div>
            <div class="form-group">
              <label>Nama Jabatan *</label>
              <input v-model="addForm.nama_jabatan" class="form-input" placeholder="cth: Struktural, Terminal Head..." />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Jumlah Alat</label>
                <input v-model.number="addForm.jumlah_alat" type="number" class="form-input" min="0" />
              </div>
              <div class="form-group">
                <label>Urutan</label>
                <input v-model.number="addForm.urutan" type="number" class="form-input" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Ideal</label>
                <input v-model.number="addForm.ideal" type="number" class="form-input" min="0" />
              </div>
              <div class="form-group">
                <label>MinReq</label>
                <input v-model.number="addForm.min_req" type="number" class="form-input" min="0" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Organik</label>
                <input v-model.number="addForm.organik" type="number" class="form-input" min="0" />
              </div>
              <div class="form-group">  
                <label>TAD</label>
                <input v-model.number="addForm.tad" type="number" class="form-input" min="0" />
              </div>
              <div class="form-group">
                <label>Pemborongan</label>
                <input v-model.number="addForm.pemborongan" type="number" class="form-input" min="0" />
              </div>
            </div>
            <div class="form-group">
              <label>Keterangan</label>
              <textarea v-model="addForm.keterangan" class="form-input" rows="2"></textarea>
            </div>
          </div>
          <div class="modal__footer">
            <button class="btn btn-outline" @click="showAddModal = false">Batal</button>
            <button class="btn btn-primary" @click="submitAdd" :disabled="saving">
              {{ saving ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- DELETE CONFIRM -->
    <Teleport to="body">
      <div v-if="deleteTarget" class="modal-backdrop" @click.self="deleteTarget = null">
        <div class="modal modal--sm">
          <div class="modal__header"><h3>Hapus Jabatan</h3></div>
          <div class="modal__body">
            <p>Yakin hapus <strong>{{ deleteTarget.nama_jabatan }}</strong>?</p>
            <p class="text-warn" v-if="deleteTarget.children?.length">
              ⚠️ Jabatan ini memiliki {{ deleteTarget.children.length }} sub-jabatan yang juga akan terhapus!
            </p>
          </div>
          <div class="modal__footer">
            <button class="btn btn-outline" @click="deleteTarget = null">Batal</button>
            <button class="btn btn-danger" @click="doDelete">Hapus</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useSwpStore } from '@/stores/swp.store';
import { useToast } from '@/composables/useToast.js';
import SDMTreeRow from './SDMTreeRow.vue';
import editIcon from '@/assets/img/edit.png';
import trashIcon from '@/assets/img/trash.png';

const store = useSwpStore();
const toast = useToast();

// ── EXPAND / COLLAPSE ─────────────────────────────────────
const expandedIds = ref(new Set(store.sdm.map(n => n.id)));
const allExpanded = computed(() => store.sdm.every(n => expandedIds.value.has(n.id)));

function toggleNode(id) {
  if (expandedIds.value.has(id)) {
    expandedIds.value.delete(id);
  } else {
    expandedIds.value.add(id);
  }
}

function toggleAll() {
  if (allExpanded.value) {
    expandedIds.value.clear();
  } else {
    store.sdm.forEach(n => expandedIds.value.add(n.id));
  }
}

// ── EDIT ─────────────────────────────────────────────────
const editingId = ref(null);
const editForm = ref({});

function startEdit(node) {
  editingId.value = node.id;
  editForm.value = {
    nama_jabatan: node.nama_jabatan,
    jumlah_alat: node.jumlah_alat,
    ideal: node.ideal,
    min_req: node.min_req,
    shift: node.shift,
    group_count: node.group_count,
    organik: node.organik,
    tad: node.tad,
    pemborongan: node.pemborongan,
    keterangan: node.keterangan,
    keterangan_lanjutan: node.keterangan_lanjutan,
  };
}

function cancelEdit() { editingId.value = null; editForm.value = {}; }

async function saveEdit(node) {
  try {
    await store.updateSDM(node.id, editForm.value);
    toast.success('Data berhasil diperbarui');
    cancelEdit();
  } catch (e) {
    toast.error('Gagal memperbarui: ' + (e.message || 'Error tidak diketahui'));
  }
}

// ── ADD MODAL ─────────────────────────────────────────────
const showAddModal = ref(false);
const saving = ref(false);
const addForm = ref({});

function openAddModal(parentNode) {
  addForm.value = {
    parent_id: parentNode?.id || null,
    level: parentNode ? 1 : 0,
    kategori: '',
    nama_jabatan: '',
    jumlah_alat: 0, ideal: 0, min_req: 0,
    shift: 0, group_count: 0,
    organik: 0, tad: 0, pemborongan: 0,
    keterangan: '', keterangan_lanjutan: '',
    urutan: 0,
  };
  showAddModal.value = true;
}

async function submitAdd() {
  if (!addForm.value.nama_jabatan) {
    toast.error('Nama jabatan wajib diisi!');
    return;
  }
  saving.value = true;
  try {
    await store.createSDM(addForm.value);
    toast.success('Data SDM berhasil ditambahkan');
    showAddModal.value = false;
    // Auto-expand parent
    if (addForm.value.parent_id) {
      expandedIds.value.add(addForm.value.parent_id);
    }
  } catch (e) {
    toast.error('Gagal menambahkan SDM: ' + (e.message || 'Error tidak diketahui'));
  } finally {
    saving.value = false;
  }
}

// ── DELETE ────────────────────────────────────────────────
const deleteTarget = ref(null);
function confirmDelete(node) { deleteTarget.value = node; }
async function doDelete() {
  try {
    await store.deleteSDM(deleteTarget.value.id);
    toast.success('Data SDM berhasil dihapus');
    deleteTarget.value = null;
  } catch (e) {
    toast.error('Gagal menghapus: ' + (e.message || 'Error tidak diketahui'));
  }
}

// ── HELPERS ───────────────────────────────────────────────
function selisihClass(val) {
  if (!val && val !== 0) return '';
  if (val >= 0) return 'selisih-surplus';
  return 'selisih-deficit';
}

function fmtSelisih(val) {
  if (val === null || val === undefined) return '-';
  return val >= 0 ? `+${val}` : val;
}

// Export Excel
async function exportExcel() {
  try {
    const XLSX = await import('xlsx');
    // Flatten tree for export
    const rows = [];
    function flatten(nodes, indent = '') {
      nodes.forEach(n => {
        rows.push({
          Jabatan: indent + n.nama_jabatan,
          'Jumlah Alat': n.jumlah_alat,
          Ideal: n.ideal,
          'Min Req': n.min_req,
          Shift: n.shift,
          Group: n.group_count,
          Organik: n.organik,
          TAD: n.tad,
          Pemborongan: n.pemborongan,
          Jumlah: n.jumlah,
          'Selisih Ideal': n.selisih_ideal,
          'Selisih Min': n.selisih_min,
          Keterangan: n.keterangan,
          'Keterangan Operasi': n.keterangan_lanjutan,
        });
        if (n.children?.length) flatten(n.children, indent + '  ');
      });
    }
    flatten(store.sdm);
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Struktur SDM');
    XLSX.writeFile(wb, `SWP_SDM_${store.selectedTahun}.xlsx`);
    toast.success('File berhasil diexport');
  } catch (e) {
    toast.error('Export gagal: ' + (e.message || 'npm install xlsx'));
  }
}
</script>

<style scoped>
.sdm-wrap { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }

.sdm-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  flex-wrap: wrap;
}
.sdm-toolbar__stats { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #64748b; margin-left: auto; }

.stat-chip { padding: 3px 10px; border-radius: 12px; font-weight: 600; font-size: 11px; }
.stat-existing { background: #e0f2fe; color: #0369a1; }
.stat-ideal { background: #dcfce7; color: #15803d; }
.stat-surplus { background: #dcfce7; color: #15803d; }
.stat-deficit { background: #fee2e2; color: #dc2626; }

.table-scroll-wrap { overflow-x: auto; overflow-y: auto; }

.sdm-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.sdm-table thead { position: sticky; top: 0; z-index: 10; }
.sdm-table th {
  background: #1e3a5f; color: white; padding: 7px 8px;
  text-align: center; font-weight: 600; border: 1px solid #2d4a7a;
  white-space: nowrap;
}
.th-left { text-align: left; min-width: 260px; }
.th-num-row { background: #2d4a7a !important; font-size: 10px; color: #93c5fd; }

.total-row { background: #1e3a5f !important; color: white !important; }
.total-row td { border: 1px solid #2d4a7a; padding: 7px 8px; text-align: center; }
.total-row .th-left { text-align: left; }

.col-num { text-align: center; }
.selisih-surplus { color: #16a34a; font-weight: 600; }
.selisih-deficit { color: #dc2626; font-weight: 600; }
.empty-row { text-align: center; padding: 40px; color: #94a3b8; font-style: italic; }
.text-warn { color: #d97706; font-size: 13px; margin-top: 8px; }

/* Buttons (shared) */
.btn { padding: 7px 14px; border-radius: 6px; font-size: 13px; cursor: pointer; border: none; font-weight: 500; transition: all 0.2s; }
.btn-primary { background: #2563eb; color: white; }
.btn-primary:hover { background: #1d4ed8; }
.btn-primary:disabled { opacity: 0.5; }
.btn-outline { background: white; color: #374151; border: 1px solid #d1d5db; }
.btn-outline:hover { background: #f9fafb; }
.btn-danger { background: #ef4444; color: white; }

/* Modal */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: white; border-radius: 10px; width: 500px; max-width: 95vw; box-shadow: 0 20px 60px rgba(0,0,0,0.2); overflow: hidden; }
.modal--sm { width: 380px; }
.modal__header { background: #1e3a5f; color: white; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
.modal__header h3 { margin: 0; font-size: 15px; }
.modal__header button { background: none; border: none; color: white; cursor: pointer; font-size: 18px; }
.modal__body { padding: 20px; max-height: 60vh; overflow-y: auto; }
.modal__footer { padding: 12px 20px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 10px; }
.form-group { margin-bottom: 14px; }
.form-group label { display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 5px; }
.form-input { width: 100%; padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; box-sizing: border-box; outline: none; resize: vertical; }
.form-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.15); }
.form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; }
</style>
