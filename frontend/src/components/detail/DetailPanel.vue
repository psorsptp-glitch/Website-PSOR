<template>
  <aside class="w-96 flex-shrink-0 bg-white border-l border-gray-200 flex flex-col h-full shadow-xl">
    <!-- Header -->
    <div class="px-5 py-4 border-b border-gray-100 bg-gradient-to-br from-blue-50 to-white flex-shrink-0">
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0" :style="avatarStyle">
            {{ initials }}
          </div>
          <div>
            <h3 class="text-sm font-bold text-gray-900 leading-tight">{{ node.title }}</h3>
            <p class="text-xs text-gray-500 mt-0.5">{{ node.person_name || 'Posisi Kosong' }}</p>
          </div>
        </div>
        <button @click="jabatan.clearSelection()" class="btn-icon mt-0.5">×</button>
      </div>

      <!-- Badges -->
      <div class="flex flex-wrap gap-1.5 mb-3">
        <span class="badge-blue">L{{ nodeLevel }}</span>
        <span :class="node.status === 'active' ? 'badge-green' : 'badge-gray'">
          {{ node.status === 'active' ? 'Aktif' : 'Tidak Aktif' }}
        </span>
        <span class="badge-gray">{{ node.division || 'Umum' }}</span>
        <span v-if="node.kode" class="badge badge-orange">{{ node.kode }}</span>
      </div>

      <!-- Action buttons -->
      <div v-if="auth.isAdmin" class="flex gap-2">
        <button @click="modal.openEdit(node)" class="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-pelindo-blue bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors">
          ✏️ Edit
        </button>
        <button @click="modal.openCreate(node.id)" class="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors">
          + Sub-jabatan
        </button>
        <button @click="modal.openDelete(node)" class="w-9 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-xl transition-colors">
          🗑
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-gray-200 flex-shrink-0">
      <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
        :class="['tab-btn flex-1', activeTab === tab.id ? 'active' : '']">
        {{ tab.label }}
      </button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4 space-y-3">

      <!-- IDENTITAS -->
      <template v-if="activeTab === 'identitas'">
        <InfoRow label="Nama Jabatan" :value="node.title" />
        <InfoRow label="Kode" :value="node.kode" />
        <InfoRow label="Pejabat" :value="node.person_name" />
        <InfoRow label="Email" :value="node.email" />
        <InfoRow label="Divisi" :value="node.division" />
        <InfoRow label="Level" :value="node.level_label || `L${nodeLevel}`" />
        <InfoRow label="Parent" :value="parentTitle" />
        <InfoRow label="Status" :value="node.status === 'active' ? 'Aktif' : 'Tidak Aktif'" />
        <div class="bg-gray-50 rounded-xl p-3">
          <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Sub-jabatan</div>
          <div v-if="children.length" class="space-y-1">
            <button v-for="c in children" :key="c.id" @click="jabatan.selectNode(c)"
              class="flex items-center gap-2 text-xs text-pelindo-blue hover:underline w-full text-left">
              <span class="w-1.5 h-1.5 rounded-full bg-pelindo-blue/40 flex-shrink-0"></span>
              {{ c.title }}
            </button>
          </div>
          <p v-else class="text-xs text-gray-400 italic">Tidak ada sub-jabatan</p>
        </div>
      </template>

      <!-- FUNGSI & TUGAS -->
      <template v-if="activeTab === 'fungsi'">
        <DetailSection title="Fungsi Jabatan" :content="node.fungsi || node.fungsi_jabatan" />
        
        <!-- Tugas & Tanggung Jawab (Struktur Baru) -->
        <div v-if="node.tugas_tanggung_jawab?.length">
          <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">📋 Tugas & Tanggung Jawab</div>
          <div class="space-y-2">
            <div v-for="(tugas, idx) in node.tugas_tanggung_jawab" :key="idx" class="bg-indigo-50 border border-indigo-200 rounded-xl p-3">
              <div class="text-xs font-semibold text-indigo-900 mb-1.5">{{ tugas.deskripsi_tugas }}</div>
              <div v-if="tugas.hasil_diharapkan?.length" class="pl-3 space-y-1">
                <div v-for="(hasil, hIdx) in tugas.hasil_diharapkan" :key="hIdx" class="flex items-start gap-2 text-xs text-gray-700">
                  <span class="w-1 h-1 rounded-full bg-indigo-500 flex-shrink-0 mt-1.5"></span>
                  <span>{{ hasil }}</span>
                </div>
              </div>
              <div v-else class="text-xs text-gray-400 italic pl-3">Belum ada hasil yang diharapkan</div>
            </div>
          </div>
        </div>
        <DetailSection v-else title="Tugas & Tanggung Jawab" :items="node.tugas" />

        <!-- Tugas Umum (Optional) -->
        <div v-if="node.tugas_tanggung_jawab_umum?.length" class="mt-3">
          <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">📌 Tugas Umum</div>
          <div class="space-y-2">
            <div v-for="(tugas, idx) in node.tugas_tanggung_jawab_umum" :key="idx" class="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <div class="text-xs font-semibold text-amber-900 mb-1.5">{{ tugas.deskripsi_tugas }}</div>
              <div v-if="tugas.hasil_diharapkan?.length" class="pl-3 space-y-1">
                <div v-for="(hasil, hIdx) in tugas.hasil_diharapkan" :key="hIdx" class="flex items-start gap-2 text-xs text-gray-700">
                  <span class="w-1 h-1 rounded-full bg-amber-500 flex-shrink-0 mt-1.5"></span>
                  <span>{{ hasil }}</span>
                </div>
              </div>
              <div v-else class="text-xs text-gray-400 italic pl-3">Belum ada hasil yang diharapkan</div>
            </div>
          </div>
        </div>

        <!-- Hasil yang Diharapkan (Backward Compat) -->
        <DetailSection v-if="!node.tugas_tanggung_jawab?.length && node.hasil?.length" title="Hasil yang Diharapkan" :items="node.hasil" />
        
        <!-- Wewenang -->
        <DetailSection title="Wewenang" :items="node.wewenang" />
      </template>

      <!-- KOORDINASI -->
      <template v-if="activeTab === 'koordinasi'">
        <div>
          <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Koordinasi Internal</div>
          <div v-if="node.koordinasi_internal?.length" class="space-y-2">
            <div v-for="(k,i) in node.koordinasi_internal" :key="i" class="bg-gray-50 rounded-xl p-3">
              <div class="text-xs font-semibold text-gray-800">{{ k.pihak }}</div>
              <div class="text-xs text-gray-500 mt-0.5">{{ k.aktivitas }}</div>
            </div>
          </div>
          <p v-else class="text-xs text-gray-400 italic bg-gray-50 rounded-xl p-3">Belum ada data</p>
        </div>
        <div>
          <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Relasi Eksternal</div>
          <div v-if="node.relasi_eksternal?.length" class="space-y-2">
            <div v-for="(r,i) in node.relasi_eksternal" :key="i" class="bg-gray-50 rounded-xl p-3">
              <div class="text-xs font-semibold text-gray-800">{{ r.pihak }}</div>
              <div class="text-xs text-gray-500 mt-0.5">{{ r.aktivitas }}</div>
            </div>
          </div>
          <p v-else class="text-xs text-gray-400 italic bg-gray-50 rounded-xl p-3">Belum ada data</p>
        </div>
      </template>

      <!-- DIMENSI -->
      <template v-if="activeTab === 'dimensi'">
        <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          <p class="text-xs font-bold text-emerald-700 mb-2">💰 Dimensi Finansial</p>
          <div v-if="node.dimensi_finansial?.anggaran_operasional" class="text-xs text-gray-700 leading-relaxed">
            {{ node.dimensi_finansial.anggaran_operasional }}
          </div>
          <p v-else class="text-xs text-gray-400 italic">Belum ada data</p>
        </div>
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <p class="text-xs font-bold text-blue-700 mb-2">📊 Dimensi Non-Finansial</p>
          <div v-if="node.dimensi_non_finansial" class="text-xs text-gray-700 leading-relaxed">
            {{ node.dimensi_non_finansial }}
          </div>
          <p v-else class="text-xs text-gray-400 italic">Belum ada data</p>
        </div>
      </template>

    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useJabatanStore } from '@/stores/jabatan.store'
import { useModalStore }   from '@/stores/modal.store'
import { useAuthStore }    from '@/stores/auth.store'
import InfoRow      from './InfoRow.vue'
import DetailSection from './DetailSection.vue'

const jabatan = useJabatanStore()
const modal   = useModalStore()
const auth    = useAuthStore()

const node     = computed(() => jabatan.selectedNode)
const children = computed(() => jabatan.nodesMap[node.value?.id]?.children || [])
const parentTitle = computed(() => node.value?.parent_id ? (jabatan.nodesMap[node.value.parent_id]?.title || '—') : 'Root')

const nodeLevel = computed(() => {
  let level = 1, n = jabatan.nodesMap[node.value?.id]
  while (n && n.parent_id) { level++; n = jabatan.nodesMap[n.parent_id] }
  return level
})

const COLORS = ['#4F46E5','#059669','#D97706','#DC2626','#7C3AED']
const avatarStyle = computed(() => {
  const c = COLORS[(node.value?.id || 0) % COLORS.length]
  return { background: c + '15', color: c }
})
const initials = computed(() => (node.value?.person_name || node.value?.title || '?').split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase())

const hasFinansial    = computed(() => node.value?.dimensi_finansial?.anggaran_operasional)
const hasNonFinansial = computed(() => node.value?.dimensi_non_finansial)

const activeTab = ref('identitas')
const tabs = [
  { id: 'identitas',  label: 'Identitas'   },
  { id: 'fungsi',     label: 'Fungsi'      },
  { id: 'koordinasi', label: 'Koordinasi'  },
  { id: 'dimensi',    label: 'Dimensi'     }
]
</script>
