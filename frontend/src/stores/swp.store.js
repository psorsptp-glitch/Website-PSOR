// stores/swp.store.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '/api';

export const useSwpStore = defineStore('swp', () => {

  // ── STATE ──────────────────────────────────────────────────
  const loading = ref(false);
  const error   = ref(null);

  // ── FILTER ─────────────────────────────────────────────────
  const selectedTerminalId = ref(null);
  const selectedTahun      = ref(new Date().getFullYear());
  const selectedBulan      = ref(new Date().getMonth() + 1); // 1-12
  const activeTab          = ref('kinerja');

  // ── DATA ───────────────────────────────────────────────────
  const terminals        = ref([]);
  const kinerja          = ref({ keuangan: [], operasional: [], sdm: [] });
  const periodColumns    = ref([]);
  const fasilitas        = ref([]);
  const fasilitasGrouped = ref({});
  const shift            = ref([]);
  const sdm              = ref([]);
  const sdmGrandTotal    = ref({});
  const status           = ref([]);
  const statusTotal      = ref({ rkap: 0, realisasi: 0 });

  // ── GETTERS ────────────────────────────────────────────────
  const selectedTerminal = computed(() =>
    terminals.value.find(t => t.id === selectedTerminalId.value)
  );

  const kinerjaKeuangan    = computed(() => kinerja.value.keuangan    || []);
  const kinerjaOperasional = computed(() => kinerja.value.operasional || []);
  const kinerjaSDM         = computed(() => kinerja.value.sdm         || []);

  const namaBulanList = [
    '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  const selectedBulanLabel = computed(() =>
    `${namaBulanList[selectedBulan.value]} ${selectedTahun.value}`
  );

  const selectedPeriodKey = computed(() =>
    `${selectedTahun.value}-${String(selectedBulan.value).padStart(2, '0')}`
  );

  const bulanOptions = computed(() =>
    namaBulanList.slice(1).map((nama, i) => ({ value: i + 1, label: nama }))
  );

  const periodLabels = computed(() => {
    return periodColumns.value.map(key => {
      const [year, month] = key.split('-');
      return { key, label: `${namaBulanList[parseInt(month)]} ${year}` };
    });
  });

  // ── HELPERS ────────────────────────────────────────────────
  function currentParams() {
    return {
      terminal_id: selectedTerminalId.value,
      tahun_ref:   selectedTahun.value,
      bulan_ref:   selectedBulan.value,
    };
  }

  function buildGrouped(items) {
    const g = {};
    (items || []).forEach(r => {
      const k = r.kategori || 'Lainnya';
      if (!g[k]) g[k] = [];
      g[k].push(r);
    });
    return g;
  }

  function calcStatusTotal(items) {
    return (items || []).reduce(
      (acc, r) => ({ rkap: acc.rkap + (r.rkap || 0), realisasi: acc.realisasi + (r.realisasi || 0) }),
      { rkap: 0, realisasi: 0 }
    );
  }

  function resetAllData() {
    kinerja.value          = { keuangan: [], operasional: [], sdm: [] };
    periodColumns.value    = [];
    fasilitas.value        = [];
    fasilitasGrouped.value = {};
    shift.value            = [];
    sdm.value              = [];
    sdmGrandTotal.value    = {};
    status.value           = [];
    statusTotal.value      = { rkap: 0, realisasi: 0 };
  }

  // ── TERMINALS ──────────────────────────────────────────────
  async function fetchTerminals() {
    try {
      const { data } = await axios.get(`${API}/swp/terminals`);
      terminals.value = data.data || [];
      if (terminals.value.length && !selectedTerminalId.value) {
        selectedTerminalId.value = terminals.value[0].id;
      }
    } catch (e) {
      error.value = e.message;
    }
  }

  // ── FETCH ALL ──────────────────────────────────────────────
  async function fetchAll() {
    if (!selectedTerminalId.value) return;
    loading.value = true;
    error.value   = null;
    try {
      const { data } = await axios.get(`${API}/swp/all`, { params: currentParams() });
      const d = data.data;
      kinerja.value          = d.kinerja       || { keuangan: [], operasional: [], sdm: [] };
      periodColumns.value    = d.periodColumns  || [];
      fasilitas.value        = d.fasilitas      || [];
      fasilitasGrouped.value = buildGrouped(d.fasilitas);
      shift.value            = d.shift          || [];
      sdm.value              = d.sdm            || [];
      sdmGrandTotal.value    = d.grandTotal     || {};
      status.value           = d.status         || [];
      statusTotal.value      = calcStatusTotal(d.status);
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  // ── FETCH PER TAB ──────────────────────────────────────────
  async function fetchKinerja() {
    if (!selectedTerminalId.value) return;
    loading.value = true;
    try {
      const { data } = await axios.get(`${API}/swp/kinerja`, { params: currentParams() });
      kinerja.value       = data.data         || { keuangan: [], operasional: [], sdm: [] };
      periodColumns.value = data.periodColumns || [];
    } catch (e) { error.value = e.message; }
    finally { loading.value = false; }
  }

  async function fetchFasilitas() {
    if (!selectedTerminalId.value) return;
    loading.value = true;
    try {
      const { data } = await axios.get(`${API}/swp/fasilitas`, { params: currentParams() });
      fasilitas.value        = data.data    || [];
      fasilitasGrouped.value = data.grouped || buildGrouped(data.data);
    } catch (e) { error.value = e.message; }
    finally { loading.value = false; }
  }

  async function fetchShift() {
    if (!selectedTerminalId.value) return;
    try {
      const { data } = await axios.get(`${API}/swp/shift`, { params: currentParams() });
      shift.value = data.data || [];
    } catch (e) { error.value = e.message; }
  }

  async function fetchSDM() {
    if (!selectedTerminalId.value) return;
    loading.value = true;
    try {
      const { data } = await axios.get(`${API}/swp/sdm`, { params: currentParams() });
      sdm.value           = data.data       || [];
      sdmGrandTotal.value = data.grandTotal || {};
    } catch (e) { error.value = e.message; }
    finally { loading.value = false; }
  }

  async function fetchStatus() {
    if (!selectedTerminalId.value) return;
    loading.value = true;
    try {
      const { data } = await axios.get(`${API}/swp/status`, { params: currentParams() });
      status.value      = data.data  || [];
      statusTotal.value = data.total || calcStatusTotal(data.data);
    } catch (e) { error.value = e.message; }
    finally { loading.value = false; }
  }

  // ── KINERJA CRUD ───────────────────────────────────────────
  async function createKinerja(payload) {
    const { data } = await axios.post(`${API}/swp/kinerja`, {
      ...payload, terminal_id: selectedTerminalId.value,
      tahun_ref: selectedTahun.value, bulan_ref: selectedBulan.value,
    });
    await fetchKinerja();
    return data;
  }

  async function updateKinerja(id, payload) {
    const { data } = await axios.put(`${API}/swp/kinerja/${id}`, payload);
    const cat = payload.category;
    const idx = kinerja.value[cat]?.findIndex(r => r.id === id);
    if (idx !== undefined && idx >= 0) {
      kinerja.value[cat][idx] = { ...kinerja.value[cat][idx], ...data.data };
    }
    return data;
  }

  async function updateKinerjaPeriod(id, category, period_key, value) {
    const { data } = await axios.patch(`${API}/swp/kinerja/${id}/period`, { period_key, value });
    const idx = kinerja.value[category]?.findIndex(r => r.id === id);
    if (idx !== undefined && idx >= 0) {
      kinerja.value[category][idx] = { ...kinerja.value[category][idx], ...data.data };
    }
    return data;
  }

  async function deleteKinerja(id, category) {
    await axios.delete(`${API}/swp/kinerja/${id}`);
    kinerja.value[category] = kinerja.value[category].filter(r => r.id !== id);
  }

  // ── FASILITAS CRUD ─────────────────────────────────────────
  async function createFasilitas(payload) {
    const { data } = await axios.post(`${API}/swp/fasilitas`, {
      ...payload, terminal_id: selectedTerminalId.value, tahun_ref: selectedTahun.value,
    });
    await fetchFasilitas();
    return data;
  }

  async function updateFasilitas(id, payload) {
    const { data } = await axios.put(`${API}/swp/fasilitas/${id}`, payload);
    const idx = fasilitas.value.findIndex(r => r.id === id);
    if (idx >= 0) fasilitas.value[idx] = { ...fasilitas.value[idx], ...data.data };
    fasilitasGrouped.value = buildGrouped(fasilitas.value);
    return data;
  }

  async function deleteFasilitas(id) {
    await axios.delete(`${API}/swp/fasilitas/${id}`);
    fasilitas.value        = fasilitas.value.filter(r => r.id !== id);
    fasilitasGrouped.value = buildGrouped(fasilitas.value);
  }

  // ── SHIFT CRUD ─────────────────────────────────────────────
  async function createShift(payload) {
    const { data } = await axios.post(`${API}/swp/shift`, {
      ...payload, terminal_id: selectedTerminalId.value, tahun_ref: selectedTahun.value,
    });
    shift.value.push(data.data);
    return data;
  }

  async function updateShift(id, payload) {
    const { data } = await axios.put(`${API}/swp/shift/${id}`, payload);
    const idx = shift.value.findIndex(r => r.id === id);
    if (idx >= 0) shift.value[idx] = { ...shift.value[idx], ...data.data };
    return data;
  }

  async function deleteShift(id) {
    await axios.delete(`${API}/swp/shift/${id}`);
    shift.value = shift.value.filter(r => r.id !== id);
  }

  // ── SDM CRUD ───────────────────────────────────────────────
  async function createSDM(payload) {
    const { data } = await axios.post(`${API}/swp/sdm`, {
      ...payload, terminal_id: selectedTerminalId.value, tahun_ref: selectedTahun.value,
    });
    await fetchSDM();
    return data;
  }

  async function updateSDM(id, payload) {
    await axios.put(`${API}/swp/sdm/${id}`, payload);
    await fetchSDM();
  }

  async function deleteSDM(id) {
    await axios.delete(`${API}/swp/sdm/${id}`);
    await fetchSDM();
  }

  // ── STATUS CRUD ────────────────────────────────────────────
  async function createStatus(payload) {
    const { data } = await axios.post(`${API}/swp/status`, {
      ...payload, terminal_id: selectedTerminalId.value,
      tahun_ref: selectedTahun.value, bulan_ref: selectedBulan.value,
    });
    status.value.push(data.data);
    statusTotal.value = calcStatusTotal(status.value);
    return data;
  }

  async function updateStatus(id, payload) {
    const { data } = await axios.put(`${API}/swp/status/${id}`, payload);
    const idx = status.value.findIndex(r => r.id === id);
    if (idx >= 0) status.value[idx] = { ...status.value[idx], ...data.data };
    statusTotal.value = calcStatusTotal(status.value);
    return data;
  }

  async function deleteStatus(id) {
    await axios.delete(`${API}/swp/status/${id}`);
    status.value      = status.value.filter(r => r.id !== id);
    statusTotal.value = calcStatusTotal(status.value);
  }

  // ── FILTER SETTERS ─────────────────────────────────────────
  async function setTerminal(terminalId) {
    selectedTerminalId.value = terminalId;
    resetAllData();
    await fetchAll();
  }

  async function setTahun(tahun) {
    selectedTahun.value = tahun;
    resetAllData();
    await fetchAll();
  }

  async function setBulan(bulan) {
    selectedBulan.value = bulan;
    resetAllData();
    await fetchAll();
  }

  return {
    loading, error,
    selectedTerminalId, selectedTahun, selectedBulan, activeTab,
    selectedTerminal, selectedBulanLabel, selectedPeriodKey, bulanOptions, namaBulanList,
    kinerjaKeuangan, kinerjaOperasional, kinerjaSDM, periodLabels, periodColumns,
    terminals, kinerja, fasilitas, fasilitasGrouped, shift, sdm, sdmGrandTotal, status, statusTotal,
    fetchTerminals, fetchAll, fetchKinerja, fetchFasilitas, fetchShift, fetchSDM, fetchStatus,
    createKinerja, updateKinerja, updateKinerjaPeriod, deleteKinerja,
    createFasilitas, updateFasilitas, deleteFasilitas,
    createShift, updateShift, deleteShift,
    createSDM, updateSDM, deleteSDM,
    createStatus, updateStatus, deleteStatus,
    setTerminal, setTahun, setBulan,
  };
});