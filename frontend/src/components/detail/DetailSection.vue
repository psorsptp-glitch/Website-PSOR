<template>
  <div class="bg-gray-50 rounded-xl p-3">
    <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{{ title }}</div>
    <template v-if="items?.length">
      <div v-for="(item,i) in items" :key="i" class="flex items-start gap-2 text-xs text-gray-700 mb-1.5 last:mb-0">
        <span class="w-1.5 h-1.5 rounded-full bg-pelindo-blue/50 flex-shrink-0 mt-1.5"></span>
        {{ item }}
      </div>
    </template>
    <p v-else-if="content" class="text-xs text-gray-700 leading-relaxed">{{ content }}</p>
    <p v-else class="text-xs text-gray-400 italic">Belum diisi</p>
  </div>
</template>
<script setup>
defineProps({ title: String, content: String, items: Array })
</script>
