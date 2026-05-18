<template>
  <div class="flex flex-col h-full overflow-hidden">
    <!-- Toolbar -->
    <div class="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3 flex-shrink-0">
      <!-- View Tabs -->
      <div class="flex bg-gray-100 rounded-xl p-1 gap-0.5">
        <button v-for="tab in tabs" :key="tab.id"
          @click="activeTab = tab.id"
          :class="['view-tab', activeTab === tab.id ? 'active' : '']">
          {{ tab.label }}
        </button>
      </div>

      <!-- Search bar -->
      <div class="flex-1 max-w-sm">
        <div class="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" stroke-linecap="round"/>
          </svg>
          <input v-model="jabatan.searchQuery" placeholder="Cari jabatan..."
            class="bg-transparent text-sm outline-none w-full text-gray-700 placeholder-gray-400" />
          <button v-if="jabatan.searchQuery" @click="jabatan.searchQuery = ''"
            class="text-gray-400 hover:text-gray-600">×</button>
        </div>
      </div>

      <!-- Zoom (tree only) -->
      <div v-if="activeTab === 'tree'" class="flex items-center gap-1 ml-auto">
        <button @click="zoom = Math.max(40, zoom - 10)" class="btn-icon">−</button>
        <span class="text-xs font-medium text-gray-600 w-12 text-center">{{ zoom }}%</span>
        <button @click="zoom = Math.min(150, zoom + 10)" class="btn-icon">+</button>
        <button @click="zoom = 100" class="btn-icon text-xs" title="Reset">↺</button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="jabatan.loading" class="flex-1 flex items-center justify-center">
      <div class="flex flex-col items-center gap-3">
        <svg class="w-8 h-8 animate-spin text-pelindo-blue" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        <p class="text-sm text-gray-500">Memuat data struktur...</p>
      </div>
    </div>

    <!-- View content -->
    <div v-else class="flex-1 overflow-hidden">
      <transition name="fade" mode="out-in">
        <TreeView  v-if="activeTab === 'tree'"   :zoom="zoom" />
        <ListView  v-else-if="activeTab === 'list'" />
        <DokumenView v-else-if="activeTab === 'Dokumen'" />
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useJabatanStore } from '@/stores/jabatan.store'
import TreeView   from '@/components/tree/TreeView.vue'
import ListView   from '@/components/list/ListView.vue'
import DokumenView from '@/components/dokumen/DokumenView.vue'

const jabatan   = useJabatanStore()
const activeTab = ref('tree')
const zoom      = ref(100)
const tabs = [
  { id: 'tree',   label: 'Tree View' },
  { id: 'list',   label: 'List View' },
  { id: 'Dokumen', label: 'Dokumen'    }
]
</script>
