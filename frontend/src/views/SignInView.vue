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
    <div class="relative z-10 flex flex-col justify-center w-full max-w-[420px] px-10 py-12 min-h-screen">
      <!-- Logo -->
      <div class="mb-10">
        <img src="/src/assets/img/logo.svg" alt="Pelindo" class="h-auto w-auto"
          @error="logoFallback = true" v-if="!logoFallback" />
        <div v-else class="flex items-center gap-2">
          <div class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <span class="text-lg font-black text-white">P</span>
          </div>
        </div>
      </div>

      <!-- <h1 class="mb-1 text-3xl font-black text-white drop-shadow">Sign In</h1>
      <p class="mb-8 text-sm text-white/75">Welcome back. Enter your credentials to access your account</p> -->

      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="block mb-1.5 text-sm font-semibold text-white/90">Email Address</label>
          <input v-model="form.email" type="email" placeholder="hello@example.com" autocomplete="email"
            :class="['w-full px-4 py-3 text-sm text-white rounded-xl outline-none transition-all bg-white/15 backdrop-blur-md border placeholder-white/50 focus:bg-white/20 focus:border-white/60', errors.email ? 'border-red-400' : 'border-white/30']" />
          <p v-if="errors.email" class="mt-1 text-xs text-red-300">{{ errors.email }}</p>
        </div>
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="text-sm font-semibold text-white/90">Password</label>
            <button type="button" class="text-xs font-medium text-pelindo-orange hover:text-orange-300 transition-colors">Forgot Password</button>
          </div>
          <div class="relative">
            <input v-model="form.password" :type="showPwd ? 'text' : 'password'" placeholder="••••••••••••••" autocomplete="current-password"
              :class="['w-full px-4 py-3 pr-11 text-sm text-white rounded-xl outline-none transition-all bg-white/15 backdrop-blur-md border placeholder-white/50 focus:bg-white/20 focus:border-white/60', errors.password ? 'border-red-400' : 'border-white/30']" />
            <button type="button" @click="showPwd = !showPwd" class="absolute -translate-y-1/2 right-3 top-1/2 text-white/60 hover:text-white transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path v-if="!showPwd" stroke-linecap="round" stroke-linejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle v-if="!showPwd" cx="12" cy="12" r="3"/>
                <path v-else stroke-linecap="round" stroke-linejoin="round" d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/>
              </svg>
            </button>
          </div>
          <p v-if="errors.password" class="mt-1 text-xs text-red-300">{{ errors.password }}</p>
        </div>
        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input v-model="form.remember" type="checkbox" class="w-4 h-4 rounded accent-pelindo-blue border-white/40" />
          <span class="text-sm text-white/80">Keep me signed in</span>
        </label>
        <button type="submit" :disabled="loading"
          class="w-full py-3 text-sm font-bold text-white transition-all rounded-xl bg-pelindo-blue hover:bg-blue-600 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/40 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg">
          <span v-if="loading" class="flex items-center justify-center gap-2">
            <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
            Signing in...
          </span>
          <span v-else>Continue</span>
        </button>
      </form>

      <div class="flex items-center gap-3 my-6">
        <div class="flex-1 h-px bg-white/25"></div>
        <span class="text-xs text-white/60 whitespace-nowrap">or sign up with</span>
        <div class="flex-1 h-px bg-white/25"></div>
      </div>

      <div class="grid grid-cols-3 gap-3">
        <button v-for="social in socials" :key="social.name" type="button" :title="social.name"
          class="flex items-center justify-center py-3 px-4 rounded-xl border border-white/25 bg-white/15 backdrop-blur-md hover:bg-white/25 transition-all shadow-sm"
          v-html="social.icon">
        </button>
      </div>

      <p class="mt-6 text-sm text-center text-white/70">
        Don't have an Account?
        <router-link to="/sign-up" class="font-bold text-white hover:text-pelindo-orange transition-colors underline underline-offset-2">Sign up here</router-link>
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
const logoFallback = ref(false)
const showPwd  = ref(false)
const loading  = ref(false)
const form     = reactive({ email: '', password: '', remember: false })
const errors   = reactive({ email: '', password: '' })

const socials = [
  { name: 'Google', icon: `<svg viewBox="0 0 24 24" class="w-5 h-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>` },
  { name: 'Facebook', icon: `<svg viewBox="0 0 24 24" class="w-5 h-5"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>` },
  { name: 'Apple', icon: `<svg viewBox="0 0 24 24" class="w-5 h-5" fill="white"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.56-1.701"/></svg>` }
]

function validate() {
  errors.email = ''; errors.password = ''
  let valid = true
  if (!form.email) { errors.email = 'Email wajib diisi'; valid = false }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { errors.email = 'Format email tidak valid'; valid = false }
  if (!form.password) { errors.password = 'Password wajib diisi'; valid = false }
  return valid
}

async function handleLogin() {
  if (!validate()) return
  loading.value = true
  try {
    await auth.login(form.email, form.password)
    toast.success('Selamat datang kembali!')
    router.push('/dashboard/struktur-org')
  } catch (err) {
    toast.error(err.message || 'Email atau password salah')
  } finally {
    loading.value = false
  }
}
</script>
