<template>
  <!-- SWPStatusTable.vue -->
  <div class="status-wrap">
    <div class="status-toolbar">
      <button class="btn btn-primary" @click="openAdd">+ Tambah Kategori</button>
      <button class="btn btn-outline" @click="exportExcel">↓ Export</button>
      <div class="status-summary" v-if="store.statusTotal.rkap">
        <span class="summary-item">
          RKAP: <strong>{{ store.statusTotal.rkap?.toLocaleString('id-ID') }}</strong>
        </span>
        <span class="summary-item">
          Realisasi: <strong>{{ store.statusTotal.realisasi?.toLocaleString('id-ID') }}</strong>
        </span>
        <span class="summary-item" :class="pctClass">
          {{ pctRealisasi }}%
        </span>
      </div>
    </div>

    <div class="table-scroll-wrap">
      <table class="swp-table">
        <thead>
          <tr>
            <th class="th-left">Kategori Pekerja</th>
            <th>Satuan</th>
            <th>RKAP {{ store.selectedTahun }}</th>
            <th>Realisasi Bulan Berjalan</th>
            <th>% Realisasi</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in store.status"
            :key="row.id"
            :class="{ 'row-editing': editingId === row.id, 'row-total': row.kategori === 'Total' }"
          >
            <td class="td-kategori">
              <template v-if="editingId === row.id">
                <input v-model="editForm.kategori" class="cell-input cell-input--wide" />
              </template>
              <template v-else>{{ row.kategori }}</template>
            </td>
            <td class="col-center">
              <template v-if="editingId === row.id">
                <input v-model="editForm.satuan" class="cell-input cell-input--sm" />
              </template>
              <template v-else>{{ row.satuan }}</template>
            </td>
            <td class="col-num">
              <template v-if="editingId === row.id">
                <input v-model.number="editForm.rkap" type="number" class="cell-input cell-input--sm" />
              </template>
              <template v-else>{{ row.rkap?.toLocaleString('id-ID') || '-' }}</template>
            </td>
            <td class="col-num">
              <template v-if="editingId === row.id">
                <input v-model.number="editForm.realisasi" type="number" class="cell-input cell-input--sm" />
              </template>
              <template v-else>{{ row.realisasi?.toLocaleString('id-ID') || '-' }}</template>
            </td>
            <!-- % Realisasi (auto) -->
            <td class="col-num" :class="pctRowClass(row)">
              {{ calcPct(row.realisasi, row.rkap) }}
            </td>
            <td class="col-actions">
              <template v-if="editingId === row.id">
                <button class="btn-icon btn-save" @click="saveEdit(row)">✓</button>
                <button class="btn-icon btn-cancel" @click="cancelEdit">✕</button>
              </template>
              <template v-else>
                <button class="btn-icon" @click="startEdit(row)">✏️</button>
                <button class="btn-icon" @click="confirmDelete(row)">🗑️</button>
              </template>
            </td>
          </tr>

          <!-- Total row -->
          <tr class="row-total" v-if="store.status.length > 0">
            <td class="td-kategori"><strong>Total</strong></td>
            <td class="col-center">Orang</td>
            <td class="col-num"><strong>{{ store.statusTotal.rkap?.toLocaleString('id-ID') }}</strong></td>
            <td class="col-num"><strong>{{ store.statusTotal.realisasi?.toLocaleString('id-ID') }}</strong></td>
            <td class="col-num" :class="pctClass"><strong>{{ pctRealisasi }}%</strong></td>
            <td></td>
          </tr>

          <tr v-if="store.status.length === 0">
            <td colspan="6" class="empty-row">Belum ada data status pekerja.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Shift Kerja (shown below status table) -->
    <div class="shift-section">
      <div class="section-header">
        <h4>📅 Shift Kerja</h4>
        <button class="btn btn-outline btn-sm" @click="openAddShift">+ Tambah Shift</button>
      </div>
      <table class="swp-table shift-table">
        <thead>
          <tr>
            <th>Shift</th>
            <th>Jam Kerja</th>
            <th>Keterangan</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in store.shift" :key="s.id" :class="{ 'row-editing': editingShiftId === s.id }">
            <td>
              <template v-if="editingShiftId === s.id">
                <input v-model="shiftForm.nama_shift" class="cell-input" />
              </template>
              <template v-else><strong>{{ s.nama_shift }}</strong></template>
            </td>
            <td>
              <template v-if="editingShiftId === s.id">
                <input v-model="shiftForm.jam_kerja" class="cell-input" placeholder="cth: 07.00 - 15.00" />
              </template>
              <template v-else>{{ s.jam_kerja || '-' }}</template>
            </td>
            <td>
              <template v-if="editingShiftId === s.id">
                <input v-model="shiftForm.keterangan" class="cell-input" />
              </template>
              <template v-else>{{ s.keterangan || '' }}</template>
            </td>
            <td class="col-actions">
              <template v-if="editingShiftId === s.id">
                <button class="btn-icon btn-save" @click="saveShift(s)">✓</button>
                <button class="btn-icon btn-cancel" @click="cancelShift">✕</button>
              </template>
              <template v-else>
                <button class="btn-icon" @click="startShift(s)">✏️</button>
                <button class="btn-icon" @click="deleteShift(s)">🗑️</button>
              </template>
            </td>
          </tr>
          <tr v-if="store.shift.length === 0">
            <td colspan="4" class="empty-row">Belum ada data shift kerja.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ADD STATUS MODAL -->
    <Teleport to="body">
      <div v-if="showAdd" class="modal-backdrop" @click.self="showAdd = false">
        <div class="modal">
          <div class="modal__header">
            <h3>Tambah Kategori Pekerja</h3>
            <button @click="showAdd = false">✕</button>
          </div>
          <div class="modal__body">
            <div class="form-group">
              <label>Kategori *</label>
              <select v-model="addForm.kategori" class="form-input">
                <option value="">-- Pilih atau ketik baru --</option>
                <option v-for="k in defaultKategori" :key="k" :value="k">{{ k }}</option>
              </select>
              <input v-if="addForm.kategori === '_custom'" v-model="addForm.kategoriCustom" class="form-input" style="margin-top:8px" placeholder="Ketik nama kategori..." />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Satuan</label>
                <input v-model="addForm.satuan" class="form-input" value="Orang" />
              </div>
              <div class="form-group">
                <label>RKAP {{ store.selectedTahun }}</label>
                <input v-model.number="addForm.rkap" type="number" class="form-input" min="0" />
              </div>
              <div class="form-group">
                <label>Realisasi</label>
                <input v-model.number="addForm.realisasi" type="number" class="form-input" min="0" />
              </div>
            </div>
          </div>
          <div class="modal__footer">
            <button class="btn btn-outline" @click="showAdd = false">Batal</button>
            <button class="btn btn-primary" @click="submitAdd" :disabled="saving">
              {{ saving ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ADD SHIFT MODAL -->
    <Teleport to="body">
      <div v-if="showAddShiftModal" class="modal-backdrop" @click.self="showAddShiftModal = false">
        <div class="modal modal--sm">
          <div class="modal__header">
            <h3>Tambah Shift Kerja</h3>
            <button @click="showAddShiftModal = false">✕</button>
          </div>
          <div class="modal__body">
            <div class="form-group">
              <label>Nama Shift *</label>
              <input v-model="newShift.nama_shift" class="form-input" placeholder="cth: Shift I" />
            </div>
            <div class="form-group">
              <label>Jam Kerja</label>
              <input v-model="newShift.jam_kerja" class="form-input" placeholder="cth: 07.00 - 15.00" />
            </div>
            <div class="form-group">
              <label>Keterangan</label>
              <input v-model="newShift.keterangan" class="form-input" />
            </div>
          </div>
          <div class="modal__footer">
            <button class="btn btn-outline" @click="showAddShiftModal = false">Batal</button>
            <button class="btn btn-primary" @click="submitShift">Simpan</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- DELETE CONFIRM -->
    <Teleport to="body">
      <div v-if="deleteTarget" class="modal-backdrop" @click.self="deleteTarget = null">
        <div class="modal modal--sm">
          <div class="modal__header"><h3>Hapus</h3></div>
          <div class="modal__body"><p>Yakin hapus <strong>{{ deleteTarget.kategori }}</strong>?</p></div>
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
import editIcon from '@/assets/img/edit.png';
import trashIcon from '@/assets/img/trash.png';

const store = useSwpStore();

// ── HELPERS ───────────────────────────────────────────────
function calcPct(realisasi, rkap) {
  if (!rkap || rkap === 0) return '-';
  return ((realisasi / rkap) * 100).toFixed(1) + '%';
}

const pctRealisasi = computed(() => {
  const { rkap, realisasi } = store.statusTotal;
  if (!rkap) return '0';
  return ((realisasi / rkap) * 100).toFixed(1);
});

const pctClass = computed(() => {
  const p = parseFloat(pctRealisasi.value);
  if (p >= 100) return 'pct-good';
  if (p >= 80) return 'pct-warn';
  return 'pct-bad';
});

function pctRowClass(row) {
  if (!row.rkap) return '';
  const p = (row.realisasi / row.rkap) * 100;
  if (p >= 100) return 'pct-good';
  if (p >= 80) return 'pct-warn';
  return 'pct-bad';
}

// ── STATUS EDIT ───────────────────────────────────────────
const editingId = ref(null);
const editForm = ref({});

function startEdit(row) { editingId.value = row.id; editForm.value = { ...row }; }
function cancelEdit() { editingId.value = null; editForm.value = {}; }
async function saveEdit(row) {
  try { await store.updateStatus(row.id, editForm.value); cancelEdit(); }
  catch (e) { alert('Gagal: ' + e.message); }
}

// ── ADD STATUS ────────────────────────────────────────────
const showAdd = ref(false);
const saving = ref(false);
const addForm = ref({ kategori: '', satuan: 'Orang', rkap: 0, realisasi: 0, urutan: 0 });

const defaultKategori = [
  'BOD Pelindo (Penugasan)', 'BOD Non Pelindo', 'Organik Pelindo (Penugasan)',
  'Calon Pegawai (Organik Pelindo)', 'Organik Anak Perusahaan', 'Calon Pegawai (Organik Anper)',
  'PKWT', 'Tenaga Alih Daya', 'Tenaga Alih Daya (Security)',
  'Tenaga Alih Daya (Cleaning Service/OB/Petugas Kebersihan/Pertamanan)',
  'Pemborongan', 'Pemborongan (Security)',
  'Pemborongan (Cleaning Service/OB/Petugas Kebersihan/Pertamanan)',
  'TKHL', 'TKHL (Security)',
  'TKHL (Cleaning Service/OB/Petugas Kebersihan/Pertamanan)',
  'Pekerja Pemegang Saham Lainnya', '_custom'
];

function openAdd() {
  addForm.value = { kategori: '', satuan: 'Orang', rkap: 0, realisasi: 0, urutan: store.status.length };
  showAdd.value = true;
}

async function submitAdd() {
  const payload = { ...addForm.value };
  if (payload.kategori === '_custom') payload.kategori = payload.kategoriCustom;
  if (!payload.kategori) return alert('Kategori wajib diisi!');
  saving.value = true;
  try { await store.createStatus(payload); showAdd.value = false; }
  catch (e) { alert('Gagal: ' + e.message); }
  finally { saving.value = false; }
}

const deleteTarget = ref(null);
function confirmDelete(row) { deleteTarget.value = row; }
async function doDelete() {
  await store.deleteStatus(deleteTarget.value.id);
  deleteTarget.value = null;
}

// ── SHIFT ─────────────────────────────────────────────────
const editingShiftId = ref(null);
const shiftForm = ref({});
const showAddShiftModal = ref(false);
const newShift = ref({ nama_shift: '', jam_kerja: '', keterangan: '', urutan: 0 });

function startShift(s) { editingShiftId.value = s.id; shiftForm.value = { ...s }; }
function cancelShift() { editingShiftId.value = null; shiftForm.value = {}; }
async function saveShift(s) {
  try { await store.updateShift(s.id, shiftForm.value); cancelShift(); }
  catch (e) { alert('Gagal: ' + e.message); }
}
function openAddShift() {
  newShift.value = { nama_shift: '', jam_kerja: '', keterangan: '', urutan: store.shift.length };
  showAddShiftModal.value = true;
}
async function submitShift() {
  if (!newShift.value.nama_shift) return alert('Nama shift wajib!');
  await store.createShift(newShift.value);
  showAddShiftModal.value = false;
}
async function deleteShift(s) {
  if (confirm(`Hapus ${s.nama_shift}?`)) await store.deleteShift(s.id);
}

// ── EXPORT ────────────────────────────────────────────────
async function exportExcel() {
  try {
    const XLSX = await import('xlsx');
    const rows = store.status.map(r => ({
      Kategori: r.kategori, Satuan: r.satuan,
      [`RKAP ${store.selectedTahun}`]: r.rkap,
      Realisasi: r.realisasi,
      '% Realisasi': r.rkap ? ((r.realisasi / r.rkap) * 100).toFixed(1) + '%' : '-'
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Status Pekerja');
    XLSX.writeFile(wb, `SWP_Status_${store.selectedTahun}.xlsx`);
  } catch (e) { alert('Export gagal: npm install xlsx'); }
}
</script>

<style scoped>
.status-wrap { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
.status-toolbar { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-bottom: 1px solid #e2e8f0; flex-wrap: wrap; }
.status-summary { display: flex; gap: 16px; font-size: 13px; color: #64748b; margin-left: auto; align-items: center; }
.summary-item strong { color: #1e3a5f; }
.table-scroll-wrap { overflow-x: auto; overflow-y: auto; }

.swp-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.swp-table thead { position: sticky; top: 0; z-index: 5; }
.swp-table th { background: #1e3a5f; color: white; padding: 8px 12px; text-align: center; border: 1px solid #2d4a7a; white-space: nowrap; }
.th-left { text-align: left; }
.swp-table td { padding: 7px 12px; border: 1px solid #e2e8f0; vertical-align: middle; }
.swp-table tr:hover td { background: #f0f6ff; }
.row-total td { background: #1e3a5f !important; color: white !important; font-weight: 700; border-color: #2d4a7a; }
.row-editing td { background: #fefce8 !important; }

.td-kategori { text-align: left; min-width: 250px; }
.col-num { text-align: right; min-width: 100px; font-variant-numeric: tabular-nums; }
.col-center { text-align: center; }
.col-actions { text-align: center; white-space: nowrap; min-width: 70px; }

.pct-good { color: #16a34a; font-weight: 600; }
.pct-warn { color: #d97706; font-weight: 600; }
.pct-bad { color: #dc2626; font-weight: 600; }
.empty-row { text-align: center; padding: 32px; color: #94a3b8; }

/* Shift section */
.shift-section { border-top: 2px solid #e2e8f0; margin-top: 0; }
.section-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
.section-header h4 { margin: 0; font-size: 14px; color: #1e3a5f; }
.shift-table { font-size: 13px; }
.btn-sm { padding: 5px 10px; font-size: 12px; }

.btn { padding: 7px 14px; border-radius: 6px; font-size: 13px; cursor: pointer; border: none; font-weight: 500; }
.btn-primary { background: #2563eb; color: white; }
.btn-primary:hover { background: #1d4ed8; }
.btn-primary:disabled { opacity: 0.5; }
.btn-outline { background: white; color: #374151; border: 1px solid #d1d5db; }
.btn-danger { background: #ef4444; color: white; }

.cell-input { width: 100%; padding: 4px 6px; border: 1px solid #3b82f6; border-radius: 4px; font-size: 12px; box-sizing: border-box; }
.cell-input--wide { min-width: 200px; }
.cell-input--sm { max-width: 80px; text-align: center; }
.btn-icon { background: none; border: none; cursor: pointer; font-size: 14px; padding: 2px 4px; border-radius: 3px; }
.btn-save { color: #16a34a; }
.btn-cancel { color: #dc2626; }

.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: white; border-radius: 10px; width: 480px; max-width: 95vw; box-shadow: 0 20px 60px rgba(0,0,0,0.2); overflow: hidden; }
.modal--sm { width: 380px; }
.modal__header { background: #1e3a5f; color: white; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
.modal__header h3 { margin: 0; font-size: 15px; }
.modal__header button { background: none; border: none; color: white; cursor: pointer; font-size: 18px; }
.modal__body { padding: 20px; }
.modal__footer { padding: 12px 20px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 10px; }
.form-group { margin-bottom: 14px; }
.form-group label { display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 5px; }
.form-input { width: 100%; padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; box-sizing: border-box; }
.form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; }
</style>
