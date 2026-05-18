<template>
  <div class="w-full h-full overflow-auto relative bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300">

    <!-- Controls -->
    <div class="absolute top-4 left-4 z-20 flex gap-2">
      <button @click="jabatan.expandAll()" class="px-3 py-1.5 bg-white/90 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:border-pelindo-blue hover:text-pelindo-blue transition-colors shadow-sm">Expand Semua</button>
      <button @click="jabatan.collapseAll()" class="px-3 py-1.5 bg-white/90 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:border-pelindo-blue hover:text-pelindo-blue transition-colors shadow-sm">Collapse Semua</button>
    </div>

    <!-- Empty state -->
    <div v-if="!jabatan.nodes.length" class="absolute inset-0 flex items-center justify-center z-10">
      <div class="text-center bg-white/90 rounded-2xl p-10 shadow-lg">
        <div class="text-5xl mb-3">🏢</div>
        <p class="text-gray-600 font-semibold mb-1">Belum ada jabatan</p>
        <p class="text-gray-400 text-sm mb-4">Tambahkan jabatan pertama untuk memulai</p>
        <button v-if="auth.isAdmin" @click="modal.openCreate()" class="btn-primary btn-sm">+ Tambah Jabatan</button>
      </div>
    </div>

    <!-- Tree canvas -->
    <div class="relative z-10 p-16"
      :style="{ transform: `scale(${zoom/100})`, transformOrigin: 'top center', transition: 'transform 0.2s' }">
      <div class="relative" :style="{ width: canvasW + 'px', height: canvasH + 'px', minWidth: '100%' }">

        <!-- SVG connectors -->
        <svg class="absolute top-0 left-0 pointer-events-none"
          :width="canvasW" :height="canvasH"
          style="overflow: visible; z-index: 2;">
          <path v-for="(d, i) in connectors" :key="`path-${i}`"
            :d="d" fill="none" stroke="#475569" stroke-width="3.5"
            stroke-linecap="round" stroke-linejoin="round" 
            opacity="0.9" />
        </svg>

        <!-- Node cards -->
        <TreeNodeCard
          v-for="entry in layout" :key="entry.node.id"
          :entry="entry"
          :style="{ position: 'absolute', left: entry.x + 'px', top: entry.y + 'px', width: NODE_W + 'px', height: NODE_H + 'px', zIndex: 10 }"
          @select="jabatan.selectNode(entry.node)"
          @addChild="modal.openCreate(entry.node.id)"
          @edit="modal.openEdit(entry.node)"
          @delete="modal.openDelete(entry.node)"
          @toggle="jabatan.toggleCollapse(entry.node.id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useJabatanStore } from '@/stores/jabatan.store'
import { useModalStore }   from '@/stores/modal.store'
import { useAuthStore }    from '@/stores/auth.store'
import { buildLayout, buildConnectorPaths, subtreeWidth, NODE_W, NODE_H, H_GAP } from '@/utils/tree'
import TreeNodeCard from './TreeNodeCard.vue'

const props = defineProps({ zoom: { type: Number, default: 100 } })

const jabatan = useJabatanStore()
const modal   = useModalStore()
const auth    = useAuthStore()

const layout = computed(() => {
  const map       = jabatan.nodesMap
  const collapsed = jabatan.collapsedIds
  const rootIds   = jabatan.rootIds
  const result    = []
  let x = 0
  rootIds.forEach(id => {
    const sw = subtreeWidth(id, map, collapsed)
    buildLayout(id, x, 0, 1, map, collapsed, result)
    x += sw + H_GAP * 2
  })
  console.log('Layout entries:', result.length, result.map(e => ({ id: e.node.id, x: e.x, y: e.y, children: e.node.children?.length || 0 })))
  return result
})

const connectors = computed(() => {
  const result = buildConnectorPaths(layout.value, jabatan.nodesMap, jabatan.collapsedIds)
  console.log('Connectors:', result.length, result)
  return result
})

const canvasW = computed(() => {
  if (!layout.value.length) return 800
  const maxX = Math.max(...layout.value.map(e => e.x + NODE_W))
  console.log('Canvas width:', maxX + 60, 'from nodes:', layout.value.map(e => e.x + NODE_W))
  return maxX + 60
})
const canvasH = computed(() => {
  if (!layout.value.length) return 400
  const maxY = Math.max(...layout.value.map(e => e.y + NODE_H))
  console.log('Canvas height:', maxY + 60, 'from nodes:', layout.value.map(e => e.y + NODE_H))
  return maxY + 60
})
</script>
