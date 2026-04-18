<script setup>
/**
 * Dashboard principal.
 * Muestra cards de resumen y accesos rápidos.
 */
import { onMounted, onUnmounted, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDevicesStore } from '@/stores/devices'
import { mqttService } from '@/services/mqttService'
import SectionHeader from '@/components/ui/SectionHeader.vue'
import StatCard from '@/components/ui/StatCard.vue'
import WelcomeCard from '@/components/dashboard/WelcomeCard.vue'
import BindingDemoCard from '@/components/dashboard/BindingDemoCard.vue'
import ParentValueCard from '@/components/dashboard/ParentValueCard.vue'
import SalonChartCard from '@/components/dashboard/SalonChartCard.vue'
import SalonHumChartCard from '@/components/dashboard/SalonHumChartCard.vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Select from 'primevue/select'

// Estado local que enlazamos al BindingDemoCard mediante v-model.
// Cambiar esto desde fuera también mueve el slider y el input del hijo.
const demoValue = ref(25)

const router = useRouter()
const devicesStore = useDevicesStore()

const READING_TOPIC = 'devices/+/reading'
const LEGACY_TEMP_TOPIC = import.meta.env.VITE_MQTT_TEMP_TOPIC || 'devices/salon/temperatura'
const LEGACY_HUM_TOPIC = import.meta.env.VITE_MQTT_HUM_TOPIC || 'devices/salon/humedad'
const ONLINE_WINDOW_MS = 60000
const READINGS_COUNTER_DATE_KEY = 'dashboard.readings.today.date'
const READINGS_COUNTER_VALUE_KEY = 'dashboard.readings.today.value'

const readingsToday = ref(0)
const seenDevices = ref({})
const selectedDeviceId = ref('')

const deviceOptions = computed(() =>
  (Array.isArray(devicesStore.items) ? devicesStore.items : [])
    .map((device) => ({
      label: `${device.name} (${device.deviceId})`,
      value: device.deviceId
    }))
)

const mergedTotal = computed(() => Math.max(devicesStore.total, Object.keys(seenDevices.value).length))
const mergedOnline = computed(() => {
  const now = Date.now()
  const mqttOnline = Object.values(seenDevices.value)
    .filter((timestamp) => now - timestamp <= ONLINE_WINDOW_MS)
    .length
  return Math.max(devicesStore.online, mqttOnline)
})
const mergedOffline = computed(() => {
  const fallbackOffline = Math.max(mergedTotal.value - mergedOnline.value, 0)
  return Math.max(devicesStore.offline, fallbackOffline)
})
const readingsHint = computed(() =>
  readingsToday.value > 0
    ? 'Mensajes MQTT recibidos hoy'
    : 'Pendiente de recibir lecturas'
)

let removeMqttListener
let presenceTimer
let devicesRefreshTimer

watch(
  deviceOptions,
  (options) => {
    if (options.length === 0) {
      selectedDeviceId.value = ''
      return
    }

    const isCurrentValid = options.some((option) => option.value === selectedDeviceId.value)
    if (!isCurrentValid) {
      selectedDeviceId.value = options[0].value
    }
  },
  { immediate: true }
)

onMounted(() => {
  loadReadingsCounter()

  devicesStore.fetchAll()

  mqttService.subscribe(READING_TOPIC)
  mqttService.subscribe(LEGACY_TEMP_TOPIC)
  mqttService.subscribe(LEGACY_HUM_TOPIC)
  removeMqttListener = mqttService.onMessage(handleMqttMessage)

  presenceTimer = window.setInterval(() => {
    // Fuerza reevaluacion reactiva de online/offline sin nuevos mensajes.
    seenDevices.value = { ...seenDevices.value }
  }, 5000)

  devicesRefreshTimer = window.setInterval(() => {
    devicesStore.fetchAll()
  }, 30000)
})

onUnmounted(() => {
  mqttService.unsubscribe(READING_TOPIC)
  mqttService.unsubscribe(LEGACY_TEMP_TOPIC)
  mqttService.unsubscribe(LEGACY_HUM_TOPIC)
  removeMqttListener?.()
  if (presenceTimer) {
    window.clearInterval(presenceTimer)
  }
  if (devicesRefreshTimer) {
    window.clearInterval(devicesRefreshTimer)
  }
})

function handleMqttMessage(topic, payload) {
  const reading = extractReading(topic, payload)
  if (!reading) return

  const deviceId = reading.deviceId || getDeviceIdFromTopic(topic)
  if (!deviceId) return

  seenDevices.value = {
    ...seenDevices.value,
    [deviceId]: Date.now()
  }

  readingsToday.value += 1
  saveReadingsCounter()
}

function getDeviceIdFromTopic(topic) {
  const parts = String(topic).split('/')
  if (parts.length >= 3 && parts[0] === 'devices' && parts[2] === 'reading') {
    return parts[1]
  }
  if (topic === LEGACY_TEMP_TOPIC || topic === LEGACY_HUM_TOPIC) {
    return 'GONZALO'
  }
  return topic
}

function extractReading(topic, payload) {
  const raw = String(payload ?? '').trim()
  if (!raw) return null

  const parsed = parsePayload(raw)
  if (parsed == null) return null

  const isReadingTopic = String(topic).endsWith('/reading')

  if (isReadingTopic) {
    const temperature = Number(parsed?.temperature ?? parsed?.temp)
    const humidity = Number(parsed?.humidity ?? parsed?.hum)
    const hasTemp = Number.isFinite(temperature)
    const hasHum = Number.isFinite(humidity)
    if (!hasTemp && !hasHum) return null

    return {
      deviceId: parsed?.deviceId || parsed?.device_id || null,
      temperature: hasTemp ? temperature : null,
      humidity: hasHum ? humidity : null
    }
  }

  if (topic === LEGACY_TEMP_TOPIC) {
    const value = Number(parsed?.temperature ?? parsed?.temp ?? parsed?.value ?? parsed)
    return Number.isFinite(value) ? { temperature: value } : null
  }

  if (topic === LEGACY_HUM_TOPIC) {
    const value = Number(parsed?.humidity ?? parsed?.hum ?? parsed?.value ?? parsed)
    return Number.isFinite(value) ? { humidity: value } : null
  }

  return null
}

function parsePayload(raw) {
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    if (typeof parsed === 'number' && Number.isFinite(parsed)) {
      return parsed
    }
    if (parsed && typeof parsed === 'object') {
      return parsed
    }
  } catch {
    // Soporta payload plano numerico
  }

  const plainValue = Number(raw.replace(',', '.'))
  return Number.isFinite(plainValue) ? plainValue : null
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function loadReadingsCounter() {
  const savedDate = localStorage.getItem(READINGS_COUNTER_DATE_KEY)
  const savedValue = Number(localStorage.getItem(READINGS_COUNTER_VALUE_KEY) || 0)

  if (savedDate === todayKey() && Number.isFinite(savedValue)) {
    readingsToday.value = savedValue
    return
  }

  readingsToday.value = 0
  saveReadingsCounter()
}

function saveReadingsCounter() {
  localStorage.setItem(READINGS_COUNTER_DATE_KEY, todayKey())
  localStorage.setItem(READINGS_COUNTER_VALUE_KEY, String(readingsToday.value))
}
</script>

<template>
  <div>
    <SectionHeader
      title="Panel de control"
      subtitle="Resumen general del sistema IoT"
      icon="pi pi-home"
    />

    <!-- Cards de resumen -->
    <div class="stats-grid">
      <StatCard
        title="Dispositivos"
        :value="mergedTotal"
        icon="pi pi-microchip"
        color="blue"
        hint="Total registrados"
      />
      <StatCard
        title="Online"
        :value="mergedOnline"
        icon="pi pi-check-circle"
        color="green"
        hint="Conectados ahora"
      />
      <StatCard
        title="Offline"
        :value="mergedOffline"
        icon="pi pi-times-circle"
        color="red"
        hint="Sin conexión"
      />
      <StatCard
        title="Lecturas hoy"
        :value="readingsToday"
        icon="pi pi-chart-line"
        color="orange"
        :hint="readingsHint"
      />
    </div>

    <!-- Accesos rápidos -->
    <div class="quick-grid">
      <Card>
        <template #title>Accesos rápidos</template>
        <template #content>
          <div class="quick-actions">
            <Button
              label="Ver dispositivos"
              icon="pi pi-microchip"
              severity="secondary"
              outlined
              @click="router.push('/userdevices')"
            />
            <Button
              label="Refrescar datos"
              icon="pi pi-refresh"
              severity="secondary"
              outlined
              :loading="devicesStore.loading"
              @click="devicesStore.fetchAll()"
            />
          </div>
        </template>
      </Card>

      <WelcomeCard
        title="Bienvenida"
        subtitle="Proyecto base de IoT"
      />
    </div>

    <!-- Gráficas MQTT en tiempo real -->
    <div class="charts-grid">
      <Card class="charts-filter-card">
        <template #content>
          <div class="charts-filter">
            <label for="device-selector">Dispositivo</label>
            <Select
              id="device-selector"
              v-model="selectedDeviceId"
              :options="deviceOptions"
              option-label="label"
              option-value="value"
              placeholder="Selecciona un dispositivo"
              :disabled="deviceOptions.length === 0"
              class="device-select"
            />
          </div>
        </template>
      </Card>
      <div></div>
      <SalonChartCard :selected-device-id="selectedDeviceId" />
      <SalonHumChartCard :selected-device-id="selectedDeviceId" />
    </div>

    <!-- Demo de two-way data binding
    <div class="demo-grid">
      <BindingDemoCard v-model="demoValue" />

      <ParentValueCard
        :value="demoValue"
        :reset-value="50"
        @reset="demoValue = 50"
      />
    </div> -->
  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.quick-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;  /* 1fr 2fr */
  gap: 1rem;
}

.quick-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 2rem;
}

.charts-filter-card {
  border-radius: 12px;
}

.charts-filter {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.charts-filter label {
  font-size: 0.9rem;
  color: #334155;
  font-weight: 600;
}

.device-select {
  width: min(420px, 100%);
}

@media (max-width: 768px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

.demo-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .demo-grid {
    grid-template-columns: 1fr;
  }
}

</style>
