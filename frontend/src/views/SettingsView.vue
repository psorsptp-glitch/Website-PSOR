<template>
  <div class="h-full overflow-auto p-6 bg-gray-50">
    <div class="max-w-xl mx-auto space-y-4">
      <div class="card p-6">
        <h2 class="text-base font-bold text-gray-900 mb-5">Profil Akun</h2>
        <div class="flex items-center gap-4 mb-5">
          <div class="w-14 h-14 rounded-2xl bg-pelindo-blue flex items-center justify-center text-white text-xl font-black">{{ initials }}</div>
          <div>
            <p class="font-bold text-gray-900">{{ auth.user?.name }}</p>
            <p class="text-sm text-gray-500">{{ auth.user?.email }}</p>
            <span class="badge-blue capitalize mt-1">{{ auth.user?.role }}</span>
          </div>
        </div>
        <div class="space-y-3">
          <div><label class="form-label">Nama</label><input v-model="name" class="form-input" /></div>
          <button @click="save" class="btn-primary text-sm">Simpan Perubahan</button>
        </div>
      </div>

      <!-- Logout Card -->
      <div class="card p-6 border-l-4 border-l-red-500">
        <h2 class="text-base font-bold text-gray-900 mb-4">Logout</h2>
        <p class="text-sm text-gray-600 mb-4">Anda akan keluar dari akun ini dan dikembalikan ke halaman login.</p>
        <button @click="handleLogout" class="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors text-sm">
          <svg class="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Log out
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()
const { success } = useToast()

const name = ref(auth.user?.name || '')
const initials = computed(() => (auth.user?.name || 'U').split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase())

function save() { auth.updateUser?.({ name: name.value }); toast.success('Profile berhasil disimpan') }

function handleLogout() {
  auth.logout()
  success('Berhasil logout')
  router.push('/sign-in')
}
</script>
