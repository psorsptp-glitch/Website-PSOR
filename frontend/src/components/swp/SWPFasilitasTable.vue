<template>
  <!-- SWPFasilitasTable.vue -->
  <div class="fasilitas-wrap">
    <div class="fasilitas-toolbar">
      <button class="btn btn-primary" @click="openAdd">+ Tambah Item</button>
      <button class="btn btn-outline" @click="exportExcel">↓ Export</button>
    </div>

    <div class="table-scroll-wrap">
      <table class="swp-table">
        <thead>
          <tr>
            <th class="th-left" rowspan="2">Fasilitas & Alat</th>
            <th colspan="3">Jumlah Alat (Unit)</th>
            <th rowspan="2">Keterangan</th>
            <th rowspan="2">Aksi</th>
          </tr>
          <tr>
            <th>Eksisting</th>
            <th>Beroperasi</th>
            <th>Rencana Relokasi / Investasi</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(items, kategori) in store.fasilitasGrouped" :key="kategori">
            <!-- Category header -->
            <tr class="row-kategori">
              <td colspan="6" class="td-kategori">
                <button class="toggle-btn" @click="toggleKategori(kategori)">
                  {{ displayExpanded.has(kategori) ? '▾' : '▸' }}
                </button>
                <strong>{{ kategori }}</strong>
                <span class="kategori-count">({{ items.length }} item)</span>
                <button class="btn-icon-sm" @click="openAdd(kategori)" title="Tambah ke kategori ini">➕</button>
              </td>
            </tr>

            <!-- Items -->
            <template v-if="displayExpanded.has(kategori)">
              <tr v-for="row in items" :key="row.id" :class="{ 'row-editing': editingId === row.id }">
                <td class="td-nama">
                  <template v-if="editingId === row.id">
                    <input v-model="editForm.nama_item" class="cell-input" />
                  </template>
                  <template v-else>{{ row.nama_item }}</template>
                </td>
                <td class="col-num">
                  <template v-if="editingId === row.id">
                    <input v-model.number="editForm.existing" type="number" class="cell-input cell-input--sm" />
                  </template>
                  <template v-else>{{ row.existing ?? '-' }}</template>
                </td>
                <td class="col-num">
                  <template v-if="editingId === row.id">
                    <input v-model.number="editForm.beroperasi" type="number" class="cell-input cell-input--sm" />
                  </template>
                  <template v-else>{{ row.beroperasi ?? '-' }}</template>
                </td>
                <td class="col-num">
                  <template v-if="editingId === row.id">
                    <input v-model.number="editForm.rencana_relokasi" type="number" class="cell-input cell-input--sm" />
                  </template>
                  <template v-else>{{ row.rencana_relokasi ?? '-' }}</template>
                </td>
                <td>
                  <template v-if="editingId === row.id">
                    <input v-model="editForm.keterangan" class="cell-input" />
                  </template>
                  <template v-else>{{ row.keterangan || '' }}</template>
                </td>
                <!-- Actions -->
                <td class="col-actions">
                <template v-if="editingId === row.id">
                    <button class="btn-icon btn-save" title="Simpan" @click="saveEdit(row)">✓</button>
                    <button class="btn-icon btn-cancel" title="Batal" @click="cancelEdit">✕</button>
                </template>
                <template v-else>
                    <button class="btn-icon btn-edit" title="Edit" @click="startEdit(row)">
                    <img :src="editIcon" alt="Edit" class="action-icon" />
                    </button>
                    <button class="btn-icon btn-del" title="Hapus" @click="confirmDelete(row)">
                    <img :src="trashIcon" alt="Hapus" class="action-icon" />
                    </button>
                </template>
                </td>
              </tr>
            </template>
          </template>

          <tr v-if="Object.keys(store.fasilitasGrouped).length === 0">
            <td colspan="6" class="empty-row">Belum ada data fasilitas.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ADD MODAL -->
    <Teleport to="body">
      <div v-if="showAdd" class="modal-backdrop" @click.self="showAdd = false">
        <div class="modal">
          <div class="modal__header">
            <h3>Tambah Fasilitas / Alat</h3>
            <button @click="showAdd = false">✕</button>
          </div>
          <div class="modal__body">
            <div class="form-group">
              <label>Kategori *</label>
              <input v-model="addForm.kategori" class="form-input" placeholder="cth: Fasilitas & Alat Dermaga" />
            </div>
            <div class="form-group">
              <label>Nama Item *</label>
              <input v-model="addForm.nama_item" class="form-input" placeholder="cth: Jumlah Tambatan" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Eksisting</label>
                <input v-model.number="addForm.existing" type="number" class="form-input" min="0" />
              </div>
              <div class="form-group">
                <label>Beroperasi</label>
                <input v-model.number="addForm.beroperasi" type="number" class="form-input" min="0" />
              </div>
              <div class="form-group">
                <label>Rencana Relokasi/Investasi</label>
                <input v-model.number="addForm.rencana_relokasi" type="number" class="form-input" min="0" />
              </div>
            </div>
            <div class="form-group">
              <label>Keterangan</label>
              <input v-model="addForm.keterangan" class="form-input" />
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

    <!-- DELETE CONFIRM -->
    <Teleport to="body">
      <div v-if="deleteTarget" class="modal-backdrop" @click.self="deleteTarget = null">
        <div class="modal modal--sm">
          <div class="modal__header"><h3>Hapus Item</h3></div>
          <div class="modal__body"><p>Yakin hapus <strong>{{ deleteTarget.nama_item }}</strong>?</p></div>
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
import editIcon from '@/assets/img/edit.png';
import trashIcon from '@/assets/img/trash.png';

const store = useSwpStore();
const toast = useToast();

// Expand semua kategori by default (computed, reactive)
const expandedKategori = computed(() => {
  return new Set(Object.keys(store.fasilitasGrouped));
});

// Kelola expanded categories secara manual
const manualExpanded = ref(new Set());

function toggleKategori(k) {
  if (manualExpanded.value.has(k)) {
    manualExpanded.value.delete(k);
  } else {
    manualExpanded.value.add(k);
  }
}

// Gunakan manual expanded jika ada, otherwise show semua
const displayExpanded = computed(() => {
  if (manualExpanded.value.size > 0) return manualExpanded.value;
  return expandedKategori.value; // Default: semua terbuka
});

// Edit
const editingId = ref(null);
const editForm = ref({});

function startEdit(row) {
  editingId.value = row.id;
  editForm.value = { ...row };
}
function cancelEdit() { editingId.value = null; editForm.value = {}; }
async function saveEdit(row) {
  try {
    await store.updateFasilitas(row.id, editForm.value);
    toast.success('Data fasilitas berhasil diperbarui');
    cancelEdit();
  } catch (e) {
    toast.error('Gagal: ' + (e.message || 'Error tidak diketahui'));
  }
}

// Add
const showAdd = ref(false);
const saving = ref(false);
const addForm = ref({});

function openAdd(kategori = '') {
  addForm.value = { kategori: kategori || '', nama_item: '', existing: 0, beroperasi: 0, rencana_relokasi: 0, keterangan: '', urutan: 0 };
  showAdd.value = true;
}

async function submitAdd() {
  if (!addForm.value.nama_item) {
    toast.error('Nama item wajib diisi!');
    return;
  }
  saving.value = true;
  try {
    await store.createFasilitas(addForm.value);
    toast.success('Item fasilitas berhasil ditambahkan');
    showAdd.value = false;
    manualExpanded.value.add(addForm.value.kategori);
  } catch (e) { 
    toast.error('Gagal: ' + (e.message || 'Error tidak diketahui'));
  }
  finally { saving.value = false; }
}

// Delete
const deleteTarget = ref(null);
function confirmDelete(row) { deleteTarget.value = row; }
async function doDelete() {
  try {
    await store.deleteFasilitas(deleteTarget.value.id);
    toast.success('Item fasilitas berhasil dihapus');
    deleteTarget.value = null;
  } catch (e) {
    toast.error('Gagal: ' + (e.message || 'Error tidak diketahui'));
  }
}

// Export
async function exportExcel() {
  try {
    const XLSX = await import('xlsx');
    const rows = store.fasilitas.map(r => ({
      Kategori: r.kategori, 'Nama Item': r.nama_item,
      Eksisting: r.existing, Beroperasi: r.beroperasi,
      'Rencana Relokasi': r.rencana_relokasi, Keterangan: r.keterangan
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Fasilitas');
    XLSX.writeFile(wb, `SWP_Fasilitas_${store.selectedTahun}.xlsx`);
    toast.success('File berhasil diexport');
  } catch (e) { 
    toast.error('Export gagal: npm install xlsx');
  }
}
</script>

<style scoped>
.fasilitas-wrap { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
.fasilitas-toolbar { display: flex; gap: 10px; padding: 12px 16px; border-bottom: 1px solid #e2e8f0; }
.table-scroll-wrap { overflow-x: auto; overflow-y: auto; }

.swp-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.swp-table thead { position: sticky; top: 0; z-index: 10; }
.swp-table th { background: #1e3a5f; color: white; padding: 8px 10px; text-align: center; border: 1px solid #2d4a7a; white-space: nowrap; }
.th-left { text-align: left; }
.swp-table td { padding: 7px 10px; border: 1px solid #e2e8f0; vertical-align: middle; }
.swp-table tr:hover td { background: #f0f6ff; }

.row-kategori td { background: #f0f4ff !important; border-color: #c7d2fe; }
.td-kategori { display: flex; align-items: center; gap: 8px; text-align: left; }
.kategori-count { font-size: 11px; color: #94a3b8; font-weight: 400; }
.btn-icon-sm { background: none; border: none; cursor: pointer; font-size: 12px; padding: 2px; color: #3b82f6; }

.td-nama { min-width: 200px; text-align: left; }
.col-num { text-align: center; min-width: 100px; }
.col-actions { text-align: center; white-space: nowrap; }
.row-editing td { background: #fefce8 !important; }
.empty-row { text-align: center; padding: 40px; color: #94a3b8; }

.btn { padding: 7px 14px; border-radius: 6px; font-size: 13px; cursor: pointer; border: none; font-weight: 500; }
.btn-primary { background: #2563eb; color: white; }
.btn-primary:hover { background: #1d4ed8; }
.btn-primary:disabled { opacity: 0.5; }
.btn-outline { background: white; color: #374151; border: 1px solid #d1d5db; }
.btn-danger { background: #ef4444; color: white; }

.cell-input { width: 100%; padding: 4px 6px; border: 1px solid #3b82f6; border-radius: 4px; font-size: 12px; box-sizing: border-box; }
.cell-input--sm { max-width: 75px; text-align: center; }
.btn-icon { background: none; border: none; cursor: pointer; font-size: 14px; padding: 2px 4px; border-radius: 3px; }
.btn-save { color: #16a34a; }
.btn-save:hover { background: #dcfce7; }
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
