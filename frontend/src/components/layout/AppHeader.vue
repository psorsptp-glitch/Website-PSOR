<template>
  <header class="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4 flex-shrink-0">
    <div>
      <h1 class="text-base font-bold text-gray-900">Struktur Organisasi</h1>
    </div>
    <div class="flex items-center gap-5 text-sm text-gray-500 ml-1">
      <span>Total: <strong class="text-gray-800">{{ jabatan.stats.total }}</strong> Jabatan</span>
      <span class="hidden md:inline">Divisi: <strong class="text-gray-800">{{ jabatan.stats.divCount }}</strong></span>
      <span class="hidden md:inline">Aktif: <strong class="text-emerald-600">{{ jabatan.stats.active }}</strong></span>
    </div>
    <div class="ml-auto flex items-center gap-2">
      <button v-if="auth.isAdmin" @click="modal.openCreate()"
        class="btn-primary">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" d="M12 4v16M4 12h16"/>
        </svg>
        <span class="hidden sm:inline">Tambah Jabatan</span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { useAuthStore }    from '@/stores/auth.store'
import { useJabatanStore } from '@/stores/jabatan.store'
import { useModalStore }   from '@/stores/modal.store'

const auth    = useAuthStore()
const jabatan = useJabatanStore()
const modal   = useModalStore()
</script>
