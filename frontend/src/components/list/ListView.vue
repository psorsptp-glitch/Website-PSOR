<template>
  <div class="h-full flex flex-col bg-gray-50 overflow-hidden">
    <!-- Filter bar -->
    <div class="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3 flex-shrink-0">
      <select v-model="jabatan.filterDiv" class="form-select text-sm py-2 w-40">
        <option value="">Semua Divisi</option>
        <option v-for="d in jabatan.divisions" :key="d" :value="d">{{ d }}</option>
      </select>
      <select v-model="jabatan.filterStatus" class="form-select text-sm py-2 w-40">
        <option value="">Semua Status</option>
        <option value="active">Aktif</option>
        <option value="inactive">Tidak Aktif</option>
      </select>
      <span class="text-sm text-gray-500 ml-auto">
        <strong>{{ paginated.length }}</strong> dari {{ jabatan.filteredNodes.length }} jabatan
      </span>
    </div>

    <div class="flex-1 overflow-auto p-6">
      <div class="card overflow-hidden">
        <!-- Header -->
        <div class="grid bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider"
          style="grid-template-columns: 44px 1fr 140px 130px 140px 90px 80px 80px">
          <div class="px-4 py-3"><input type="checkbox" class="rounded" /></div>
          <div class="px-4 py-3">Nama / Jabatan</div>
          <div class="px-4 py-3">Status</div>
          <div class="px-4 py-3">Divisi</div>
          <div class="px-4 py-3">Email</div>
          <div class="px-4 py-3">Level</div>
          <div class="px-4 py-3">Parent</div>
          <div class="px-4 py-3">Aksi</div>
        </div>

        <!-- Rows -->
        <div class="divide-y divide-gray-100">
          <div v-for="node in paginated" :key="node.id"
            @click="jabatan.selectNode(node)"
            :class="['grid items-center cursor-pointer transition-colors hover:bg-blue-50/60',
              jabatan.selectedNode?.id === node.id ? 'bg-blue-50' : '']"
            style="grid-template-columns: 44px 1fr 140px 130px 140px 90px 80px 80px">

            <div class="px-4 py-3.5" @click.stop><input type="checkbox" class="rounded" /></div>

            <!-- Name -->
            <div class="px-4 py-3.5 flex items-center gap-3 min-w-0">
              <div class="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-bold" :style="avatarStyle(node)">
                {{ initials(node.person_name || node.title) }}
              </div>
              <div class="min-w-0">
                <div class="text-sm font-semibold text-gray-800 truncate">{{ node.person_name || '(Posisi Kosong)' }}</div>
                <div class="text-xs text-gray-400 truncate">{{ node.title }}</div>
              </div>
            </div>

            <!-- Status -->
            <div class="px-4 py-3.5">
              <span :class="node.status === 'active' ? 'badge-green' : 'badge-gray'">
                <span :class="['w-1.5 h-1.5 rounded-full', node.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400']"></span>
                {{ node.status === 'active' ? 'Active' : 'Inactive' }}
              </span>
            </div>

            <!-- Division -->
            <div class="px-4 py-3.5">
              <span class="badge-blue">{{ node.division || '—' }}</span>
            </div>

            <!-- Email -->
            <div class="px-4 py-3.5 text-xs text-gray-400 truncate">{{ node.email || '—' }}</div>

            <!-- Level -->
            <div class="px-4 py-3.5 text-sm font-bold text-gray-700">L{{ getNodeLevel(node.id) }}</div>

            <!-- Parent -->
            <div class="px-4 py-3.5 text-xs text-gray-400 truncate">
              {{ node.parent_id ? (jabatan.nodesMap[node.parent_id]?.title || '—') : 'Root' }}
            </div>

            <!-- Actions -->
            <div class="px-4 py-3.5 flex gap-1" @click.stop>
              <button v-if="auth.isAdmin" @click="modal.openEdit(node)" class="btn-icon">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              </button>
              <button v-if="auth.isAdmin" @click="modal.openDelete(node)" class="btn-icon hover:text-red-500 hover:bg-red-50">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          </div>
          <div v-if="!paginated.length" class="py-16 text-center text-gray-400">
            <p class="font-medium text-sm">Tidak ada jabatan ditemukan</p>
          </div>
        </div>
        
        <!-- Pagination -->
        <div class="border-t border-gray-200 px-4 py-3 flex items-center justify-between bg-gray-50">
          <button @click="page = Math.max(1, page-1)" :disabled="page===1"
            class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-white disabled:opacity-40 transition-colors">
            ← Previous
          </button>
          <div class="flex items-center gap-1">
            <button v-for="p in totalPages" :key="p" @click="page=p"
              :class="['w-8 h-8 rounded-lg text-xs font-semibold transition-colors',
                page===p ? 'bg-pelindo-blue text-white' : 'text-gray-600 hover:bg-gray-100']">
              {{ p }}
            </button>
          </div>
          <button @click="page = Math.min(totalPages, page+1)" :disabled="page===totalPages"
            class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-white disabled:opacity-40 transition-colors">
            Next →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useJabatanStore } from '@/stores/jabatan.store'
import { useModalStore }   from '@/stores/modal.store'
import { useAuthStore }    from '@/stores/auth.store'
import { getLevel }        from '@/utils/tree'

const jabatan = useJabatanStore()
const modal   = useModalStore()
const auth    = useAuthStore()

const page    = ref(1)
const perPage = 10

const totalPages = computed(() => Math.max(1, Math.ceil(jabatan.filteredNodes.length / perPage)))

const paginated = computed(() => {
  const start = (page.value - 1) * perPage
  return jabatan.filteredNodes.slice(start, start + perPage)
})

const COLORS = ['#4F46E5','#059669','#D97706','#DC2626','#7C3AED','#0891B2','#BE185D']

const avatarStyle = (n) => {
  const c = COLORS[n.id % COLORS.length]
  return { background: c + '15', color: c }
}

const initials = (name) =>
  (name || '').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

const getNodeLevel = (nodeId) => getLevel(nodeId, jabatan.nodesMap)
</script>
