<template>
  <teleport to="body">
    <transition name="modal">
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background:rgba(10,20,40,0.55);backdrop-filter:blur(6px)"
        @click.self="modal.closeDelete()">
        <div class="modal-box bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
          <div class="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-red-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </div>
          <h3 class="text-base font-bold text-gray-900 mb-1">Hapus Jabatan?</h3>
          <p class="text-sm text-gray-500 mb-1">
            Jabatan <strong class="text-gray-800">"{{ modal.deleteTarget?.title }}"</strong>
          </p>
          <p class="text-sm text-red-500 mb-5">akan dihapus permanen dan tidak dapat dikembalikan.</p>
          <div class="flex gap-3 justify-center">
            <button @click="modal.closeDelete()" class="btn-secondary">Batal</button>
            <button @click="confirmDelete" :disabled="deleting" class="btn-danger">
              <svg v-if="deleting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
              Ya, Hapus
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>
<script setup>
import { ref } from 'vue'
import { useJabatanStore } from '@/stores/jabatan.store'
import { useModalStore }   from '@/stores/modal.store'
import { useToastStore }   from '@/stores/toast.store'

const jabatan = useJabatanStore()
const modal   = useModalStore()
const toast   = useToastStore()
const deleting = ref(false)

async function confirmDelete() {
  deleting.value = true
  try {
    await jabatan.remove(modal.deleteTarget.id)
    toast.success(`"${modal.deleteTarget.title}" berhasil dihapus`)
    modal.closeDelete()
  } catch (err) {
    toast.error(err.message || 'Gagal menghapus jabatan')
  } finally {
    deleting.value = false
  }
}
</script>
