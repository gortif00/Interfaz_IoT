import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// ---- PrimeVue ----
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import Tooltip from 'primevue/tooltip'

// Iconos y estilos base de PrimeVue
import 'primeicons/primeicons.css'

// Estilos globales propios
import './assets/main.css'

// ---- Store de autenticación (cargar token al arrancar) ----
import { useAuthStore } from './stores/auth'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.app-dark',
      cssLayer: false
    }
  },
  ripple: true
})
app.use(ToastService)
app.use(ConfirmationService)
app.directive('tooltip', Tooltip)

// Recupera el token de localStorage antes de montar
const auth = useAuthStore()
auth.loadTokenFromStorage()

app.mount('#app')
