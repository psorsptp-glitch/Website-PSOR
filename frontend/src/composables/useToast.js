import { ref } from 'vue'

const toasts = ref([])
let toastId = 0

export function useToast() {
  function toast(message, type = 'success', duration = 3000) {
    const id = ++toastId
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, duration)
  }

  function success(msg) { toast(msg, 'success') }
  function error(msg) { toast(msg, 'error') }
  function info(msg) { toast(msg, 'info') }

  return { toasts, toast, success, error, info }
}
