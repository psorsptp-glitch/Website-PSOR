import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/utils/api'

export const useAuthStore = defineStore('auth', () => {
  const user  = ref(JSON.parse(localStorage.getItem('pelindo_user') || 'null'))
  const token = ref(localStorage.getItem('pelindo_token') || null)

  const isLoggedIn = computed(() => !!user.value && !!token.value)
  const isAdmin    = computed(() => user.value?.role === 'admin')

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password })
    user.value  = res.data.user
    token.value = res.data.token
    localStorage.setItem('pelindo_user',  JSON.stringify(res.data.user))
    localStorage.setItem('pelindo_token', res.data.token)
    return res.data
  }

  async function register(payload) {
    const res = await api.post('/auth/register', payload)
    user.value  = res.data.user
    token.value = res.data.token
    localStorage.setItem('pelindo_user',  JSON.stringify(res.data.user))
    localStorage.setItem('pelindo_token', res.data.token)
    return res.data
  }

  function logout() {
    user.value  = null
    token.value = null
    localStorage.removeItem('pelindo_user')
    localStorage.removeItem('pelindo_token')
  }

  return { user, token, isLoggedIn, isAdmin, login, register, logout }
})
