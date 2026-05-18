<template>
  <div class="h-full overflow-auto p-6 bg-gray-50">
    <div class="max-w-5xl mx-auto space-y-6">

      <!-- Stats row -->
      <div class="grid grid-cols-4 gap-4">
        <div v-for="stat in stats" :key="stat.label" class="card p-5">
          <div class="flex items-center justify-between mb-3">
            <p class="text-xs font-medium text-gray-500">{{ stat.label }}</p>
            <div :class="['w-8 h-8 rounded-lg flex items-center justify-center', stat.bg]">
              <span class="text-lg">{{ stat.icon }}</span>
            </div>
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
          <p class="text-xs text-emerald-600 mt-1 font-medium">{{ stat.sub }}</p>
        </div>
      </div>

      <!-- Division breakdown -->
      <div class="card p-5">
        <h2 class="text-sm font-bold text-gray-800 mb-4">Distribusi per Divisi</h2>
        <div class="space-y-3">
          <div v-for="div in divisionStats" :key="div.name" class="flex items-center gap-3">
            <div class="w-28 text-xs font-medium text-gray-600 truncate">{{ div.name }}</div>
            <div class="flex-1 bg-gray-100 rounded-full h-2">
              <div class="bg-pelindo-blue h-2 rounded-full transition-all" :style="{ width: div.pct + '%' }"></div>
            </div>
            <div class="w-8 text-xs text-right font-semibold text-gray-700">{{ div.count }}</div>
          </div>
          <div v-if="!divisionStats.length" class="text-xs text-gray-400 italic py-2">
            Belum ada data divisi
          </div>
        </div>
      </div>

      <!-- Recent jabatan -->
      <div class="card p-5">
        <h2 class="text-sm font-bold text-gray-800 mb-4">Jabatan Terbaru</h2>
        <div class="divide-y divide-gray-100">
          <div v-for="node in recentNodes" :key="node.id"
            @click="navigate(node)"
            class="flex items-center gap-3 py-3 cursor-pointer hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
              :style="{ background: '#E8F0FE', color: '#1a73e8' }">
              {{ node.title.charAt(0) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-800 truncate">{{ node.title }}</p>
              <p class="text-xs text-gray-400 truncate">
                {{ node.person_name || 'Posisi kosong' }} · {{ node.division || '—' }}
              </p>
            </div>
            <span :class="node.status === 'active' ? 'badge-green' : 'badge-gray'">
              <span :class="['w-1.5 h-1.5 rounded-full', node.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400']"></span>
              {{ node.status === 'active' ? 'Aktif' : 'Nonaktif' }}
            </span>
          </div>
          <div v-if="!recentNodes.length" class="py-8 text-center text-gray-400 text-sm">
            Belum ada jabatan
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useJabatanStore } from '@/stores/jabatan.store'

const router  = useRouter()
const jabatan = useJabatanStore()

// ── Stats cards ───────────────────────────────────────────────────
const stats = computed(() => [
  {
    label: 'Total Jabatan',
    value: jabatan.nodes.length,
    icon:  '🏢',
    bg:    'bg-blue-50',
    sub:   'dalam struktur'
  },
  {
    label: 'Total Divisi',
    value: jabatan.divisions.length,
    icon:  '📁',
    bg:    'bg-purple-50',
    sub:   'divisi aktif'
  },
  {
    label: 'Jabatan Aktif',
    value: jabatan.nodes.filter(n => n.status === 'active').length,
    icon:  '✅',
    bg:    'bg-emerald-50',
    sub:   'jabatan terisi'
  },
  {
    label: 'Jabatan Kosong',
    value: jabatan.nodes.filter(n => !n.person_name).length,
    icon:  '📭',
    bg:    'bg-orange-50',
    sub:   'posisi belum terisi'
  }
])

// ── Division bar chart ────────────────────────────────────────────
const divisionStats = computed(() => {
  const total = jabatan.nodes.length || 1
  return jabatan.divisions.map(div => {
    const count = jabatan.nodes.filter(n => n.division === div).length
    return { name: div, count, pct: Math.round(count / total * 100) }
  }).sort((a, b) => b.count - a.count)
})

// ── Recent jabatan (last 6 added) ─────────────────────────────────
const recentNodes = computed(() =>
  [...jabatan.nodes].slice(-6).reverse()
)

// ── Navigate to tree & select node ───────────────────────────────
function navigate(node) {
  jabatan.selectNode(node)
  router.push('/dashboard/struktur-org')
}
</script>