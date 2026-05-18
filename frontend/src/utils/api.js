import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

// ── Request interceptor: attach token ────────────────────────────────
api.interceptors.request.use(config => {
  const token = localStorage.getItem('pelindo_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
}, Promise.reject)

// ── Response interceptor: handle 401 ─────────────────────────────────
api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pelindo_token')
      localStorage.removeItem('pelindo_user')
      window.location.href = '/sign-in'
    }
    return Promise.reject(error.response?.data || error)
  }
)

export default api
