<template>
  <div :class="['tree-node group', jabatan.selectedNode?.id === entry.node.id ? 'selected' : '', entry.level === 1 ? 'root' : '']"
    @click="$emit('select')">
    
    <div class="p-4 flex flex-col h-full w-full justify-between">
      <!-- Header Row: Level + Expand/Collapse -->
      <div class="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-gray-200">
        <span class="text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm" 
          :style="{ color: levelColor, backgroundColor: levelColor + '20' }">
          {{ entry.node.level_label || `LEVEL ${entry.level}` }}
        </span>
        <div v-if="hasChildren" class="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-100 border border-blue-300 cursor-pointer hover:bg-blue-200 transition-all" @click.stop="$emit('toggle')" title="Toggle expand/collapse">
          <svg v-if="!isCollapsed" class="w-3.5 h-3.5 text-pelindo-blue" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M19 14l-7-7m0 0L5 14m7-7v12"/></svg>
          <svg v-else class="w-3.5 h-3.5 text-pelindo-blue" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M5 10l7 7 7-7m0-4v12"/></svg>
          <span class="text-[9px] font-bold text-pelindo-blue">{{ isCollapsed ? 'EXPAND' : 'COLLAPSE' }}</span>
        </div>
      </div>

      <!-- Title: Main Content (Prominent) -->
      <div class="text-sm font-bold text-gray-900 leading-tight mb-3 break-words">{{ entry.node.title }}</div>

      <!-- Person Info -->
      <div v-if="entry.node.person_name" class="flex-shrink-0 mb-1">
        <div class="text-xs text-gray-700 flex items-center gap-1 min-w-0">
          <span :class="['w-2 h-2 rounded-full flex-shrink-0', 
            entry.node.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400']"></span>
          <span class="truncate font-semibold">{{ entry.node.person_name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useJabatanStore } from '@/stores/jabatan.store'
import { useAuthStore }    from '@/stores/auth.store'

const props = defineProps({ entry: { type: Object, required: true } })
defineEmits(['select', 'addChild', 'edit', 'delete', 'toggle'])

const jabatan = useJabatanStore()
const auth    = useAuthStore()

const hasChildren = computed(() => (jabatan.nodesMap[props.entry.node.id]?.children || []).length > 0)
const isCollapsed = computed(() => jabatan.collapsedIds.has(props.entry.node.id))

const LEVEL_COLORS = ['', '#4F46E5', '#0891B2', '#059669', '#D97706', '#7C3AED', '#BE185D']
const levelColor   = computed(() => LEVEL_COLORS[Math.min(props.entry.level, LEVEL_COLORS.length - 1)] || '#6B7280')
</script>
