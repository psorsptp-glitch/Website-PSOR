<template>
  <teleport to="body">
    <transition name="modal">
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background:rgba(10,20,40,0.55);backdrop-filter:blur(6px)"
        @click.self="modal.closeForm()">
        <div class="modal-box bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[94vh] flex flex-col overflow-hidden">

          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <div>
              <h2 class="text-base font-bold text-gray-900">{{ modal.editingNode ? 'Edit Jabatan' : 'Tambah Jabatan Baru' }}</h2>
              <p class="text-xs text-gray-400 mt-0.5">{{ modal.editingNode ? 'Perbarui data jabatan' : 'Isi data jabatan lengkap' }}</p>
            </div>
            <button @click="modal.closeForm()" class="btn-icon">✕</button>
          </div>

          <!-- Tabs -->
          <div class="flex border-b border-gray-200 bg-gray-50 overflow-x-auto flex-shrink-0">
            <button v-for="tab in formTabs" :key="tab.id" @click="activeTab = tab.id"
              :class="['px-5 py-3 text-xs font-semibold transition-all border-b-2 -mb-px whitespace-nowrap',
                activeTab === tab.id ? 'border-pelindo-blue text-pelindo-blue bg-white' : 'border-transparent text-gray-500 hover:text-gray-700']">
              {{ tab.label }}
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto px-6 py-5">

            <!-- TAB: Informasi Dasar -->
            <div v-show="activeTab === 'dasar'" class="space-y-5">
              <div class="grid grid-cols-2 gap-4">
                <!-- Row 1: Nama Jabatan -->
                <div class="col-span-2">
                  <label class="form-label">Nama Jabatan <span class="text-red-500">*</span></label>
                  <input v-model="form.nama_jabatan" placeholder="cth: Manajer Operasional TPK 1" :class="['form-input', errors.nama_jabatan ? 'error' : '']" />
                  <p v-if="errors.nama_jabatan" class="form-error">{{ errors.nama_jabatan }}</p>
                </div>

                <!-- Row 2: Basic Info -->
                <div>
                  <label class="form-label">Nama Pejabat</label>
                  <input v-model="form.nama_pejabat" placeholder="Nama lengkap" class="form-input" />
                </div>
                <div>
                  <label class="form-label">Email</label>
                  <input v-model="form.email" type="email" placeholder="jabatan@pelindo.co.id" class="form-input" />
                </div>

                <!-- Row 3: Level & Kode -->
                <div>
                  <label class="form-label">Level Jabatan</label>
                  <select v-model="form.level_jabatan" class="form-select">
                    <option value="">Pilih Level</option>
                    <option value="LEVEL DIREKSI (BOD)">Direksi (BOD)</option>
                    <option value="LEVEL BOD - 1">BOD - 1</option>
                    <option value="LEVEL BOD - 2">BOD - 2</option>
                    <option value="LEVEL BOD - 3">BOD - 3</option>
                    <option value="LEVEL BOD - 4">BOD - 4</option>
                  </select>
                </div>
                <div>
                  <label class="form-label">Kode Jabatan</label>
                  <input v-model="form.kode" placeholder="cth: DIR-OPS-001" class="form-input" />
                </div>

                <!-- Row 4: Dinas & Sub Dinas -->
                <div>
                  <label class="form-label">Dinas</label>
                  <input v-model="form.dinas" list="dinas-list" placeholder="cth: Operasional" class="form-input" />
                  <datalist id="dinas-list">
                    <option v-for="d in jabatan.divisions" :key="d" :value="d" />
                  </datalist>
                </div>
                <div>
                  <label class="form-label">Sub Dinas</label>
                  <input v-model="form.sub_dinas" placeholder="cth: TPK" class="form-input" />
                </div>

                <!-- Row 5: Unit & Lokasi -->
                <div>
                  <label class="form-label">Unit Kerja</label>
                  <input v-model="form.unit_kerja" placeholder="cth: Terminal 1" class="form-input" />
                </div>
                <div>
                  <label class="form-label">Lokasi</label>
                  <input v-model="form.lokasi" placeholder="cth: Jakarta" class="form-input" />
                </div>

                <!-- Row 6: Direktorat & Atasan -->
                <div>
                  <label class="form-label">Direktorat</label>
                  <input v-model="form.direktorat" placeholder="cth: Direksi Operasi" class="form-input" />
                </div>
                <div>
                  <label class="form-label">Atasan</label>
                  <input v-model="form.atasan" placeholder="Nama atasan" class="form-input" />
                </div>

                <!-- Row 7: Atasan Langsung & Organization -->
                <div>
                  <label class="form-label">Atasan Langsung</label>
                  <input v-model="form.atasan_langsung" placeholder="Nama atasan langsung" class="form-input" />
                </div>
                <div>
                  <label class="form-label">Organization</label>
                  <select v-model="form.organization" class="form-select">
                    <option value="kantor_pusat">Kantor Pusat</option>
                    <option value="terminal">Terminal</option>
                    <option value="anak_perusahaan">Anak Perusahaan</option>
                  </select>
                </div>

                <!-- Row 8: Parent & Status -->
                <div>
                  <label class="form-label">Parent Jabatan</label>
                  <select v-model="form.parent_id" class="form-select">
                    <option :value="null">— Root / Tidak ada parent —</option>
                    <option v-for="n in parentOptions" :key="n.id" :value="n.id">{{ n.nama_jabatan || n.title }}</option>
                  </select>
                </div>
                <div>
                  <label class="form-label">Status</label>
                  <select v-model="form.status" class="form-select">
                    <option value="active">Aktif</option>
                    <option value="inactive">Tidak Aktif</option>
                  </select>
                </div>

                <!-- Row 9: Keywords & Revisi -->
                <div class="col-span-2">
                  <label class="form-label">Keyword <span class="text-gray-400 text-xs font-normal">(pisahkan dengan Enter)</span></label>
                  <div class="flex flex-wrap gap-2 mb-2">
                    <span v-for="(kw, i) in form.keyword" :key="i" class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2">
                      {{ kw }}
                      <button @click="form.keyword.splice(i, 1)" type="button" class="text-blue-400 hover:text-blue-600">✕</button>
                    </span>
                  </div>
                  <input v-model="keywordInput" @keydown.enter="addKeyword" placeholder="Ketik keyword dan tekan Enter" class="form-input" />
                </div>

                <div>
                  <label class="form-label">Revisi Ke</label>
                  <input v-model.number="form.revisi_ke" type="number" min="1" class="form-input" />
                </div>
              </div>
            </div>

            <!-- TAB: Fungsi & Tugas -->
            <div v-show="activeTab === 'fungsi'" class="space-y-6">
              <!-- Fungsi Jabatan -->
              <div>
                <label class="form-label">Fungsi Jabatan</label>
                <textarea v-model="form.fungsi_jabatan" rows="3" placeholder="Deskripsikan fungsi utama jabatan..." class="form-textarea"></textarea>
              </div>

              <!-- Tugas Tanggung Jawab (Nested) -->
              <div class="border-2 border-indigo-100 rounded-xl p-4 bg-indigo-50">
                <div class="flex items-center justify-between mb-3">
                  <label class="form-label mb-0 text-indigo-700">📋 Tugas & Tanggung Jawab</label>
                  <button @click="addTugas('utama')" type="button" class="text-xs text-indigo-600 font-semibold hover:text-indigo-700 hover:underline">+ Tambah Tugas</button>
                </div>
                <div class="space-y-3">
                  <div v-if="form.tugas_tanggung_jawab.length === 0" class="text-center text-sm text-indigo-500 italic py-4">
                    Belum ada tugas. Klik tombol di atas untuk menambah.
                  </div>
                  <div v-for="(tugas, tIndex) in form.tugas_tanggung_jawab" :key="tIndex" class="bg-white rounded-lg border border-indigo-200 p-3 space-y-2">
                    <!-- Deskripsi Tugas -->
                    <div>
                      <div class="flex items-center justify-between mb-1">
                        <label class="text-xs font-semibold text-gray-700">Tugas #{{ tIndex + 1 }}</label>
                        <button @click="form.tugas_tanggung_jawab.splice(tIndex, 1)" type="button" class="text-xs text-gray-400 hover:text-red-500">Hapus Tugas</button>
                      </div>
                      <textarea v-model="tugas.deskripsi_tugas" rows="2" placeholder="Deskripsikan tugas..." class="form-textarea text-sm"></textarea>
                    </div>
                    <!-- Hasil yang Diharapkan -->
                    <div>
                      <div class="flex items-center justify-between mb-1">
                        <label class="text-xs font-semibold text-gray-700">Hasil Diharapkan</label>
                        <button @click="addHasil('utama', tIndex)" type="button" class="text-xs text-indigo-600 font-semibold hover:underline">+ Tambah Hasil</button>
                      </div>
                      <div class="space-y-1 pl-3">
                        <div v-if="tugas.hasil_diharapkan.length === 0" class="text-xs text-gray-400 italic py-2">Belum ada hasil.</div>
                        <div v-for="(hasil, hIndex) in tugas.hasil_diharapkan" :key="hIndex" class="flex gap-2 items-start">
                          <input v-model="tugas.hasil_diharapkan[hIndex]" placeholder="Hasil yang diharapkan..." class="form-input text-sm flex-1" />
                          <button @click="tugas.hasil_diharapkan.splice(hIndex, 1)" type="button" class="text-gray-300 hover:text-red-400 transition-colors mt-2">✕</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tugas Umum (Optional) -->
              <div class="border-2 border-amber-100 rounded-xl p-4 bg-amber-50">
                <div class="flex items-center justify-between mb-3">
                  <label class="form-label mb-0 text-amber-700">📌 Tugas Umum (Optional)</label>
                  <button @click="addTugas('umum')" type="button" class="text-xs text-amber-600 font-semibold hover:text-amber-700 hover:underline">+ Tambah Tugas</button>
                </div>
                <div class="space-y-3">
                  <div v-if="form.tugas_tanggung_jawab_umum.length === 0" class="text-center text-sm text-amber-500 italic py-4">
                    Belum ada tugas umum.
                  </div>
                  <div v-for="(tugas, tIndex) in form.tugas_tanggung_jawab_umum" :key="tIndex" class="bg-white rounded-lg border border-amber-200 p-3 space-y-2">
                    <div>
                      <div class="flex items-center justify-between mb-1">
                        <label class="text-xs font-semibold text-gray-700">Tugas #{{ tIndex + 1 }}</label>
                        <button @click="form.tugas_tanggung_jawab_umum.splice(tIndex, 1)" type="button" class="text-xs text-gray-400 hover:text-red-500">Hapus</button>
                      </div>
                      <textarea v-model="tugas.deskripsi_tugas" rows="2" placeholder="Deskripsikan tugas umum..." class="form-textarea text-sm"></textarea>
                    </div>
                    <div>
                      <div class="flex items-center justify-between mb-1">
                        <label class="text-xs font-semibold text-gray-700">Hasil</label>
                        <button @click="addHasil('umum', tIndex)" type="button" class="text-xs text-amber-600 font-semibold hover:underline">+ Tambah</button>
                      </div>
                      <div class="space-y-1 pl-3">
                        <div v-if="tugas.hasil_diharapkan.length === 0" class="text-xs text-gray-400 italic py-2">Belum ada hasil.</div>
                        <div v-for="(hasil, hIndex) in tugas.hasil_diharapkan" :key="hIndex" class="flex gap-2 items-start">
                          <input v-model="tugas.hasil_diharapkan[hIndex]" placeholder="Hasil yang diharapkan..." class="form-input text-sm flex-1" />
                          <button @click="tugas.hasil_diharapkan.splice(hIndex, 1)" type="button" class="text-gray-300 hover:text-red-400 transition-colors mt-2">✕</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Wewenang -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <label class="form-label mb-0">Wewenang</label>
                  <button @click="addWewenang" type="button" class="text-xs text-pelindo-blue font-semibold hover:underline">+ Tambah</button>
                </div>
                <div class="space-y-2">
                  <div v-if="form.wewenang.length === 0" class="text-xs text-gray-400 italic py-2">Belum ada wewenang.</div>
                  <div v-for="(w, i) in form.wewenang" :key="i" class="flex gap-2 items-center">
                    <input v-model="form.wewenang[i]" placeholder="Wewenang..." class="form-input flex-1 py-2 text-xs" />
                    <button @click="form.wewenang.splice(i, 1)" type="button" class="text-gray-300 hover:text-red-400 transition-colors">✕</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- TAB: Koordinasi -->
            <div v-show="activeTab === 'koordinasi'" class="space-y-5">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <label class="form-label mb-0">Koordinasi Internal</label>
                  <button @click="addRow('internal')" type="button" class="text-xs text-pelindo-blue font-semibold hover:underline">+ Tambah</button>
                </div>
                <div class="space-y-2">
                  <div v-for="(k, i) in form.koordinasi_internal" :key="i" class="flex gap-2 items-center">
                    <input v-model="k.pihak" placeholder="Pihak internal" class="form-input flex-1 py-2 text-xs" />
                    <input v-model="k.aktivitas" placeholder="Aktivitas" class="form-input flex-1 py-2 text-xs" />
                    <button @click="form.koordinasi_internal.splice(i,1)" type="button" class="text-gray-300 hover:text-red-400 transition-colors">✕</button>
                  </div>
                  <p v-if="!form.koordinasi_internal.length" class="text-xs text-gray-400 italic">Belum ada data.</p>
                </div>
              </div>
              <div>
                <div class="flex items-center justify-between mb-2">
                  <label class="form-label mb-0">Relasi Eksternal</label>
                  <button @click="addRow('eksternal')" type="button" class="text-xs text-pelindo-blue font-semibold hover:underline">+ Tambah</button>
                </div>
                <div class="space-y-2">
                  <div v-for="(r, i) in form.relasi_eksternal" :key="i" class="flex gap-2 items-center">
                    <input v-model="r.pihak" placeholder="Pihak eksternal" class="form-input flex-1 py-2 text-xs" />
                    <input v-model="r.aktivitas" placeholder="Aktivitas" class="form-input flex-1 py-2 text-xs" />
                    <button @click="form.relasi_eksternal.splice(i,1)" type="button" class="text-gray-300 hover:text-red-400 transition-colors">✕</button>
                  </div>
                  <p v-if="!form.relasi_eksternal.length" class="text-xs text-gray-400 italic">Belum ada data.</p>
                </div>
              </div>
            </div>

            <!-- TAB: Dimensi -->
            <div v-show="activeTab === 'dimensi'" class="space-y-4">
              <!-- Dimensi Finansial -->
              <div class="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                <p class="text-xs font-bold text-emerald-700 mb-3">💰 Dimensi Finansial</p>
                <div>
                  <label class="text-xs font-medium text-gray-600 block mb-1">Anggaran Operasional</label>
                  <textarea v-model="form.dimensi_finansial.anggaran_operasional" rows="2" placeholder="cth: Rp 100 Miliar/tahun" class="form-textarea text-sm"></textarea>
                </div>
              </div>
              <!-- Dimensi Non-Finansial -->
              <div class="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p class="text-xs font-bold text-blue-700 mb-3">📊 Dimensi Non-Finansial</p>
                <textarea v-model="form.dimensi_non_finansial" rows="3" placeholder="Deskripsikan dimensi non-finansial..." class="form-textarea text-sm"></textarea>
              </div>
              <!-- Deskripsi Dimensi Finansial -->
              <div class="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <p class="text-xs font-bold text-purple-700 mb-3">📝 Deskripsi Dimensi Finansial</p>
                <textarea v-model="form.deskripsi_dimensi_finansial" rows="3" placeholder="Deskripsikan lebih detail..." class="form-textarea text-sm"></textarea>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <p class="text-xs text-gray-400">* Wajib diisi</p>
            <div class="flex gap-2">
              <button @click="modal.closeForm()" class="btn-secondary">Batal</button>
              <button @click="save" :disabled="saving" class="btn-primary">
                <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                {{ modal.editingNode ? 'Perbarui' : 'Simpan Jabatan' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useJabatanStore } from '@/stores/jabatan.store'
import { useModalStore }   from '@/stores/modal.store'
import { useToastStore }   from '@/stores/toast.store'

const jabatan = useJabatanStore()
const modal   = useModalStore()
const toast   = useToastStore()

const saving = ref(false)
const activeTab = ref('dasar')
const keywordInput = ref('')
const errors = reactive({ nama_jabatan: '' })

const formTabs = [
  { id: 'dasar',      label: 'Informasi Dasar' },
  { id: 'fungsi',     label: 'Fungsi & Tugas'  },
  { id: 'koordinasi', label: 'Koordinasi'      },
  { id: 'dimensi',    label: 'Dimensi'         }
]

const form = reactive({
  // Dasar
  nama_jabatan: '',
  nama_pejabat: '',
  level_jabatan: '',
  kode: '',
  email: '',
  dinas: '-',
  sub_dinas: '-',
  unit_kerja: '',
  lokasi: '',
  direktorat: '',
  atasan: '',
  atasan_langsung: '',
  keyword: [],
  revisi_ke: 1,
  organization: 'kantor_pusat',
  status: 'active',
  parent_id: null,

  // Fungsi & Tugas
  fungsi_jabatan: '',
  tugas_tanggung_jawab: [],
  tugas_tanggung_jawab_umum: [],
  wewenang: [],

  // Koordinasi
  koordinasi_internal: [],
  relasi_eksternal: [],

  // Dimensi
  dimensi_finansial: { anggaran_operasional: '' },
  dimensi_non_finansial: '',
  deskripsi_dimensi_finansial: ''
})

const parentOptions = computed(() =>
  jabatan.nodes.filter(n => !modal.editingNode || n.id !== modal.editingNode.id)
)

function addKeyword() {
  const kw = keywordInput.value.trim()
  if (kw && !form.keyword.includes(kw)) {
    form.keyword.push(kw)
    keywordInput.value = ''
  }
}

function addTugas(type) {
  const tugas = {
    deskripsi_tugas: '',
    hasil_diharapkan: []
  }
  if (type === 'utama') {
    form.tugas_tanggung_jawab.push(tugas)
  } else {
    form.tugas_tanggung_jawab_umum.push(tugas)
  }
}

function addHasil(type, tugasIndex) {
  if (type === 'utama') {
    form.tugas_tanggung_jawab[tugasIndex].hasil_diharapkan.push('')
  } else {
    form.tugas_tanggung_jawab_umum[tugasIndex].hasil_diharapkan.push('')
  }
}

function addWewenang() {
  form.wewenang.push('')
}

function addRow(type) {
  if (type === 'internal') form.koordinasi_internal.push({ pihak: '', aktivitas: '' })
  else form.relasi_eksternal.push({ pihak: '', aktivitas: '' })
}

function resetForm() {
  const e = modal.editingNode
  
  // Data lama / baru (backward compat)
  form.nama_jabatan = e?.nama_jabatan || e?.title || ''
  form.nama_pejabat = e?.nama_pejabat || e?.person_name || ''
  form.level_jabatan = e?.level_jabatan || e?.level_label || ''
  form.kode = e?.kode || ''
  form.email = e?.email || ''
  form.dinas = e?.dinas || e?.division || '-'
  form.sub_dinas = e?.sub_dinas || '-'
  form.unit_kerja = e?.unit_kerja || ''
  form.lokasi = e?.lokasi || ''
  form.direktorat = e?.direktorat || ''
  form.atasan = e?.atasan || ''
  form.atasan_langsung = e?.atasan_langsung || ''
  form.keyword = Array.isArray(e?.keyword) ? [...e.keyword] : []
  form.revisi_ke = e?.revisi_ke || 1
  form.organization = e?.organization || 'kantor_pusat'
  form.status = e?.status || 'active'
  form.parent_id = e?.parent_id ?? modal.defaultParent ?? null
  
  form.fungsi_jabatan = e?.fungsi_jabatan || e?.fungsi || ''
  form.tugas_tanggung_jawab = e?.tugas_tanggung_jawab ? JSON.parse(JSON.stringify(e.tugas_tanggung_jawab)) : []
  form.tugas_tanggung_jawab_umum = e?.tugas_tanggung_jawab_umum ? JSON.parse(JSON.stringify(e.tugas_tanggung_jawab_umum)) : []
  form.wewenang = Array.isArray(e?.wewenang) ? [...e.wewenang] : []
  
  form.koordinasi_internal = e?.koordinasi_internal ? JSON.parse(JSON.stringify(e.koordinasi_internal)) : []
  form.relasi_eksternal = e?.relasi_eksternal ? JSON.parse(JSON.stringify(e.relasi_eksternal)) : []
  
  form.dimensi_finansial = e?.dimensi_finansial ? JSON.parse(JSON.stringify(e.dimensi_finansial)) : { anggaran_operasional: '' }
  form.dimensi_non_finansial = e?.dimensi_non_finansial || ''
  form.deskripsi_dimensi_finansial = e?.deskripsi_dimensi_finansial || ''
  
  errors.nama_jabatan = ''
  keywordInput.value = ''
  activeTab.value = 'dasar'
}

onMounted(resetForm)
watch(() => modal.show, v => { if (v) resetForm() })

async function save() {
  errors.nama_jabatan = ''
  if (!form.nama_jabatan.trim()) {
    errors.nama_jabatan = 'Nama jabatan wajib diisi'
    activeTab.value = 'dasar'
    return
  }

  saving.value = true
  try {
    const payload = {
      nama_jabatan: form.nama_jabatan.trim(),
      nama_pejabat: form.nama_pejabat.trim() || null,
      level_jabatan: form.level_jabatan || null,
      kode: form.kode.trim() || null,
      email: form.email.trim() || null,
      dinas: form.dinas || '-',
      sub_dinas: form.sub_dinas || '-',
      unit_kerja: form.unit_kerja.trim() || null,
      lokasi: form.lokasi.trim() || null,
      direktorat: form.direktorat.trim() || null,
      atasan: form.atasan.trim() || null,
      atasan_langsung: form.atasan_langsung.trim() || null,
      keyword: form.keyword,
      revisi_ke: form.revisi_ke || 1,
      organization: form.organization,
      status: form.status,
      parent_id: form.parent_id,
      
      fungsi_jabatan: form.fungsi_jabatan.trim() || null,
      tugas_tanggung_jawab: form.tugas_tanggung_jawab
        .filter(t => t.deskripsi_tugas.trim())
        .map(t => ({
          deskripsi_tugas: t.deskripsi_tugas.trim(),
          hasil_diharapkan: t.hasil_diharapkan.filter(h => h.trim())
        })),
      tugas_tanggung_jawab_umum: form.tugas_tanggung_jawab_umum
        .filter(t => t.deskripsi_tugas.trim())
        .map(t => ({
          deskripsi_tugas: t.deskripsi_tugas.trim(),
          hasil_diharapkan: t.hasil_diharapkan.filter(h => h.trim())
        })),
      wewenang: form.wewenang.filter(w => w.trim()),
      
      koordinasi_internal: form.koordinasi_internal.filter(k => k.pihak),
      relasi_eksternal: form.relasi_eksternal.filter(r => r.pihak),
      
      dimensi_finansial: form.dimensi_finansial,
      dimensi_non_finansial: form.dimensi_non_finansial.trim() || null,
      deskripsi_dimensi_finansial: form.deskripsi_dimensi_finansial.trim() || null
    }

    if (modal.editingNode) {
      await jabatan.update(modal.editingNode.id, payload)
      toast.success('Jabatan berhasil diperbarui')
    } else {
      const created = await jabatan.create(payload)
      jabatan.selectNode(created)
      toast.success('Jabatan baru berhasil ditambahkan')
    }
    modal.closeForm()
  } catch (err) {
    toast.error(err.message || 'Gagal menyimpan jabatan')
  } finally {
    saving.value = false
  }
}
</script>
