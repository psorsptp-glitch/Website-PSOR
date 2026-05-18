<template>
  <div class="swp-dashboard">
    <!-- HEADER -->
    <div class="swp-header">
      <div class="swp-header__left">
        <h1 class="swp-title">
          <span>📊</span> Strategic Workforce Planning
        </h1>
        <p class="swp-subtitle">
          Analisa & Perencanaan SDM Terminal
          <span v-if="store.selectedTerminal" class="period-chip">
            {{ store.selectedBulanLabel }}
          </span>
        </p>
      </div>

      <div class="swp-header__right">
        <!-- Terminal -->
        <div class="swp-filter">
          <label class="swp-filter__label">Terminal</label>
          <select v-model="store.selectedTerminalId" class="swp-select" @change="onTerminalChange($event.target.value)">
            <option value="">-- Pilih Terminal --</option>
            <option v-for="t in store.terminals" :key="t.id" :value="t.id">{{ t.nama_terminal }}</option>
          </select>
        </div>

        <!-- Tahun -->
        <div class="swp-filter">
          <label class="swp-filter__label">Tahun</label>
          <select v-model.number="store.selectedTahun" class="swp-select swp-select--sm" @change="onTahunChange(store.selectedTahun)">
            <option v-for="y in tahunOptions" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>

        <!-- Bulan -->
        <div class="swp-filter">
          <label class="swp-filter__label">Bulan</label>
          <select v-model.number="store.selectedBulan" class="swp-select swp-select--sm" @change="onBulanChange(store.selectedBulan)">
            <option v-for="b in store.bulanOptions" :key="b.value" :value="b.value">{{ b.label }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- LOADING GLOBAL -->
    <div v-if="store.loading && !store.selectedTerminalId" class="swp-loading">
      <div class="swp-spinner"></div><span>Memuat data...</span>
    </div>

    <!-- ERROR -->
    <div v-else-if="store.error" class="swp-error">⚠️ {{ store.error }}</div>

    <!-- EMPTY: belum pilih terminal -->
    <div v-else-if="!store.selectedTerminalId" class="swp-empty">
      <div style="font-size:48px;margin-bottom:16px">🏭</div>
      <p>Pilih terminal untuk melihat data SWP</p>
    </div>

    <!-- CONTENT -->
    <div v-else class="swp-content">

      <!-- Period info bar -->
      <div class="period-bar">
        <span class="period-bar__badge">📅 {{ store.selectedBulanLabel }}</span>
        <span class="period-bar__terminal">🏭 {{ store.selectedTerminal?.nama_terminal }}</span>
      </div>

      <!-- Tabs -->
      <div class="swp-tabs">
        <button
          v-for="tab in tabs" :key="tab.key"
          class="swp-tab"
          :class="{ 'swp-tab--active': store.activeTab === tab.key }"
          @click="changeTab(tab.key)"
        >
          {{ tab.icon }} {{ tab.label }}
          <span class="swp-tab__badge" v-if="tab.count">{{ tab.count }}</span>
        </button>
      </div>

      <!-- Panel -->
      <div class="swp-panel">
        <!-- Loading per tab -->
        <div v-if="tabLoading" class="tab-loading">
          <div class="swp-spinner"></div>
          <span>Memuat {{ currentTabLabel }}...</span>
        </div>

        <Transition name="fade" mode="out-in">
          <SWPKinerjaTable   v-if="store.activeTab === 'kinerja'   && !tabLoading" key="kinerja" />
          <SWPFasilitasTable v-else-if="store.activeTab === 'fasilitas' && !tabLoading" key="fasilitas" />
          <SWPSDMTreeTable   v-else-if="store.activeTab === 'sdm'   && !tabLoading" key="sdm" />
          <SWPStatusTable    v-else-if="store.activeTab === 'status' && !tabLoading" key="status" />
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useSwpStore } from '@/stores/swp.store';
import SWPKinerjaTable   from '@/components/swp/SWPKinerjaTable.vue';
import SWPFasilitasTable from '@/components/swp/SWPFasilitasTable.vue';
import SWPSDMTreeTable   from '@/components/swp/SWPSDMTreeTable.vue';
import SWPStatusTable    from '@/components/swp/SWPStatusTable.vue';

const store      = useSwpStore();
const tabLoading = ref(false);

const tahunOptions = computed(() => {
  const y = new Date().getFullYear();
  return [y - 1, y, y + 1];
});

const tabs = computed(() => [
  { key: 'kinerja',   label: 'Kinerja',          icon: '📈', count: (store.kinerjaKeuangan.length + store.kinerjaOperasional.length + store.kinerjaSDM.length) || null },
  { key: 'fasilitas', label: 'Fasilitas & Alat',  icon: '🏗️', count: store.fasilitas.length || null },
  { key: 'sdm',       label: 'Struktur SDM',      icon: '👥', count: null },
  { key: 'status',    label: 'Status Pekerja',    icon: '📋', count: store.status.length || null },
]);

const currentTabLabel = computed(() => tabs.value.find(t => t.key === store.activeTab)?.label || '');

// ── CHANGE TAB: selalu fetch data fresh ───────────────────
async function changeTab(tabKey) {
  store.activeTab  = tabKey;
  tabLoading.value = true;
  try {
    if (tabKey === 'kinerja')   await store.fetchKinerja();
    if (tabKey === 'fasilitas') await store.fetchFasilitas();
    if (tabKey === 'sdm')       await store.fetchSDM();
    if (tabKey === 'status')    await Promise.all([store.fetchStatus(), store.fetchShift()]);
  } finally {
    tabLoading.value = false;
  }
}

// ── FILTER CHANGE ─────────────────────────────────────────
async function onTerminalChange(id) {
  tabLoading.value = true;
  try { await store.setTerminal(id); } finally { tabLoading.value = false; }
}
async function onTahunChange(tahun) {
  tabLoading.value = true;
  try { await store.setTahun(tahun); } finally { tabLoading.value = false; }
}
async function onBulanChange(bulan) {
  tabLoading.value = true;
  try { await store.setBulan(bulan); } finally { tabLoading.value = false; }
}

// ── INIT ──────────────────────────────────────────────────
onMounted(async () => {
  await store.fetchTerminals();
  if (store.selectedTerminalId) {
    tabLoading.value = true;
    try { await store.fetchAll(); } finally { tabLoading.value = false; }
  }
});
</script>

<style scoped>
.swp-dashboard { font-family: 'Segoe UI', sans-serif; background: #f0f4f8; min-height: 100vh; }

/* HEADER */
.swp-header {
  background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);
  color: white; padding: 18px 28px;
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.15);
}
.swp-title { font-size: 20px; font-weight: 700; margin: 0; display: flex; align-items: center; gap: 8px; }
.swp-subtitle { font-size: 12px; opacity: 0.8; margin: 4px 0 0; display: flex; align-items: center; gap: 8px; }
.period-chip { background: rgba(255,255,255,0.2); padding: 2px 10px; border-radius: 12px; font-weight: 600; color: #fde68a; font-size: 12px; }

.swp-header__right { display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-end; }
.swp-filter { display: flex; flex-direction: column; gap: 3px; }
.swp-filter__label { font-size: 10px; opacity: 0.75; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600; }
.swp-select {
  background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3);
  color: white; padding: 6px 10px; border-radius: 6px; font-size: 13px;
  min-width: 185px; cursor: pointer; transition: background 0.2s;
}
.swp-select:hover { background: rgba(255,255,255,0.22); }
.swp-select--sm { min-width: 115px; }
.swp-select option { color: #1e3a5f; background: white; }

/* PERIOD BAR */
.period-bar {
  display: flex; align-items: center; gap: 16px;
  padding: 8px 24px; background: #1e3a5f; color: white; font-size: 12px;
}
.period-bar__badge { background: rgba(255,255,255,0.12); padding: 3px 12px; border-radius: 20px; font-weight: 600; color: #fde68a; }
.period-bar__terminal { opacity: 0.75; }

/* LOADING / ERROR / EMPTY */
.swp-loading { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 80px; color: #64748b; font-size: 15px; }
.swp-spinner { width: 22px; height: 22px; border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; animation: spin 0.8s linear infinite; flex-shrink: 0; }
@keyframes spin { to { transform: rotate(360deg); } }
.swp-error { background: #fef2f2; border-left: 4px solid #ef4444; color: #991b1b; padding: 16px 24px; margin: 24px; border-radius: 4px; }
.swp-empty { text-align: center; padding: 80px 20px; color: #94a3b8; }

/* TABS */
.swp-content { padding: 0; }
.swp-tabs { background: white; display: flex; border-bottom: 2px solid #e2e8f0; padding: 0 24px; overflow-x: auto; }
.swp-tab {
  display: flex; align-items: center; gap: 6px;
  padding: 13px 18px; font-size: 13px; font-weight: 500;
  color: #64748b; background: none; border: none;
  border-bottom: 2px solid transparent; margin-bottom: -2px;
  cursor: pointer; white-space: nowrap; transition: all 0.2s;
}
.swp-tab:hover { color: #2563eb; background: #f8faff; }
.swp-tab--active { color: #2563eb; border-bottom-color: #2563eb; font-weight: 600; }
.swp-tab__badge { background: #e0e7ff; color: #3730a3; font-size: 10px; padding: 1px 6px; border-radius: 10px; font-weight: 600; }

/* PANEL */
.swp-panel { 
  padding: 20px 24px;
  overflow-y: auto;
  max-height: calc(100vh - 280px);
}
.tab-loading { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 60px; color: #64748b; font-size: 14px; background: white; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }

/* FADE */
.fade-enter-active, .fade-leave-active { transition: opacity 0.18s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>