<template>
  <div class="h-full overflow-auto p-6 bg-gray-50">
    <div class="max-w-4xl mx-auto">
      <div class="card p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-base font-bold text-gray-900">Nomenklatur Jabatan</h2>
          <input v-model="search" placeholder="Cari jabatan..." class="form-input w-48 py-2 text-sm" />
        </div>
        <div v-for="(group, div) in groupedNodes" :key="div" class="mb-6">
          <div class="flex items-center gap-3 mb-3">
            <span class="text-xs font-bold text-pelindo-blue uppercase tracking-widest">{{ div }}</span>
            <div class="flex-1 h-px bg-gray-200"></div>
            <span class="text-xs text-gray-400">{{ group.length }} jabatan</span>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div v-for="node in group" :key="node.id"
              @click="jabatan.selectNode(node)"
              :class="['flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all',
                jabatan.selectedNode?.id === node.id ? 'border-pelindo-blue bg-blue-50' : 'border-gray-200 hover:border-pelindo-blue hover:bg-blue-50']">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 bg-blue-50 text-pelindo-blue">
                {{ node.title.charAt(0) }}
              </div>
              <div class="min-w-0">
                <div class="text-xs font-semibold text-gray-800 truncate">{{ node.title }}</div>
                <div class="text-[10px] text-gray-400 truncate">{{ node.kode || '—' }}</div>
              </div>
              <span :class="['w-2 h-2 rounded-full flex-shrink-0 ml-auto', node.status === 'active' ? 'bg-emerald-500' : 'bg-gray-300']"></span>
            </div>
          </div>
        </div>
        <div v-if="!Object.keys(groupedNodes).length" class="text-center py-12 text-gray-400">
          <p class="font-medium">Tidak ada jabatan ditemukan</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useJabatanStore } from '@/stores/jabatan.store'
const jabatan = useJabatanStore()
const search = ref('')
const groupedNodes = computed(() => {
  const q = search.value.toLowerCase()
  const filtered = jabatan.nodes.filter(n => !q || n.title.toLowerCase().includes(q) || (n.person_name||'').toLowerCase().includes(q))
  return filtered.reduce((acc, node) => {
    const div = node.division || 'Umum'
    if (!acc[div]) acc[div] = []
    acc[div].push(node)
    return acc
  }, {})
})
</script>
