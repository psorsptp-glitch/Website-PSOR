import { defineStore } from 'pinia'
import { ref } from 'vue'

let nextId = 0
export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])

  function add(message, type = 'success', duration = 3500) {
    const id = ++nextId
    toasts.value.push({ id, message, type })
    setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id) }, duration)
  }

  const success = (msg) => add(msg, 'success')
  const error   = (msg) => add(msg, 'error', 5000)
  const info    = (msg) => add(msg, 'info')
  const warn    = (msg) => add(msg, 'warn', 4000)

  return { toasts, success, error, info, warn }
})
