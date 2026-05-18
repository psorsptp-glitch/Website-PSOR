import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const routes = [
  { path: '/', redirect: '/sign-in' },
  { path: '/sign-in', name: 'SignIn', component: () => import('@/views/SignInView.vue'), meta: { guest: true } },
  { path: '/sign-up', name: 'SignUp', component: () => import('@/views/SignUpView.vue'), meta: { guest: true } },
  {
    path: '/dashboard',
    component: () => import('@/views/DashboardLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/dashboard/struktur-org' },
      { path: 'overview',     name: 'Overview',     component: () => import('@/views/OverviewView.vue') },
      { path: 'struktur-org', name: 'StrukturOrg',  component: () => import('@/views/StrukturOrgView.vue') },
      { path: 'nomenklatur',  name: 'Nomenklatur',  component: () => import('@/views/NomenklaturView.vue') },
      { path: 'reports',      name: 'Reports',      component: () => import('@/views/ReportsView.vue') },
      { path: 'settings',     name: 'Settings',     component: () => import('@/views/SettingsView.vue') },
      { path: 'daftarjabatan', name: 'DaftarJabatan', component: () => import('@/views/DaftarJabatan.vue') },
      { path: 'SWP', name: 'StrategicWorkforcePlanning', component: () => import('@/views/SWPDashboard.vue') },
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) return next('/sign-in')
  if (to.meta.guest && auth.isLoggedIn) return next('/dashboard/struktur-org')
  next()
})

export default router
