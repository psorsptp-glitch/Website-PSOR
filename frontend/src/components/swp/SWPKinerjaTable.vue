<template>
  <!-- SWPKinerjaTable.vue -->
  <div class="kinerja-wrap">
    <!-- Sub-tabs kategori -->
    <div class="kinerja-subtabs">
      <button
        v-for="cat in categories"
        :key="cat.key"
        class="kinerja-subtab"
        :class="{ active: activeCategory === cat.key }"
        @click="activeCategory = cat.key"
      >
        <span :style="{ color: cat.color }">{{ cat.icon }}</span>
        {{ cat.label }}
      </button>
    </div>

    <!-- Toolbar -->
    <div class="kinerja-toolbar">
      <button class="btn btn-primary" @click="openAddModal">+ Tambah Indikator</button>
      <button class="btn btn-outline" @click="exportExcel">↓ Export Excel</button>
      <div class="kinerja-toolbar__info">
        Tahun: <strong>{{ store.selectedTahun }}</strong>
        &nbsp;|&nbsp; 💡 Double-click cell realisasi bulan untuk input data
      </div>
    </div>

    <!-- TABLE -->
    <div class="table-scroll-wrap">
      <table class="swp-table">
        <thead>
          <!-- ROW 1: Group headers -->
          <tr class="thead-row-1">
            <th class="col-indikator th-sticky" rowspan="3">
              {{ currentCategory.label }}
            </th>
            <th class="col-num" rowspan="3">
              Realisasi<br />{{ store.selectedTahun - 1 }}
            </th>
            <th class="col-num" rowspan="3">
              RKAP<br />{{ store.selectedTahun }}
            </th>
            <th class="col-num" rowspan="3">
              Realisasi<br />{{ bulanSamaThTahunLalu }}
            </th>
            <th class="col-num" rowspan="3">
              Realisasi<br />{{ bulanSebelumnyaThIni }}
            </th>
            <th class="col-num" rowspan="3">
              {{ realisasiHeader }}
            </th>
            <!-- Trend -->
            <th colspan="3" class="col-group-trend">Trend</th>
            <th class="col-actions" rowspan="3">Aksi</th>
          </tr>

          <!-- ROW 2: Trend labels -->
          <tr class="thead-row-2">
            <th class="col-trend-sub">Realisasi (Bulan Saat ini) : RKAP (tahun saat ini)</th>
            <th class="col-trend-sub">Realisasi (Bulan Saat ini) : Realisasi (Bulan Terakhir)</th>
            <th class="col-trend-sub">Realisasi (Bulan Saat ini) : Realisasi (Bulan Saat ini, tahun lalu)</th>
          </tr>

          <!-- ROW 3: Nomor kolom -->
          <!-- <tr class="thead-row-3">
            <th class="col-num-label">4</th>
            <th class="col-num-label">16</th>
            <th class="col-num-label">17</th>
            <th class="col-num-label">18</th>
          </tr> -->
        </thead>

        <tbody>
          <tr
            v-for="row in currentRows"
            :key="row.id"
            :class="{ 'row-editing': editingId === row.id }"
          >
            <!-- Indikator -->
            <td class="col-indikator td-sticky">
              <template v-if="editingId === row.id">
                <input v-model="editForm.indikator" class="cell-input cell-input--wide" />
              </template>
              <template v-else>
                <span class="indikator-text">{{ row.indikator }}</span>
                <span v-if="row.satuan" class="indikator-unit">({{ row.satuan }})</span>
              </template>
            </td>

            <!-- Realisasi tahun lalu -->
            <td class="col-num">
              <template v-if="editingId === row.id">
                <input v-model.number="editForm.realisasi_tahun_lalu" type="number" class="cell-input" />
              </template>
              <template v-else>{{ fmt(row.realisasi_tahun_lalu) }}</template>
            </td>

            <!-- RKAP tahun ini -->
            <td class="col-num">
              <template v-if="editingId === row.id">
                <input v-model.number="editForm.rkap_tahun_ini" type="number" class="cell-input" />
              </template>
              <template v-else>{{ fmt(row.rkap_tahun_ini) }}</template>
            </td>

            <!-- Realisasi Bulan sama Tahun lalu -->
            <td
              class="col-num"
              @dblclick="startPeriodEditSamaThLalu(row)"
              :title="`Double-click edit ${bulanSamaThTahunLalu}`"
            >
              <template v-if="periodEditCellSamaThLalu === row.id">
                <input
                  v-model.number="periodEditValueSamaThLalu"
                  type="number"
                  class="cell-input cell-input--bulan"
                  @blur="onPeriodBlurSamaThLalu(row)"
                  @keyup.enter="onPeriodEnterSamaThLalu(row)"
                  @keyup.escape="cancelPeriodEditSamaThLalu"
                  v-focus
                />
              </template>
              <template v-else>
                <span :class="{ 'val-empty': !getBulanSamaThLaluValue(row) }">
                  {{ fmt(getBulanSamaThLaluValue(row)) }}
                </span>
              </template>
            </td>

            <!-- Realisasi Bulan sebelumnya Tahun ini -->
            <td
              class="col-num"
              @dblclick="startPeriodEditSebelumnya(row)"
              :title="`Double-click edit ${bulanSebelumnyaThIni}`"
            >
              <template v-if="periodEditCellSebelumnya === row.id">
                <input
                  v-model.number="periodEditValueSebelumnya"
                  type="number"
                  class="cell-input cell-input--bulan"
                  @blur="onPeriodBlurSebelumnya(row)"
                  @keyup.enter="onPeriodEnterSebelumnya(row)"
                  @keyup.escape="cancelPeriodEditSebelumnya"
                  v-focus
                />
              </template>
              <template v-else>
                <span :class="{ 'val-empty': !getBulanSebelumnyaThIniValue(row) }">
                  {{ fmt(getBulanSebelumnyaThIniValue(row)) }}
                </span>
              </template>
            </td>

            <!-- Realisasi Bulan ini -->
            <td
              class="col-num"
              @dblclick="startPeriodEdit(row)"
              :title="`Double-click edit ${store.selectedBulanLabel}`"
            >
              <template v-if="periodEditCell === row.id">
                <input
                  v-model.number="periodEditValue"
                  type="number"
                  class="cell-input cell-input--bulan"
                  @blur="onPeriodBlur(row)"
                  @keyup.enter="onPeriodEnter(row)"
                  @keyup.escape="cancelPeriodEdit"
                  v-focus
                />
              </template>
              <template v-else>
                <span :class="{ 'val-empty': !getSelectedBulanValue(row) }">
                  {{ fmt(getSelectedBulanValue(row)) }}
                </span>
              </template>
            </td>

            <!-- Trend 8: sd / tahun lalu -->
            <td class="col-num" :class="trendClass(calcTrend8(row))">
              {{ fmtTrend(calcTrend8(row)) }}
            </td>
            <!-- Trend 9: sd / bulan terakhir -->
            <td class="col-num" :class="trendClass(calcTrend9(row))">
              {{ fmtTrend(calcTrend9(row)) }}
            </td>
            <!-- Trend 10: sd / rkap -->
            <td class="col-num" :class="trendClass(calcTrend10(row))">
              {{ fmtTrend(calcTrend10(row)) }}
            </td>

            <!-- Actions -->
            <td class="col-actions">
              <template v-if="editingId === row.id">
                <button class="btn-icon btn-save" title="Simpan" @click="saveEdit(row)">✓</button>
                <button class="btn-icon btn-cancel" title="Batal" @click="cancelEdit">✕</button>
              </template>
              <template v-else>
                <button class="btn-icon btn-edit" title="Edit" @click="startEdit(row)">
                  <img src="../../assets/img/edit.png" alt="Edit" class="action-icon" />
                </button>
                <button class="btn-icon btn-del" title="Hapus" @click="confirmDelete(row)">
                  <img src="../../assets/img/trash.png" alt="Hapus" class="action-icon" />
                </button>
              </template>
            </td>
          </tr>

          <!-- Empty state -->
          <tr v-if="currentRows.length === 0">
            <td colspan="11" class="empty-row">
              Belum ada data. Klik "+ Tambah Indikator" untuk menambahkan.
            </td>
          </tr>
        </tbody>

        <!-- FOOTER TOTAL -->
        <tfoot v-if="currentRows.length > 0">
          <tr class="tfoot-total">
            <td class="td-sticky" style="text-align:left"><strong>TOTAL</strong></td>
            <td class="col-num"><strong>{{ fmt(sumCol('realisasi_tahun_lalu')) }}</strong></td>
            <td class="col-num"><strong>{{ fmt(sumCol('rkap_tahun_ini')) }}</strong></td>
            <td class="col-num"><strong>{{ fmt(sumBulanSamaThLalu()) }}</strong></td>
            <td class="col-num"><strong>{{ fmt(sumBulanSebelumnyaThIni()) }}</strong></td>
            <td class="col-num"><strong>{{ fmt(sumBulanSelected()) }}</strong></td>
            <td class="col-num" colspan="3">—</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- TREND CHART -->
    <TrendLineChart 
      :rows="currentRows" 
      :tahun="store.selectedTahun"
    />

    <!-- INDIVIDUAL TREND CHARTS (ACCORDION) -->
    <div class="individual-charts-section">
      <h3 class="section-title">Trend per Indikator</h3>
      <IndividualTrendChart
        :rows="currentRows"
        :tahun="store.selectedTahun"
      />
    </div>

    <!-- LEGEND -->
    <!-- <div class="kinerja-legend">
      <span class="legend-item">
        <span class="legend-dot legend-dot--active"></span> Bulan berjalan
      </span>
      <span class="legend-item">
        <span class="legend-dot legend-dot--good"></span> Trend ≥ 1.0 Baik
      </span>
      <span class="legend-item">
        <span class="legend-dot legend-dot--warn"></span> Trend ≥ 0.9 Perhatian
      </span>
      <span class="legend-item">
        <span class="legend-dot legend-dot--bad"></span> Trend &lt; 0.9 Kurang
      </span>
    </div> -->

    <!-- ADD MODAL -->
    <Teleport to="body">
      <div v-if="showAddModal" class="modal-backdrop" @click.self="showAddModal = false">
        <div class="modal">
          <div class="modal__header">
            <h3>Tambah Indikator — {{ currentCategory.label }}</h3>
            <button @click="showAddModal = false">✕</button>
          </div>
          <div class="modal__body">
            <div class="form-group">
              <label>Indikator *</label>
              <input v-model="addForm.indikator" class="form-input" placeholder="cth: Pendapatan Usaha" />
            </div>
            <div class="form-group">
              <label>Satuan</label>
              <input v-model="addForm.satuan" class="form-input" placeholder="cth: Rp, %, Box, Teus" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Realisasi {{ store.selectedTahun - 1 }}</label>
                <input v-model.number="addForm.realisasi_tahun_lalu" type="number" class="form-input" />
              </div>
              <div class="form-group">
                <label>RKAP {{ store.selectedTahun }}</label>
                <input v-model.number="addForm.rkap_tahun_ini" type="number" class="form-input" />
              </div>
            </div>
            <div class="form-group">
              <label>Urutan Tampil</label>
              <input v-model.number="addForm.urutan" type="number" class="form-input" />
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
          <div class="modal__header"><h3>Hapus Indikator</h3></div>
          <div class="modal__body">
            <p>Yakin ingin menghapus <strong>{{ deleteTarget.indikator }}</strong>?</p>
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
import TrendLineChart from './TrendLineChart.vue';
import IndividualTrendChart from './IndividualTrendChart.vue';

const store = useSwpStore();

// ── 12 BULAN FIXED ────────────────────────────────────────
const bulanList = computed(() => {
  const tahun = store.selectedTahun;
  const names = [
    { short: 'Jan', label: 'Januari' },
    { short: 'Feb', label: 'Februari' },
    { short: 'Mar', label: 'Maret' },
    { short: 'Apr', label: 'April' },
    { short: 'Mei', label: 'Mei' },
    { short: 'Jun', label: 'Juni' },
    { short: 'Jul', label: 'Juli' },
    { short: 'Agt', label: 'Agustus' },
    { short: 'Sep', label: 'September' },
    { short: 'Okt', label: 'Oktober' },
    { short: 'Nov', label: 'November' },
    { short: 'Des', label: 'Desember' },
  ];
  return names.map((b, i) => ({
    ...b,
    key: `${tahun}-${String(i + 1).padStart(2, '0')}`,
    num: i + 1,
  }));
});

// Highlight bulan berjalan
function isActiveBulan(key) {
  const now = new Date();
  const activeKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return key === activeKey;
}

// Dynamic header untuk kolom realisasi bulan
const realisasiHeader = computed(() => {
  const bulanNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const bulanLabel = bulanNames[store.selectedBulan - 1];
  return `Realisasi ${bulanLabel}`;
})

// Header untuk bulan sama tahun lalu
const bulanSamaThTahunLalu = computed(() => {
  const bulanNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const bulanLabel = bulanNames[store.selectedBulan - 1];
  return `${bulanLabel} ${store.selectedTahun - 1}`;
})

// Header untuk bulan sebelumnya tahun ini
const bulanSebelumnyaThIni = computed(() => {
  const bulanNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  let prevMonth = store.selectedBulan - 1;
  if (prevMonth < 1) prevMonth = 12; // jika Januari, ambil Desember tahun lalu (tapi tahunnya tetap selectedTahun)
  const bulanLabel = bulanNames[prevMonth - 1];
  return `${bulanLabel} ${store.selectedTahun}`;
})

// ── CATEGORY TABS ─────────────────────────────────────────
const categories = [
  { key: 'keuangan',    label: 'Kinerja Keuangan',   icon: '💰', color: '#ffffff' },
  { key: 'operasional', label: 'Kinerja Operasional', icon: '⚙️', color: '#ffffff' },
  { key: 'sdm',         label: 'Kinerja SDM',         icon: '👥', color: '#ffffff' },
];
const activeCategory  = ref('keuangan');
const currentCategory = computed(() => categories.find(c => c.key === activeCategory.value));
const currentRows     = computed(() => store.kinerja[activeCategory.value] || []);

// ── FORMAT ────────────────────────────────────────────────
function fmt(val) {
  if (val === null || val === undefined || val === '') return '-';
  const n = Number(val);
  if (isNaN(n)) return val;
  if (Math.abs(n) >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + ' M';
  if (Math.abs(n) >= 1_000_000)     return (n / 1_000_000).toFixed(2) + ' jt';
  return n.toLocaleString('id-ID');
}
function fmtTrend(val) {
  if (val === null || val === undefined) return '-';
  return Number(val).toFixed(3);
}
function trendClass(val) {
  if (val === null || val === undefined) return '';
  const n = Number(val);
  if (n >= 1)   return 'trend-good';
  if (n >= 0.9) return 'trend-warn';
  return 'trend-bad';
}

// ── TREND CALCULATIONS ────────────────────────────────────
// Setiap trend menggunakan Realisasi (Bulan Saat ini) dibagi dengan referensi berbeda

function calcTrend8(row) {  // Realisasi (Bulan Saat ini) : RKAP (tahun saat ini)
  const currentMonth = getSelectedBulanValue(row);
  const rkap = row.rkap_tahun_ini;
  if (!rkap || rkap === 0 || !currentMonth) return null;
  return currentMonth / rkap;
}

function calcTrend9(row) {  // Realisasi (Bulan Saat ini) : Realisasi (Bulan Terakhir)
  const currentMonth = getSelectedBulanValue(row);
  const prevMonth = getBulanSebelumnyaThIniValue(row);
  if (!prevMonth || prevMonth === 0 || !currentMonth) return null;
  return currentMonth / prevMonth;
}

function calcTrend10(row) { // Realisasi (Bulan Saat ini) : Realisasi (Bulan Saat ini, tahun lalu)
  const currentMonth = getSelectedBulanValue(row);
  const sameMonthLastYear = getBulanSamaThLaluValue(row);
  if (!sameMonthLastYear || sameMonthLastYear === 0 || !currentMonth) return null;
  return currentMonth / sameMonthLastYear;
}

// ── TOTAL FOOTER ──────────────────────────────────────────
function sumCol(field) {
  return currentRows.value.reduce((acc, r) => acc + (Number(r[field]) || 0), 0);
}
function sumBulan(key) {
  return currentRows.value.reduce((acc, r) => acc + (Number(r.period_data?.[key]) || 0), 0);
}
function sumBulanSelected() {
  return sumBulan(store.selectedPeriodKey);
}
function sumBulanSamaThLalu() {
  const key = `${store.selectedTahun - 1}-${String(store.selectedBulan).padStart(2, '0')}`;
  return sumBulan(key);
}
function sumBulanSebelumnyaThIni() {
  let prevMonth = store.selectedBulan - 1;
  let prevYear = store.selectedTahun;
  if (prevMonth < 1) {
    prevMonth = 12;
    prevYear = store.selectedTahun - 1;
  }
  const key = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
  return sumBulan(key);
}

// ── INLINE ROW EDIT ───────────────────────────────────────
const editingId = ref(null);
const editForm  = ref({});

function startEdit(row) {
  editingId.value = row.id;
  editForm.value = {
    indikator:            row.indikator,
    satuan:               row.satuan,
    realisasi_tahun_lalu: row.realisasi_tahun_lalu,
    rkap_tahun_ini:       row.rkap_tahun_ini,
    category:             row.category,
  };
}
function cancelEdit() { editingId.value = null; editForm.value = {}; }
async function saveEdit(row) {
  try {
    await store.updateKinerja(row.id, editForm.value);
    cancelEdit();
  } catch (e) { alert('Gagal menyimpan: ' + e.message); }
}

// ── PERIOD CELL EDIT (double-click) ───────────────────────
const periodEditCell  = ref(null);
const periodEditValue = ref(null);
const periodEditCellSamaThLalu = ref(null);
const periodEditValueSamaThLalu = ref(null);
const periodEditCellSebelumnya = ref(null);
const periodEditValueSebelumnya = ref(null);
const isSavingPeriod  = ref(false); // ← flag cegah double-save

const vFocus = {
  mounted: (el) => {
    // Delay sedikit agar DOM siap
    setTimeout(() => {
      el.focus();
      el.select(); // select semua teks agar mudah langsung ketik
    }, 50);
  }
};

// ── BULAN SAAT INI ─────────────────────────────────────────
function startPeriodEdit(row) {
  if (editingId.value) return; // jangan edit bulan saat row-edit aktif
  if (isSavingPeriod.value) return;
  periodEditCell.value  = row.id;
  periodEditValue.value = getSelectedBulanValue(row) ?? null;
}

function cancelPeriodEdit() {
  periodEditCell.value  = null;
  periodEditValue.value = null;
  isSavingPeriod.value  = false;
}

async function onPeriodEnter(row) {
  if (isSavingPeriod.value) return;
  isSavingPeriod.value = true;
  try {
    await store.updateKinerjaPeriod(row.id, row.category, store.selectedPeriodKey, periodEditValue.value);
    cancelPeriodEdit();
  } catch (e) {
    alert('Gagal update: ' + e.message);
    isSavingPeriod.value = false;
  }
}

async function onPeriodBlur(row) {
  if (isSavingPeriod.value) return; // sudah disimpan via Enter, skip
  if (!periodEditCell.value) return; // sudah di-cancel via Escape, skip
  isSavingPeriod.value = true;
  try {
    await store.updateKinerjaPeriod(row.id, row.category, store.selectedPeriodKey, periodEditValue.value);
    cancelPeriodEdit();
  } catch (e) {
    alert('Gagal update: ' + e.message);
    isSavingPeriod.value = false;
  }
}

// ── BULAN SAMA TAHUN LALU ──────────────────────────────────
function startPeriodEditSamaThLalu(row) {
  if (editingId.value) return;
  if (isSavingPeriod.value) return;
  periodEditCellSamaThLalu.value  = row.id;
  periodEditValueSamaThLalu.value = getBulanSamaThLaluValue(row) ?? null;
}

function cancelPeriodEditSamaThLalu() {
  periodEditCellSamaThLalu.value  = null;
  periodEditValueSamaThLalu.value = null;
  isSavingPeriod.value = false;
}

async function onPeriodEnterSamaThLalu(row) {
  if (isSavingPeriod.value) return;
  isSavingPeriod.value = true;
  try {
    const key = `${store.selectedTahun - 1}-${String(store.selectedBulan).padStart(2, '0')}`;
    await store.updateKinerjaPeriod(row.id, row.category, key, periodEditValueSamaThLalu.value);
    cancelPeriodEditSamaThLalu();
  } catch (e) {
    alert('Gagal update: ' + e.message);
    isSavingPeriod.value = false;
  }
}

async function onPeriodBlurSamaThLalu(row) {
  if (isSavingPeriod.value) return;
  if (!periodEditCellSamaThLalu.value) return;
  isSavingPeriod.value = true;
  try {
    const key = `${store.selectedTahun - 1}-${String(store.selectedBulan).padStart(2, '0')}`;
    await store.updateKinerjaPeriod(row.id, row.category, key, periodEditValueSamaThLalu.value);
    cancelPeriodEditSamaThLalu();
  } catch (e) {
    alert('Gagal update: ' + e.message);
    isSavingPeriod.value = false;
  }
}

// ── BULAN SEBELUMNYA TAHUN INI ─────────────────────────────
function startPeriodEditSebelumnya(row) {
  if (editingId.value) return;
  if (isSavingPeriod.value) return;
  periodEditCellSebelumnya.value  = row.id;
  periodEditValueSebelumnya.value = getBulanSebelumnyaThIniValue(row) ?? null;
}

function cancelPeriodEditSebelumnya() {
  periodEditCellSebelumnya.value  = null;
  periodEditValueSebelumnya.value = null;
  isSavingPeriod.value = false;
}

async function onPeriodEnterSebelumnya(row) {
  if (isSavingPeriod.value) return;
  isSavingPeriod.value = true;
  try {
    let prevMonth = store.selectedBulan - 1;
    let prevYear = store.selectedTahun;
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear = store.selectedTahun - 1;
    }
    const key = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
    await store.updateKinerjaPeriod(row.id, row.category, key, periodEditValueSebelumnya.value);
    cancelPeriodEditSebelumnya();
  } catch (e) {
    alert('Gagal update: ' + e.message);
    isSavingPeriod.value = false;
  }
}

async function onPeriodBlurSebelumnya(row) {
  if (isSavingPeriod.value) return;
  if (!periodEditCellSebelumnya.value) return;
  isSavingPeriod.value = true;
  try {
    let prevMonth = store.selectedBulan - 1;
    let prevYear = store.selectedTahun;
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear = store.selectedTahun - 1;
    }
    const key = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
    await store.updateKinerjaPeriod(row.id, row.category, key, periodEditValueSebelumnya.value);
    cancelPeriodEditSebelumnya();
  } catch (e) {
    alert('Gagal update: ' + e.message);
    isSavingPeriod.value = false;
  }
}

// ── GETTER FUNCTIONS ───────────────────────────────────────
// Ambil nilai bulan yang dipilih dari period_data
function getSelectedBulanValue(row) {
  return row.period_data?.[store.selectedPeriodKey];
}

// Ambil nilai bulan sama tahun lalu
function getBulanSamaThLaluValue(row) {
  const key = `${store.selectedTahun - 1}-${String(store.selectedBulan).padStart(2, '0')}`;
  return row.period_data?.[key];
}

// Ambil nilai bulan sebelumnya tahun ini
function getBulanSebelumnyaThIniValue(row) {
  let prevMonth = store.selectedBulan - 1;
  let prevYear = store.selectedTahun;
  if (prevMonth < 1) {
    prevMonth = 12;
    prevYear = store.selectedTahun - 1;
  }
  const key = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
  return row.period_data?.[key];
}

// ── ADD MODAL ─────────────────────────────────────────────
const showAddModal = ref(false);
const saving       = ref(false);
const addForm      = ref({ indikator: '', satuan: '', realisasi_tahun_lalu: null, rkap_tahun_ini: null, urutan: 0 });

function openAddModal() {
  addForm.value = { indikator: '', satuan: '', realisasi_tahun_lalu: null, rkap_tahun_ini: null, urutan: 0 };
  showAddModal.value = true;
}
async function submitAdd() {
  if (!addForm.value.indikator) return alert('Nama indikator wajib diisi!');
  saving.value = true;
  try {
    await store.createKinerja({ ...addForm.value, category: activeCategory.value });
    showAddModal.value = false;
  } catch (e) {
    alert('Gagal: ' + e.message);
  } finally {
    saving.value = false;
  }
}

// ── DELETE ────────────────────────────────────────────────
const deleteTarget = ref(null);
function confirmDelete(row) { deleteTarget.value = row; }
async function doDelete() {
  await store.deleteKinerja(deleteTarget.value.id, deleteTarget.value.category);
  deleteTarget.value = null;
}

// ── EXPORT EXCEL ──────────────────────────────────────────
async function exportExcel() {
  try {
    const XLSX = await import('xlsx');
    const rows = currentRows.value.map(r => {
      const base = {
        Indikator:                         r.indikator,
        Satuan:                            r.satuan,
        [`Realisasi ${store.selectedTahun - 1}`]: r.realisasi_tahun_lalu,
        [`RKAP ${store.selectedTahun}`]:   r.rkap_tahun_ini,
        [bulanSamaThTahunLalu.value]:      getBulanSamaThLaluValue(r),
        [bulanSebelumnyaThIni.value]:      getBulanSebelumnyaThIniValue(r),
        [realisasiHeader.value]:           getSelectedBulanValue(r),
        ['Trend: Realisasi (Bulan Saat ini) : RKAP (tahun saat ini)']: fmtTrend(calcTrend8(r)),
        ['Trend: Realisasi (Bulan Saat ini) : Realisasi (Bulan Terakhir)']: fmtTrend(calcTrend9(r)),
        ['Trend: Realisasi (Bulan Saat ini) : Realisasi (Bulan Saat ini, tahun lalu)']: fmtTrend(calcTrend10(r)),
      };
      return base;
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, currentCategory.value.label);
    XLSX.writeFile(wb, `SWP_Kinerja_${currentCategory.value.label}_${store.selectedTahun}.xlsx`);
  } catch (e) {
    alert('Export gagal. Pastikan: npm install xlsx');
  }
}
</script>

<style scoped>
.kinerja-wrap {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

/* ── SUBTABS ── */
.kinerja-subtabs {
  display: flex;
  background: #1e3a5f;
  padding: 0 16px;
  border-bottom: 1px solid #2d4a7a;
}
.kinerja-subtab {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 16px; font-size: 13px;
  background: none; border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px; cursor: pointer;
  color: #cbd5e1; font-weight: 500; transition: all 0.2s;
}
.kinerja-subtab:hover { color: #fff; background: rgba(255,255,255,0.08); }
.kinerja-subtab.active {
  color: #fff; border-bottom-color: #60a5fa;
  font-weight: 600; background: rgba(255,255,255,0.1);
}

/* ── TOOLBAR ── */
.kinerja-toolbar {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 16px; border-bottom: 1px solid #e2e8f0;
  background: #f8fafc; flex-wrap: wrap;
}
.kinerja-toolbar__info { font-size: 11.5px; color: #64748b; margin-left: auto; }

/* ── BUTTONS ── */
.btn { padding: 7px 14px; border-radius: 6px; font-size: 13px; cursor: pointer; border: none; font-weight: 500; transition: all 0.2s; }
.btn-primary { background: #2563eb; color: white; }
.btn-primary:hover { background: #1d4ed8; }
.btn-primary:disabled { opacity: 0.5; }
.btn-outline { background: white; color: #374151; border: 1px solid #d1d5db; }
.btn-outline:hover { background: #f9fafb; }
.btn-danger { background: #ef4444; color: white; }
.btn-danger:hover { background: #dc2626; }

/* ── TABLE WRAPPER ── */
.table-scroll-wrap {
  overflow-x: auto;
  overflow-y: auto;
}

.swp-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  min-width: 1500px;
}

/* ── THEAD ── */
.swp-table thead { position: sticky; top: 0; z-index: 10; }

.thead-row-1 th,
.thead-row-2 th,
.thead-row-3 th {
  background: #1e3a5f;
  color: white;
  padding: 6px 6px;
  text-align: center;
  font-weight: 600;
  border: 1px solid #2d4a7a;
  white-space: nowrap;
}

/* Sticky header col indikator */
.th-sticky {
  position: sticky !important;
  left: 0;
  z-index: 11 !important;
  background: #1e3a5f !important;
  min-width: 200px;
  text-align: left !important;
  box-shadow: 2px 0 4px rgba(0,0,0,0.2);
}

/* Group header bulan */
.col-group-bulan {
  background: #155e8e !important;
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #60a5fa !important;
}

/* Group header trend */
.col-group-trend {
  background: #2d4a7a !important;
  font-size: 12px;
}

/* Nama bulan */
.col-bulan-th {
  background: #1a5080 !important;
  font-size: 11px !important;
  min-width: 62px;
  padding: 5px 3px !important;
  font-weight: 600 !important;
}
/* Bulan berjalan highlight */
.col-bulan-th--active {
  background: #1565c0 !important;
  color: #ffd54f !important;
  font-weight: 700 !important;
}

/* Kolom trend sub-header */
.col-trend-sub {
  background: #2d5080 !important;
  font-size: 10px !important;
  color: #93c5fd !important;
  min-width: 80px;
  white-space: normal !important;
  line-height: 1.3;
}

/* Nomor baris */
.col-num-label {
  background: #243d6e !important;
  font-size: 10px !important;
  color: #93c5fd !important;
  padding: 3px 4px !important;
}

/* ── TBODY ── */
.swp-table tbody tr:hover td { background: #f0f7ff; }
.swp-table tbody tr:nth-child(even) td { background: #f8fafc; }
.swp-table tbody tr:nth-child(even):hover td { background: #e8f2ff; }
.row-editing td { background: #fefce8 !important; }

.swp-table td {
  padding: 5px 7px;
  border: 1px solid #e2e8f0;
  vertical-align: middle;
  transition: background 0.1s;
}

/* Sticky body col */
.td-sticky {
  position: sticky;
  left: 0;
  z-index: 2;
  background: white;
  box-shadow: 2px 0 4px rgba(0,0,0,0.06);
}
.swp-table tbody tr:nth-child(even) .td-sticky { background: #f8fafc; }
.swp-table tbody tr:hover .td-sticky           { background: #f0f7ff; }
.row-editing .td-sticky                         { background: #fefce8 !important; }

.col-indikator { min-width: 200px; text-align: left; }
.col-num       { min-width: 88px; text-align: right; font-variant-numeric: tabular-nums; }
.col-actions   { min-width: 68px; text-align: center; white-space: nowrap; }

/* Kolom data bulan */
.col-bulan-data {
  text-align: right;
  min-width: 62px;
  font-variant-numeric: tabular-nums;
  cursor: cell;
}
.col-bulan-data:hover { background: #dbeafe !important; }
.col-bulan-data--active { background: #fffde7 !important; }
.col-bulan-data--active:hover { background: #fff9c4 !important; }

.val-empty { color: #d1d5db; font-size: 11px; }
.indikator-text { font-weight: 500; color: #1e293b; }
.indikator-unit { font-size: 10px; color: #94a3b8; margin-left: 3px; }

/* Trend */
.trend-good { color: #16a34a; font-weight: 700; }
.trend-warn { color: #d97706; font-weight: 700; }
.trend-bad  { color: #dc2626; font-weight: 700; }

/* ── TFOOT ── */
tfoot .tfoot-total td {
  background: #1e3a5f !important;
  color: white !important;
  padding: 6px 7px;
  border: 1px solid #2d4a7a;
  text-align: right;
  font-size: 12px;
}
tfoot .tfoot-total .td-sticky {
  background: #1e3a5f !important;
  text-align: left;
  box-shadow: 2px 0 4px rgba(0,0,0,0.3);
}

/* ── INPUTS ── */
.cell-input {
  width: 100%; padding: 3px 5px;
  border: 1px solid #3b82f6; border-radius: 3px;
  font-size: 11.5px; outline: none;
  box-sizing: border-box; background: #eff6ff;
}
.cell-input--wide  { min-width: 160px; }
.cell-input--bulan { min-width: 52px; max-width: 62px; text-align: right; }

/* ── ICON BUTTONS ── */
.btn-icon {
  background: none; border: none; cursor: pointer;
  padding: 4px 5px; border-radius: 4px;
  transition: background 0.15s;
  display: inline-flex; align-items: center; justify-content: center;
}
.btn-save          { color: #16a34a; font-size: 14px; font-weight: 700; }
.btn-save:hover    { background: #dcfce7; }
.btn-cancel        { color: #dc2626; font-size: 14px; font-weight: 700; }
.btn-cancel:hover  { background: #fee2e2; }
.btn-edit:hover    { background: #dbeafe; }
.btn-del:hover     { background: #fee2e2; }
.action-icon       { width: 15px; height: 15px; object-fit: contain; display: block; }

/* ── LEGEND ── */
.kinerja-legend {
  display: flex; align-items: center; gap: 16px;
  padding: 7px 16px; background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  font-size: 11px; color: #64748b; flex-wrap: wrap;
}
.legend-item { display: flex; align-items: center; gap: 5px; }
.legend-dot  { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }
.legend-dot--active { background: #1565c0; }
.legend-dot--good   { background: #16a34a; }
.legend-dot--warn   { background: #d97706; }
.legend-dot--bad    { background: #dc2626; }

/* ── INDIVIDUAL CHARTS SECTION ── */
.individual-charts-section {
  padding: 16px;
  margin-top: 20px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #1e3a5f;
  margin: 0 0 12px 0;
}

/* ── EMPTY ── */
.empty-row { text-align: center; padding: 40px; color: #94a3b8; font-style: italic; }

/* ── MODAL ── */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal { background: white; border-radius: 10px; width: 480px; max-width: 95vw; box-shadow: 0 20px 60px rgba(0,0,0,0.2); overflow: hidden; }
.modal--sm { width: 360px; }
.modal__header { background: #1e3a5f; color: white; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
.modal__header h3 { margin: 0; font-size: 15px; }
.modal__header button { background: none; border: none; color: white; cursor: pointer; font-size: 18px; }
.modal__body { padding: 20px; }
.modal__footer { padding: 12px 20px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 10px; }
.form-group { margin-bottom: 14px; }
.form-group label { display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 5px; }
.form-input { width: 100%; padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; box-sizing: border-box; outline: none; }
.form-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.15); }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
</style>