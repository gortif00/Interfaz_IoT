<script setup>
/**
 * Barra superior: botón de menú, título de la sección actual y logout.
 * El título se obtiene del meta de la ruta activa.
 */
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Button from 'primevue/button'

const emit = defineEmits(['toggle-sidebar'])

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const currentTitle = computed(() => route.meta.title || 'IoT Dashboard')

// ---- Indicador MQTT ----
const mqttStatusMap = {
  connected:    { label: 'MQTT',  icon: 'pi pi-circle-fill', css: 'mqtt-on',    title: 'Conectado al broker MQTT' },
  disconnected: { label: 'MQTT',  icon: 'pi pi-circle',      css: 'mqtt-off',   title: 'Desconectado del broker MQTT' },
  reconnecting: { label: 'MQTT',  icon: 'pi pi-spin pi-spinner', css: 'mqtt-wait', title: 'Reconectando al broker MQTT...' },
  error:        { label: 'MQTT',  icon: 'pi pi-exclamation-circle', css: 'mqtt-err', title: auth.mqttError || 'Error de conexión MQTT' }
}

const mqttInfo  = computed(() => mqttStatusMap[auth.mqttStatus] || mqttStatusMap.disconnected)
const mqttLabel = computed(() => mqttInfo.value.label)
const mqttIcon  = computed(() => mqttInfo.value.icon)
const mqttClass = computed(() => mqttInfo.value.css)
const mqttTitle = computed(() => {
  if (auth.mqttStatus === 'error' && auth.mqttError) return `Error MQTT: ${auth.mqttError}`
  return mqttInfo.value.title
})

function handleLogout() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <header class="topbar">
    <div class="topbar-left">
      <Button
        icon="pi pi-bars"
        text
        rounded
        aria-label="Menú"
        @click="emit('toggle-sidebar')"
      />
      <h1 class="topbar-title">{{ currentTitle }}</h1>
    </div>

    <div class="topbar-right">
      <!-- Indicador de conexión MQTT -->
      <span class="mqtt-status" :class="mqttClass" :title="mqttTitle">
        <i :class="mqttIcon"></i>
        {{ mqttLabel }}
      </span>

      <span v-if="auth.user" class="topbar-user">
        <i class="pi pi-user"></i>
        {{ auth.user.name || auth.user.email }}
      </span>
      <Button
        label="Cerrar sesión"
        icon="pi pi-sign-out"
        severity="secondary"
        outlined
        @click="handleLogout"
      />
    </div>
  </header>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 0.75rem 1.5rem;
  height: 64px;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.topbar-title {
  font-size: 1.15rem;
  font-weight: 600;
  margin: 0;
  color: #1e293b;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.topbar-user {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #475569;
  font-size: 0.9rem;
}

.mqtt-status {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 0.25rem 0.65rem;
  border-radius: 20px;
  cursor: default;
}

.mqtt-on {
  background: #dcfce7;
  color: #16a34a;
}

.mqtt-off {
  background: #f1f5f9;
  color: #94a3b8;
}

.mqtt-wait {
  background: #fef9c3;
  color: #ca8a04;
}

.mqtt-err {
  background: #fef2f2;
  color: #dc2626;
}

.mqtt-status i {
  font-size: 0.65rem;
}

@media (max-width: 640px) {
  .topbar-user {
    display: none;
  }
}
</style>
