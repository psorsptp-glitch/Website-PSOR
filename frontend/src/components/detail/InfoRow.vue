<template>
  <div class="flex gap-3 py-2 border-b border-gray-100 last:border-0">
    <span class="text-xs text-gray-400 font-medium w-28 flex-shrink-0 pt-0.5">{{ label }}</span>
    <span class="text-xs text-gray-800 font-medium flex-1">{{ value || '—' }}</span>
  </div>
</template>
<script setup>
defineProps({ label: String, value: [String, Number] })
</script>
