<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-100">

    <!-- Toolbar -->
    <div class="bg-white border-b border-gray-200 px-6 py-2.5 flex items-center gap-3 flex-shrink-0 no-print">
      <!-- Jabatan selector -->
      <div class="flex items-center gap-2">
        <label class="text-xs font-semibold text-gray-500 whitespace-nowrap">Pilih Jabatan:</label>
        <select v-model="selectedId" class="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white outline-none focus:border-pelindo-blue min-w-[260px]">
          <option :value="null">— Pilih jabatan untuk dilihat —</option>
          <option v-for="node in jabatan.nodes" :key="node.id" :value="node.id">
            {{ node.title }} {{ node.person_name ? `(${node.person_name})` : '' }}
          </option>
        </select>
      </div>

      <!-- Navigation arrows -->
      <div class="flex gap-1">
        <button @click="prevNode" :disabled="!canPrev"
          class="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-pelindo-blue hover:text-pelindo-blue disabled:opacity-30 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M15 18l-6-6 6-6"/></svg>
        </button>
        <button @click="nextNode" :disabled="!canNext"
          class="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-pelindo-blue hover:text-pelindo-blue disabled:opacity-30 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      <span v-if="selectedNode" class="text-xs text-gray-400">
        {{ currentIndex + 1 }} / {{ jabatan.nodes.length }}
      </span>

      <div class="ml-auto flex items-center gap-2">
        <!-- Edit shortcut -->
        <button v-if="selectedNode && auth.isAdmin"
          @click="modal.openEdit(selectedNode)"
          class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-gray-300 rounded-lg text-gray-600 hover:border-pelindo-blue hover:text-pelindo-blue transition-colors">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          Edit Jabatan
        </button>
        <!-- Export PDF -->
        <button v-if="selectedNode" @click="exportPDF"
          class="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-pelindo-blue hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          Export PDF
        </button>
      </div>
    </div>

    <!-- Document area -->
    <div class="flex-1 overflow-auto p-6 no-print-bg" id="doc-scroll-area">

      <!-- Empty state -->
      <div v-if="!selectedNode" class="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
        <svg class="w-16 h-16 opacity-30" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24">
          <path stroke-linecap="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <p class="text-sm font-medium">Pilih jabatan untuk melihat Uraian Jabatan</p>
        <p class="text-xs">atau klik jabatan dari Tree View / List View</p>
      </div>

      <!-- ═══════ URAIAN JABATAN DOCUMENT ═══════ -->
      <div v-else id="uraian-jabatan-doc"
        class="max-w-xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden print-area">

        <!-- Document header with Pelindo branding -->
        <div class="border-b-2 border-gray-800 px-8 py-0.5 flex items-center justify-between bg-white">
          <div>
            <p class="text-xs font-black text-black tracking-wide">Uraian Jabatan</p>
          </div>
          <div class="flex items-right">
            <img
              :src="logoPelindo"
              alt="Pelindo Logo"
              class="w-15 h-20 object-contain rounded-xl"
            />
          </div>
        </div>

        <div class="px-8 py-6 space-y-6">

          <!-- I. IDENTITAS JABATAN -->
          <section>
            <h2 class="doc-section-title">I. IDENTITAS JABATAN</h2>
            <table class="w-full border-collapse text-sm">
              <tbody>
                <tr class="border border-gray-400">
                  <td class="doc-td-label font-bold">Nama Jabatan</td>
                  <td class="doc-td-value font-medium">{{ selectedNode.title }}</td>
                </tr>
                <!-- <tr class="border border-gray-400">
                  <td class="doc-td-label font-bold">Kode Jabatan</td>
                  <td class="doc-td-value">{{ selectedNode.kode || '—' }}</td>
                </tr> -->
                <tr class="border border-gray-400">
                  <td class="doc-td-label font-bold">Nama Pejabat</td>
                  <td class="doc-td-value">{{ selectedNode.person_name || '—' }}</td>
                </tr>
                <tr class="border border-gray-400">
                  <td class="doc-td-label font-bold">Sub Dinas</td>
                  <td class="doc-td-value">{{ selectedNode.sub_dinas || '—' }}</td>
                </tr>
                <tr class="border border-gray-400">
                  <td class="doc-td-label font-bold">Dinas</td>
                  <td class="doc-td-value">{{ selectedNode.division || selectedNode.dinas || '—' }}</td>
                </tr>
                <tr class="border border-gray-400">
                  <td class="doc-td-label font-bold">Lokasi</td>
                  <td class="doc-td-value">{{ selectedNode.lokasi || '—' }}</td>
                </tr>
                <tr class="border border-gray-400">
                  <td class="doc-td-label font-bold">Atasan Langsung</td>
                  <td class="doc-td-value">{{ selectedNode.atasan || selectedNode.atasan || '—' }}</td>
                </tr>
                <tr class="border border-gray-400">
                  <td class="doc-td-label font-bold">Atasan dari atasan Langsung</td>
                  <td class="doc-td-value">{{ selectedNode.atasan_langsung || selectedNode.atasan || '—' }}</td>
                </tr>
                <tr class="border border-gray-400">
                  <td class="doc-td-label font-bold">Keyword</td>
                  <td class="doc-td-value">{{ selectedNode.keyword || selectedNode.keyword || '—' }}</td>
                </tr>
                
                <!-- <tr class="border border-gray-400">
                  <td class="doc-td-label font-bold">Email</td>
                  <td class="doc-td-value">{{ selectedNode.email || '—' }}</td>
                </tr>
                <tr class="border border-gray-400">
                  <td class="doc-td-label font-bold">Status</td>
                  <td class="doc-td-value">
                    <span :class="selectedNode.status === 'active' ? 'text-emerald-600 font-semibold' : 'text-gray-400'">
                      {{ selectedNode.status === 'active' ? 'Aktif' : 'Tidak Aktif' }}
                    </span>
                  </td>
                </tr> -->
              </tbody>
            </table>
          </section>

          <!-- II. POSISI DALAM STRUKTUR ORGANISASI -->
          <!-- II. POSISI DALAM STRUKTUR ORGANISASI -->
          <section>
            <h2 class="doc-section-title">II. POSISI DALAM STRUKTUR ORGANISASI</h2>
            <table class="w-full border-collapse text-sm">
              <tbody>
                <tr class="border border-gray-400">
                  <!-- <td class="doc-td-label font-bold align-middle">Posisi / Deskripsi</td>
                  <td class="doc-td-value">{{ selectedNode.posisi || '—' }}</td> -->
                </tr>
                <tr class="border border-gray-400">
                  <!-- <td class="doc-td-label font-bold align-middle">Gambar Jabatan</td> -->
                  <td class="doc-td-value p-0">

                    <!-- ═══ IMAGE CELL ═══ -->
                    <div class="relative flex items-center justify-center min-h-[200px]">

                      <!-- Loading spinner -->
                      <div v-if="imageLoading[selectedNode.id]"
                           class="flex flex-col items-center gap-2 text-blue-500 py-8">
                        <svg class="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        <span class="text-xs">Memuat gambar…</span>
                      </div>

                      <!-- ── Ada gambar ── -->
                      <template v-else-if="posisiImages[selectedNode.id]">
                        <img
                          :src="posisiImages[selectedNode.id]"
                          :alt="`Foto ${selectedNode.title}`"
                          class="max-h-56 max-w-full w-auto object-contain py-3 px-4"
                          @error="onImageError(selectedNode.id)"
                        />

                        <!-- Hover overlay (no-print) -->
                        <div
                          v-if="!uploadMenuOpen[selectedNode.id]"
                          class="no-print absolute inset-0 bg-black/0 hover:bg-black/25 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 cursor-pointer"
                          @click="openUploadMenu(selectedNode.id)">
                          <div class="flex items-center gap-1.5 bg-white/95 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full shadow-md">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                              <path stroke-linecap="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 16H9v-3z"/>
                            </svg>
                            Ganti Gambar
                          </div>
                          <button
                            @click.stop="removeImage(selectedNode.id)"
                            class="w-8 h-8 rounded-full bg-white/95 flex items-center justify-center shadow-md hover:bg-red-50 transition-colors"
                            title="Hapus gambar">
                            <svg class="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                              <path stroke-linecap="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                          </button>
                        </div>
                      </template>

                      <!-- ── Belum ada gambar — placeholder ── -->
                      <template v-else>
                        <div
                          v-if="!uploadMenuOpen[selectedNode.id]"
                          class="no-print flex flex-col items-center gap-2 py-10 w-full cursor-pointer group/ph hover:bg-blue-50/40 transition-colors"
                          @click="openUploadMenu(selectedNode.id)">
                          <div class="w-14 h-14 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center group-hover/ph:border-pelindo-blue transition-colors">
                            <svg class="w-6 h-6 text-gray-300 group-hover/ph:text-pelindo-blue transition-colors" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                              <path stroke-linecap="round" d="M12 4v16m8-8H4"/>
                            </svg>
                          </div>
                          <p class="text-xs text-gray-400 group-hover/ph:text-pelindo-blue transition-colors font-medium">Klik untuk upload gambar</p>
                          <p class="text-[10px] text-gray-300">JPG, PNG, WEBP · maks 5MB</p>
                        </div>
                      </template>

                      <!-- ═══ UPLOAD MENU POPUP (no-print) ═══ -->
                      <div
                        v-if="uploadMenuOpen[selectedNode.id]"
                        class="no-print absolute inset-0 flex items-center justify-center bg-white/97 z-10">
                        <div class="w-full max-w-[280px] px-4 py-4 flex flex-col gap-3">

                          <!-- Header -->
                          <div class="flex items-center justify-between">
                            <p class="text-xs font-semibold text-gray-700">Pilih Sumber Gambar</p>
                            <button @click="closeUploadMenu(selectedNode.id)"
                              class="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                                <path stroke-linecap="round" d="M6 18L18 6M6 6l12 12"/>
                              </svg>
                            </button>
                          </div>

                          <!-- Option 1: Upload Komputer -->
                          <button
                            @click="triggerFileInput(selectedNode.id); closeUploadMenu(selectedNode.id)"
                            class="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-pelindo-blue hover:bg-blue-50/40 text-left transition-all group/opt">
                            <div class="w-9 h-9 rounded-lg bg-gray-100 group-hover/opt:bg-pelindo-blue/10 flex items-center justify-center flex-shrink-0 transition-colors">
                              <svg class="w-4.5 h-4.5 text-gray-500 group-hover/opt:text-pelindo-blue transition-colors" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <path stroke-linecap="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                              </svg>
                            </div>
                            <div>
                              <p class="text-xs font-semibold text-gray-700 group-hover/opt:text-pelindo-blue transition-colors">Upload dari Komputer</p>
                              <p class="text-[10px] text-gray-400 mt-0.5">JPG, PNG, WEBP · maks 5MB</p>
                            </div>
                          </button>

                          <!-- Option 2: Google Drive / URL -->
                          <button
                            @click="showGdriveInput[selectedNode.id] = !showGdriveInput[selectedNode.id]"
                            class="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-green-400 hover:bg-green-50/40 text-left transition-all group/gdrive">
                            <div class="w-9 h-9 rounded-lg bg-gray-100 group-hover/gdrive:bg-green-100 flex items-center justify-center flex-shrink-0 transition-colors">
                              <!-- Google Drive icon -->
                              <svg class="w-4.5 h-4.5 text-gray-500 group-hover/gdrive:text-green-600 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M4.433 22l3.696-6.4H22l-3.696 6.4H4.433zm-.855-1.481L1 15.2 8.567 2h3.697L4.696 15.2l-.854 1.481-.264.838zm10.994-5.919H7.865L11.56 8h3.697l3.694 6.4-3.579.2z"/>
                              </svg>
                            </div>
                            <div>
                              <p class="text-xs font-semibold text-gray-700 group-hover/gdrive:text-green-700 transition-colors">Google Drive / URL</p>
                              <p class="text-[10px] text-gray-400 mt-0.5">Paste link gambar atau GDrive</p>
                            </div>
                          </button>

                          <!-- GDrive input (expand in-place) -->
                          <div v-if="showGdriveInput[selectedNode.id]"
                               class="flex flex-col gap-2 px-1">
                            <div class="flex gap-1.5">
                              <input
                                v-model="urlInputMap[selectedNode.id]"
                                type="text"
                                placeholder="https://drive.google.com/..."
                                class="flex-1 text-xs border border-gray-300 rounded-lg px-2.5 py-2 outline-none focus:border-pelindo-blue placeholder-gray-300"
                                @keyup.enter="applyUrlImage(selectedNode.id); closeUploadMenu(selectedNode.id)"
                                autofocus
                              />
                              <button
                                @click="applyUrlImage(selectedNode.id); closeUploadMenu(selectedNode.id)"
                                class="px-3 py-2 text-xs font-semibold bg-pelindo-blue hover:bg-blue-700 text-white rounded-lg transition-colors">
                                OK
                              </button>
                            </div>
                            <p class="text-[10px] text-gray-400 pl-0.5">Pastikan file GDrive di-share <span class="font-semibold">"Anyone with the link"</span> → View</p>
                          </div>

                          <!-- Error -->
                          <p v-if="imageError[selectedNode.id]" class="text-[11px] text-red-500 text-center px-1">
                            {{ imageError[selectedNode.id] }}
                          </p>

                        </div>
                      </div>
                      <!-- ═══ END UPLOAD MENU ═══ -->

                    </div>

                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Hidden file input -->
            <input
              type="file"
              :ref="el => { if (el) fileInputRefs[selectedNode.id] = el }"
              accept="image/jpeg,image/png,image/webp"
              class="hidden"
              @change="onFileChange($event, selectedNode.id)"
            />
          </section>

          <!-- III. FUNGSI JABATAN -->
          <section>
            <h2 class="doc-section-title">III. FUNGSI JABATAN</h2>
            <div class="border border-gray-400 p-4 text-sm text-gray-800 leading-relaxed min-h-[80px]">
              {{ selectedNode.fungsi_jabatan || selectedNode.fungsi || '—' }}
            </div>
          </section>

          <!-- IV. TUGAS UTAMA -->
          <section>
            <h2 class="doc-section-title">IV. TUGAS UTAMA</h2>
            <table class="w-full border-collapse text-sm">
              <thead>
                <tr class="bg-gray-100">
                  <th class="border border-gray-400 px-3 py-2 text-center font-bold w-10">No.</th>
                  <th class="border border-gray-400 px-3 py-2 text-center font-bold w-1/2">Tugas &amp; Tanggung Jawab</th>
                  <th class="border border-gray-400 px-3 py-2 text-center font-bold">Hasil Akhir yang Diharapkan</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="selectedNode.tugas_tanggung_jawab?.length">
                  <tr v-for="(tugas, i) in selectedNode.tugas_tanggung_jawab" :key="i" class="align-top">
                    <td class="border border-gray-400 px-3 py-2 text-center">{{ i + 1 }}.</td>
                    <td class="border border-gray-400 px-3 py-2">{{ tugas.deskripsi_tugas }}</td>
                    <td class="border border-gray-400 px-3 py-2">
                      <div v-if="tugas.hasil_diharapkan?.length" class="space-y-1">
                        <div v-for="(hasil, hIdx) in tugas.hasil_diharapkan" :key="hIdx" class="flex items-start gap-2">
                          <span class="flex-shrink-0">•</span>
                          <span>{{ hasil }}</span>
                        </div>
                      </div>
                      <span v-else class="text-gray-400 italic">—</span>
                    </td>
                  </tr>
                </template>
                <tr v-else>
                  <td colspan="3" class="border border-gray-400 px-3 py-3 text-center text-gray-400 italic">Belum ada data tugas utama</td>
                </tr>
              </tbody>
            </table>
          </section>

          <!-- V. TUGAS UTAMA -->
          <section>
            <h2 class="doc-section-title">V. TUGAS & Tanggung Jawab Umum</h2>
            <table class="w-full border-collapse text-sm">
              <thead>
                <tr class="bg-gray-100">
                  <th class="border border-gray-400 px-3 py-2 text-center font-bold w-10">No.</th>
                  <th class="border border-gray-400 px-3 py-2 text-center font-bold w-1/2">Tugas &amp; Tanggung Jawab Umum</th>
                  <th class="border border-gray-400 px-3 py-2 text-center font-bold">Hasil Akhir yang Diharapkan</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="selectedNode.tugas_tanggung_jawab_umum?.length">
                  <tr v-for="(tugas, i) in selectedNode.tugas_tanggung_jawab_umum" :key="i" class="align-top">
                    <td class="border border-gray-400 px-3 py-2 text-center">{{ i + 1 }}.</td>
                    <td class="border border-gray-400 px-3 py-2">{{ tugas.deskripsi_tugas }}</td>
                    <td class="border border-gray-400 px-3 py-2">
                      <div v-if="tugas.hasil_diharapkan?.length" class="space-y-1">
                        <div v-for="(hasil, hIdx) in tugas.hasil_diharapkan" :key="hIdx" class="flex items-start gap-2">
                          <span class="flex-shrink-0">•</span>
                          <span>{{ hasil }}</span>
                        </div>
                      </div>
                      <span v-else class="text-gray-400 italic">—</span>
                    </td>
                  </tr>
                </template>
                <tr v-else>
                  <td colspan="3" class="border border-gray-400 px-3 py-3 text-center text-gray-400 italic">Belum ada data tugas umum</td>
                </tr>
              </tbody>
            </table>
          </section>

          <!-- VI. WEWENANG -->
          <section>
            <h2 class="doc-section-title">VI. WEWENANG</h2>
            <table class="w-full border-collapse text-sm">
              <thead>
                <tr class="bg-gray-100">
                  <th class="border border-gray-400 px-3 py-2 text-center font-bold w-10">No.</th>
                  <th class="border border-gray-400 px-3 py-2 text-left font-bold">Kewenangan</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(w, i) in (selectedNode.wewenang || [])" :key="i">
                  <td class="border border-gray-400 px-3 py-2 text-center">{{ i + 1 }}.</td>
                  <td class="border border-gray-400 px-3 py-2">{{ w }}</td>
                </tr>
                <tr v-if="!(selectedNode.wewenang?.length)">
                  <td colspan="2" class="border border-gray-400 px-3 py-3 text-center text-gray-400 italic">Belum ada data wewenang</td>
                </tr>
              </tbody>
            </table>
          </section>

          <!-- VII. KOORDINASI INTERNAL -->
          <section>
            <h2 class="doc-section-title">VII. KOORDINASI INTERNAL</h2>
            <table class="w-full border-collapse text-sm">
              <thead>
                <tr class="bg-gray-100">
                  <th class="border border-gray-400 px-3 py-2 text-left font-bold w-2/5">Pihak Internal</th>
                  <th class="border border-gray-400 px-3 py-2 text-left font-bold">Aktivitas</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(k, i) in (selectedNode.koordinasi_internal || [])" :key="i">
                  <td class="border border-gray-400 px-3 py-2">{{ k.pihak }}</td>
                  <td class="border border-gray-400 px-3 py-2">{{ k.aktivitas }}</td>
                </tr>
                <tr v-if="!(selectedNode.koordinasi_internal?.length)">
                  <td colspan="2" class="border border-gray-400 px-3 py-3 text-center text-gray-400 italic">Belum ada data koordinasi internal</td>
                </tr>
              </tbody>
            </table>
          </section>

          <!-- VIII. RELASI EKSTERNAL -->
          <section>
            <h2 class="doc-section-title">VIII
              . RELASI EKSTERNAL</h2>
            <table class="w-full border-collapse text-sm">
              <thead>
                <tr class="bg-gray-100">
                  <th class="border border-gray-400 px-3 py-2 text-left font-bold w-2/5">Pihak Eksternal</th>
                  <th class="border border-gray-400 px-3 py-2 text-left font-bold">Aktivitas</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(r, i) in (selectedNode.relasi_eksternal || [])" :key="i">
                  <td class="border border-gray-400 px-3 py-2">{{ r.pihak }}</td>
                  <td class="border border-gray-400 px-3 py-2">{{ r.aktivitas }}</td>
                </tr>
                <tr v-if="!(selectedNode.relasi_eksternal?.length)">
                  <td colspan="2" class="border border-gray-400 px-3 py-3 text-center text-gray-400 italic">Belum ada data relasi eksternal</td>
                </tr>
              </tbody>
            </table>
          </section>

          <!-- IX. DIMENSI -->
          <section>
            <h2 class="doc-section-title">IX. DIMENSI</h2>
            <table class="w-full border-collapse text-sm">
              <thead>
                <tr class="bg-gray-100">
                  <th class="border border-gray-400 px-3 py-2 text-center font-bold">Finansial</th>
                  <th class="border border-gray-400 px-3 py-2 text-center font-bold">Non - Finansial</th>
                </tr>
              </thead>
              <tbody>
                <tr class="align-top">
                  <td class="border border-gray-400 px-3 py-3 w-1/2">
                    <div v-if="selectedNode.dimensi_finansial?.anggaran_operasional" class="text-sm text-gray-800 leading-relaxed">
                      {{ selectedNode.dimensi_finansial.anggaran_operasional }}
                    </div>
                    <span v-else class="text-gray-400 italic">Belum ada data finansial</span>
                  </td>
                  <td class="border border-gray-400 px-3 py-3">
                    <div v-if="selectedNode.dimensi_non_finansial" class="text-sm text-gray-800 leading-relaxed">
                      {{ selectedNode.dimensi_non_finansial }}
                    </div>
                    <span v-else class="text-gray-400 italic">Belum ada data non-finansial</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2 class="doc-section-title">X. PERSYARATAN JABATAN</h2>
            <table class="w-full border-collapse text-sm">
              <thead>
                <tr class="bg-gray-100">
                  <th class="border border-gray-400 px-3 py-2 text-center font-bold">Kompetensi Inti</th>
                  <th class="border border-gray-400 px-3 py-2 text-center font-bold">Level</th>
                </tr>
              </thead>
              <tbody>
                <tr class="align-top">
                  <td class="border border-gray-400 px-3 py-3 w-1/2">
                    <span class="text-gray-400 italic">Belum ada data Kompetensi inti</span>
                  </td>
                  <td class="border border-gray-400 px-3 py-3">
                    <span class="text-gray-400 italic">Belum ada data Level</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <!-- Footer -->
          <!-- <div class="border-t border-gray-300 pt-4 text-xs text-gray-400 text-right">
            Dokumen dihasilkan oleh Sistem Manajemen Struktur Organisasi — PT Pelindo Terminal Petikemas
          </div> -->

        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useJabatanStore } from '@/stores/jabatan.store'
import { useModalStore }   from '@/stores/modal.store'
import { useAuthStore }    from '@/stores/auth.store'
import api from '@/utils/api'
import logoPelindo from '@/assets/img/logo.svg'

const jabatan = useJabatanStore()
const modal   = useModalStore()
const auth    = useAuthStore()

// ── Image upload per jabatan ────────────────────────────────────────
/** key: nodeId → base64 / url string */
const posisiImages    = ref({})
const imageLoading    = ref({})
const imageError      = ref({})
const isSavingImage   = ref({})
const urlInputMap     = ref({})
const fileInputRefs   = ref({})
const uploadMenuOpen  = ref({})  // popup pilihan upload
const showGdriveInput = ref({}) // expand input GDrive/URL

function openUploadMenu(nodeId) {
  uploadMenuOpen.value[nodeId]  = true
  showGdriveInput.value[nodeId] = false
  imageError.value[nodeId]      = ''
}

function closeUploadMenu(nodeId) {
  uploadMenuOpen.value[nodeId]  = false
  showGdriveInput.value[nodeId] = false
}

const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES  = ['image/jpeg', 'image/png', 'image/webp']

function triggerFileInput(nodeId) {
  fileInputRefs.value[nodeId]?.click()
}

function onFileChange(event, nodeId) {
  const file = event.target.files?.[0]
  if (!file) return

  imageError.value[nodeId] = ''

  if (!ALLOWED_TYPES.includes(file.type)) {
    imageError.value[nodeId] = 'Format tidak didukung. Gunakan JPG, PNG, atau WEBP.'
    return
  }
  if (file.size > MAX_SIZE_BYTES) {
    imageError.value[nodeId] = 'Ukuran file melebihi 5MB.'
    return
  }

  imageLoading.value[nodeId] = true
  const reader = new FileReader()
  reader.onload = async (e) => {
    const base64Data = e.target.result
    // Save ke backend
    await saveImageToBackend(nodeId, base64Data)
    imageLoading.value[nodeId] = false
  }
  reader.onerror = () => {
    imageError.value[nodeId]   = 'Gagal membaca file.'
    imageLoading.value[nodeId] = false
  }
  reader.readAsDataURL(file)

  // Reset input so same file can be re-selected
  event.target.value = ''
}

/** Load image dari database */
async function loadImageFromBackend(nodeId) {
  try {
    const data = await api.get(`/jabatan/${nodeId}`)
    if (data.data?.posisi_gambar_url) {
      posisiImages.value[nodeId] = data.data.posisi_gambar_url
    } else {
      posisiImages.value[nodeId] = null
    }
  } catch (err) {
    console.error('Gagal load gambar:', err)
    posisiImages.value[nodeId] = null
  }
}

/** Save image URL ke backend */
async function saveImageToBackend(nodeId, imageUrl) {
  try {
    isSavingImage.value[nodeId] = true
    await api.patch(`/jabatan/${nodeId}/gambar`, { posisi_gambar_url: imageUrl })

    posisiImages.value[nodeId] = imageUrl
    imageError.value[nodeId] = ''
  } catch (err) {
    imageError.value[nodeId] = err.response?.data?.message || err.message || 'Gagal menyimpan gambar'
    if (imageUrl !== null) {
      posisiImages.value[nodeId] = null
    }
  } finally {
    isSavingImage.value[nodeId] = false
  }
}

/** Convert Google Drive share link → direct image URL */
function convertGDriveUrl(url) {
  const trimmed = url.trim()

  // Format: https://drive.google.com/file/d/FILE_ID/view...
  const matchFile = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (matchFile) {
    const id = matchFile[1]
    // Use uc endpoint yang lebih stabil untuk image
    return `https://drive.google.com/uc?export=view&id=${id}`
  }

  // Format: https://drive.google.com/open?id=FILE_ID
  const matchOpen = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (matchOpen) {
    const id = matchOpen[1]
    return `https://drive.google.com/uc?export=view&id=${id}`
  }

  // Format: https://drive.google.com/uc?id=FILE_ID (manual paste lama)
  const matchUc = trimmed.match(/uc\?.*?id=([a-zA-Z0-9_-]+)/)
  if (matchUc) {
    const id = matchUc[1]
    return `https://drive.google.com/uc?export=view&id=${id}`
  }

  // Bukan GDrive — kembalikan URL aslinya
  return trimmed
}

function applyUrlImage(nodeId) {
  const raw = (urlInputMap.value[nodeId] || '').trim()
  if (!raw) return

  imageError.value[nodeId]   = ''
  imageLoading.value[nodeId] = true

  const url = convertGDriveUrl(raw)

  // Save ke backend
  saveImageToBackend(nodeId, url)
  urlInputMap.value[nodeId]   = ''
}

function removeImage(nodeId) {
  // Set null (delete) di backend juga
  saveImageToBackend(nodeId, null)
  imageError.value[nodeId] = ''
}

function onImageError(nodeId) {
  const current = posisiImages.value[nodeId]
  posisiImages.value[nodeId] = null

  // Beri pesan berbeda jika ini dari GDrive
  if (current?.includes('drive.google.com')) {
    imageError.value[nodeId] = 'Gagal memuat dari Google Drive. Pastikan file di-share "Anyone with the link can view".'
  } else {
    imageError.value[nodeId] = 'Gambar gagal dimuat. Coba URL lain atau upload dari komputer.'
  }
}

// ── Selected node id (driven by dropdown OR by store.selectedNode) ──
const selectedId = ref(jabatan.selectedNode?.id ?? null)

// Sync when store.selectedNode changes (from tree/list clicks)
watch(() => jabatan.selectedNode, (node) => {
  if (node) {
    selectedId.value = node.id
    // Load gambar dari database saat node berubah
    loadImageFromBackend(node.id)
  }
})

// Sync when dropdown changes
watch(selectedId, (id) => {
  if (id) {
    const node = jabatan.nodes.find(n => n.id === id)
    if (node) jabatan.selectNode(node)
  }
})

const selectedNode = computed(() =>
  selectedId.value ? jabatan.nodes.find(n => n.id === selectedId.value) ?? null : null
)

// ── Navigation ──────────────────────────────────────────────────────
const currentIndex = computed(() =>
  jabatan.nodes.findIndex(n => n.id === selectedId.value)
)
const canPrev = computed(() => currentIndex.value > 0)
const canNext = computed(() => currentIndex.value < jabatan.nodes.length - 1)

function prevNode() {
  if (canPrev.value) selectedId.value = jabatan.nodes[currentIndex.value - 1].id
}
function nextNode() {
  if (canNext.value) selectedId.value = jabatan.nodes[currentIndex.value + 1].id
}

// ── Derived data ────────────────────────────────────────────────────
const nodeLevel = computed(() => {
  if (!selectedNode.value) return 1
  let level = 1, node = jabatan.nodesMap[selectedNode.value.id]
  while (node && node.parent_id) { level++; node = jabatan.nodesMap[node.parent_id] }
  return level
})

const parentTitle = computed(() => {
  if (!selectedNode.value?.parent_id) return 'Root / Tidak ada atasan'
  return jabatan.nodesMap[selectedNode.value.parent_id]?.title || '—'
})

const hasFinansial    = computed(() => selectedNode.value?.dimensi_finansial?.anggaran_operasional)
const hasNonFinansial = computed(() => selectedNode.value?.dimensi_non_finansial)

// ── Export PDF ───────────────────────────────────────────────────────
async function exportPDF() {
  try {
    const element  = document.getElementById('uraian-jabatan-doc')
    if (!element) {
      alert('Dokumen tidak ditemukan')
      return
    }

    const filename = (selectedNode.value?.title || 'Uraian_Jabatan').replace(/\s+/g, '_')

    // Dynamic import html2pdf
    const html2pdf = (await import('html2pdf.js')).default

    const opt = {
      margin: 10,
      filename: `${filename}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }

    html2pdf().set(opt).from(element).save()
  } catch (error) {
    console.error('Export PDF error:', error)
    alert('Gagal export PDF. Coba lagi atau hubungi admin.')
  }
}
</script>

<style scoped>
/* Document section title */
.doc-section-title {
  @apply text-sm font-black text-gray-900 uppercase tracking-wide
         border-gray-800 pb-1 mb-1;
}
/* Table cells */
.doc-td-label {
  @apply px-3 py-2 bg-gray-50 text-gray-700 w-48 border-r border-gray-400 text-sm align-top;
}
.doc-td-value {
  @apply px-3 py-2 text-gray-800 text-sm align-top;
}

/* Print styles */
@media print {
  .no-print { display: none !important; }
  #uraian-jabatan-doc {
    box-shadow: none !important;
    border-radius: 0 !important;
    margin: 0 !important;
    max-width: 100% !important;
  }
  .print-area { page-break-inside: avoid; }
  section { page-break-inside: avoid; margin-bottom: 16px; }
}
</style>