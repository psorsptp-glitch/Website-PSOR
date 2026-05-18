<template>
  <aside class="w-56 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-full">
    <!-- Logo -->
      <div class="mb-1 p-4">
        <img
        src="/src/assets/img/logo.svg"
        alt="Pelindo"
        class="w-full h-full object-cover rounded-xl"
        @error="$event.target.style.display='none'; $event.target.nextElementSibling.style.display='flex'"
      />
      </div>

    <!-- Nav -->
    <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
      <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Menu</p>

      <router-link 
        to="/dashboard/overview" 
        class="nav-item flex items-center gap-2 md:gap-3" 
        active-class="active"
      >
        <img 
          src="/src/assets/img/overview.svg" 
          class="w-4 h-4 md:w-5 md:h-5 object-contain" 
        />
        <span class="text-sm md:text-base">Overview</span>
      </router-link>

      <router-link 
      to="/dashboard/struktur-org"
      class="nav-item flex items-center gap-2 md:gap-3" 
      active-class="active"
      >
        <img 
          src="/src/assets/img/org.svg" 
          class="w-4 h-4 md:w-5 md:h-5 object-contain" 
        />
        <span class="text-sm md:text-base">Struktur Org</span>
      </router-link>

      <!-- <router-link to="/dashboard/reports" 
      class="nav-item flex items-center gap-2 md:gap-3" 
      active-class="active"
      >
        <OverviewIcon class="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
        <img 
          src="/src/assets/img/reports.svg" 
          class="w-4 h-4 md:w-5 md:h-5 object-contain" 
        />
        <span class="text-sm md:text-base">Reports</span>
      </router-link> -->

      <!-- Daftar Jabatan collapsible -->
      <!-- <div>
        <div>
          <button 
            @click="jabatanOpen = !jabatanOpen"
            class="nav-item w-full justify-between flex items-center"
          >
            <div class="flex items-center gap-3">
              <JabatanIcon class="w-4 h-4 flex-shrink-0" />

              <img 
                src="/src/assets/img/jabatan.svg" 
                class="w-4 h-4 object-contain flex-shrink-0"
              />

              <span>Daftar Jabatan</span>
            </div>

            <svg 
              :class="['w-3.5 h-3.5 transition-transform', jabatanOpen ? 'rotate-180' : '']"
              fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
        </div>

        <transition name="fade">
          <div v-if="jabatanOpen" class="ml-4 pl-3 border-l border-gray-200 mt-0.5 space-y-0.5">
            <button v-for="cat in jabatanCategories" :key="cat"
              @click="filterCategory(cat)"
              :class="['w-full text-left px-3 py-2 text-sm rounded-lg transition-colors',
                activeCategory === cat ? 'text-pelindo-blue font-medium bg-blue-50' : 'text-gray-600 hover:bg-gray-50']">
              {{ cat }}
            </button>
          </div>
        </transition>
      </div> -->

      <router-link 
      to="/dashboard/daftarjabatan"
      class="nav-item flex items-center gap-2 md:gap-3" 
      active-class="active"
      >
        <img 
          src="/src/assets/img/jabatan.svg" 
          class="w-4 h-4 md:w-5 md:h-5 object-contain" 
        />
        <span class="text-sm md:text-base">Daftar Jabatan</span>
      </router-link>

      <!-- Strategic Workforce Planning (SWP) -->
      <router-link 
      to="/dashboard/SWP" 
      class="nav-item flex items-center gap-2 md:gap-3" 
      active-class="active"
      >
        <img 
          src="/src/assets/img/swp2.png" 
          class="w-4 h-4 md:w-5 md:h-5 object-contain" 
        />
        <span class="text-sm md:text-base">SWP</span>
      </router-link>

      <!-- Notifications -->
      <router-link 
      to="/dashboard/notification" 
      class="nav-item flex items-center gap-2 md:gap-3" 
      active-class="active"
      >
        <img 
          src="/src/assets/img/notification.svg" 
          class="w-4 h-4 md:w-5 md:h-5 object-contain" 
        />
        <span class="text-sm md:text-base">Notifications</span>
      </router-link>

      <!-- Settings -->
      <router-link 
      to="/dashboard/settings" 
      class="nav-item flex items-center gap-2 md:gap-3" 
      active-class="active"
      >
        <img 
          src="/src/assets/img/setting.svg" 
          class="w-4 h-4 md:w-5 md:h-5 object-contain" 
        />
        <span class="text-sm md:text-base">Settings</span>
      </router-link>
    </nav>

    <!-- Profile Info -->
    <div class="border-t border-gray-100 p-4 space-y-3">
      <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Profile</p>
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-pelindo-blue flex items-center justify-center flex-shrink-0">
          <span class="text-white text-xs font-bold">{{ userInitials }}</span>
        </div>
        <div class="min-w-0">
          <div class="text-sm font-semibold text-gray-800 truncate">{{ auth.user?.name }}</div>
          <div class="text-[10px] text-gray-400 truncate">{{ auth.user?.email }}</div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useJabatanStore } from '@/stores/jabatan.store'

const auth = useAuthStore()
const jabatan = useJabatanStore()

const jabatanOpen = ref(true)
const activeCategory = ref(null)

const userInitials = computed(() => {
  const name = auth.user?.name || ''
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'U'
})

const jabatanCategories = ['Struktural', 'Fungsional', 'Staff Khusus', 'General']

function filterCategory(cat) {
  activeCategory.value = activeCategory.value === cat ? null : cat
}

</script>
