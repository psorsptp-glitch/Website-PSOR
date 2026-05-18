<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden">
    <AppSidebar />
    <div class="flex-1 flex flex-col overflow-hidden min-w-0">
      <AppHeader />
      <main class="flex-1 overflow-hidden">
        <router-view v-slot="{ Component, route }">
          <transition name="fade" mode="out-in">
            <component :is="Component" :key="route.name" />
          </transition>
        </router-view>
      </main>
    </div>
    <transition name="slide-right">
      <DetailPanel v-if="jabatan.selectedNode" />
    </transition>
    <NodeFormModal v-if="modalStore.show" />
    <DeleteConfirmModal v-if="modalStore.showDelete" />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import DetailPanel from '@/components/detail/DetailPanel.vue'
import NodeFormModal from '@/components/modals/NodeFormModal.vue'
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal.vue'
import { useJabatanStore } from '@/stores/jabatan.store'
import { useModalStore } from '@/stores/modal.store'

const jabatan = useJabatanStore()
const modalStore = useModalStore()

onMounted(async () => {
  await jabatan.fetchAll()
  await jabatan.fetchDivisions()
})
</script>
