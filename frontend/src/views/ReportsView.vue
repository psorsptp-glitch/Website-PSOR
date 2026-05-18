<template>
  <div class="h-full overflow-auto p-6 bg-gray-50">
    <div class="max-w-3xl mx-auto">
      <div class="card p-6">
        <h2 class="text-base font-bold text-gray-900 mb-4">Laporan Struktur Organisasi</h2>
        <div class="grid grid-cols-3 gap-4 mb-6">
          <div class="bg-blue-50 rounded-2xl p-4 border border-blue-100"><p class="text-xs text-pelindo-blue font-semibold mb-1">Total Jabatan</p><p class="text-3xl font-black text-pelindo-blue">{{ jabatan.stats.total }}</p></div>
          <div class="bg-emerald-50 rounded-2xl p-4 border border-emerald-100"><p class="text-xs text-emerald-600 font-semibold mb-1">Jabatan Aktif</p><p class="text-3xl font-black text-emerald-600">{{ jabatan.stats.active }}</p></div>
          <div class="bg-orange-50 rounded-2xl p-4 border border-orange-100"><p class="text-xs text-pelindo-orange font-semibold mb-1">Posisi Kosong</p><p class="text-3xl font-black text-pelindo-orange">{{ jabatan.nodes.filter(n=>!n.person_name).length }}</p></div>
        </div>
        <button class="btn-primary text-sm"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>Export PDF</button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useJabatanStore } from '@/stores/jabatan.store'
const jabatan = useJabatanStore()
</script>
