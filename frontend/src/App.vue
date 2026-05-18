<template>
  <router-view v-slot="{ Component, route }">
    <transition name="fade" mode="out-in">
      <component :is="Component" :key="route.name" />
    </transition>
  </router-view>

  <!-- Toast notifications -->
  <div class="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 pointer-events-none">
    <transition-group name="slide-right">
      <div v-for="t in toastStore.toasts" :key="t.id"
        :class="[
          'flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-sm font-semibold min-w-[240px] max-w-[360px] pointer-events-auto',
          t.type === 'success' ? 'bg-emerald-600 text-white' :
          t.type === 'error'   ? 'bg-red-500 text-white' :
          t.type === 'warn'    ? 'bg-amber-500 text-white' :
                                 'bg-gray-800 text-white'
        ]">
        <span class="text-base flex-shrink-0">
          {{ t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : t.type === 'warn' ? '⚠' : 'ℹ' }}
        </span>
        <span class="flex-1">{{ t.message }}</span>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useToastStore } from '@/stores/toast.store'
const toastStore = useToastStore()
</script>
