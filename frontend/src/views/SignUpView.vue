<template>
  <div class="relative flex min-h-screen overflow-hidden">
    <img :src="bgImage" alt="Pelindo" class="absolute inset-0 object-cover w-full h-full" />
    <div class="absolute inset-0 bg-black/40"></div>
    <div class="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent"></div>
    <div class="absolute z-20 text-right top-8 right-10">
      <h2 class="text-4xl font-black leading-tight text-white drop-shadow-lg">
        Pengembangan <span class="text-pelindo-orange">SDM &amp; Organisasi</span>
      </h2>
    </div>
    <div class="relative z-10 flex flex-col justify-center w-full max-w-[420px] px-10 py-12 min-h-screen overflow-y-auto">
        <!-- Logo -->
      <!-- <div class="mb-10">
        <img src="/src/assets/img/logo.svg" alt="Pelindo" class="h-auto w-auto"
          @error="logoFallback = true" v-if="!logoFallback" />
        <div v-else class="flex items-center gap-2">
          <div class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <span class="text-lg font-black text-white">P</span>
          </div>
        </div>
      </div> -->

      <h1 class="mb-1 text-3xl font-black text-white drop-shadow">Sign Up</h1>
      <p class="mb-6 text-sm text-white/75">Register your credentials to access your account</p>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div v-for="field in fields" :key="field.key">
          <label class="block mb-1.5 text-sm font-semibold text-white/90">
            {{ field.label }}
          </label>

          <select
          v-if="field.type ==='select'"
          v-model="form[field.key]"
          class="w-full px-4 py-3 text-sm text-white rounded-xl outline-none transition-all bg-white/15 backdrop-blur-md border placeholder-white/50 focus:bg-white/20 focus:border-white/60"
        >
          <option value="" class="text-gray-800 bg-white">Pilih Role</option>
          <option value="admin" class="text-gray-800 bg-white">Administrator</option>
          <option value="viewer" class="text-gray-800 bg-white">Viewer</option>
        </select>

        <input
          v-else
          v-model="form[field.key]"
          :type="field.type === 'password'
            ? (showPwd[field.key] ? 'text' : 'password')
            : field.type"
          :placeholder="field.placeholder"
          class="w-full px-4 py-3 text-sm text-white rounded-xl outline-none transition-all bg-white/15 backdrop-blur-md border border-white/30 placeholder-white/50"
        />

          <p v-if="errors[field.key]" class="mt-1 text-xs text-red-300">{{ errors[field.key] }}</p>
        </div>

        <button type="submit" :disabled="loading"
          class="w-full py-3 text-sm font-bold text-white transition-all rounded-xl bg-pelindo-blue hover:bg-blue-600 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg mt-2">
          <span v-if="loading" class="flex items-center justify-center gap-2">
            <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
            Creating account...
          </span>
          <span v-else>Sign Up</span>
        </button>
      </form>

      <p class="mt-6 text-sm text-center text-white/70">
        Already have an account?
        <router-link to="/sign-in" class="font-bold text-white hover:text-pelindo-orange transition-colors underline underline-offset-2">Sign in here</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'

const router  = useRouter()
const auth    = useAuthStore()
const toast   = useToastStore()
const bgImage = ref('https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1600&q=80')
const loading = ref(false)
const showPwd = reactive({ password: false, confirm: false })

const fields = [
  { key: 'name',     label: 'Nama Lengkap', type: 'text',     placeholder: 'Nama lengkap Anda' },
  { key: 'email',    label: 'Email Address', type: 'email',    placeholder: 'hello@example.com' },
  { key: 'role',     label: 'Role',          type: 'select',   placeholder: '' },
  { key: 'password', label: 'Password',      type: 'password', placeholder: '••••••••••••••' },
  { key: 'confirm',  label: 'Ulangi Password', type: 'password', placeholder: '••••••••••••••' }
]

const form   = reactive({ name: '', email: '', role: '', password: '', confirm: '' })
const errors = reactive({ name: '', email: '', role: '', password: '', confirm: '' })

function validate() {
  Object.keys(errors).forEach(k => errors[k] = '')
  let valid = true
  if (!form.name.trim())  { errors.name = 'Nama wajib diisi'; valid = false }
  if (!form.email)        { errors.email = 'Email wajib diisi'; valid = false }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { errors.email = 'Format email tidak valid'; valid = false }
  if (!form.role)         { errors.role = 'Role wajib dipilih'; valid = false }
  if (!form.password || form.password.length < 6) { errors.password = 'Password minimal 6 karakter'; valid = false }
  if (form.password !== form.confirm) { errors.confirm = 'Password tidak sama'; valid = false }
  return valid
}

async function handleRegister() {
  if (!validate()) return
  loading.value = true
  try {
    await auth.register({ name: form.name, email: form.email, password: form.password, role: form.role })
    toast.success('Akun berhasil dibuat!')
    router.push('/dashboard/struktur-org')
  } catch (err) {
    toast.error(err.message || 'Registrasi gagal')
  } finally {
    loading.value = false
  }
}
</script>
