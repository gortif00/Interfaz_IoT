/**
 * Configuración del router.
 *
 * Las rutas protegidas llevan meta.requiresAuth = true.
 * El guard global comprueba el token del auth store antes de entrar.
 */
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import MainLayout from '@/layouts/MainLayout.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import DashboardView from '@/views/DashboardView.vue'
import DevicesView from '@/views/DevicesView.vue'
import ReadingsView from '@/views/ReadingsView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { public: true }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { public: true }
  },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/dashboard' },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: DashboardView,
        meta: { title: 'Dashboard', icon: 'pi pi-home' }
      },
      {
        path: 'userdevices',
        name: 'devices',
        component: DevicesView,
        meta: { title: 'Dispositivos', icon: 'pi pi-microchip' }
      },
      {
        path: 'userdevices/:id/readings',
        name: 'device-readings',
        component: ReadingsView,
        meta: { title: 'Lecturas del dispositivo', icon: 'pi pi-chart-line' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
    meta: { public: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ---- Navigation guard global ----
router.beforeEach((to) => {
  const auth = useAuthStore()

  // Si la ruta requiere auth y no hay token -> login
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login' }
  }

  // Si ya hay sesión e intentamos entrar a login o register -> dashboard
  if ((to.name === 'login' || to.name === 'register') && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }
})

export default router
