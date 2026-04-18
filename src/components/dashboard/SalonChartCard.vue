<script setup>
/**
 * SalonChartCard — Gráfica en tiempo real de temperatura.
 * Se suscribe al topic MQTT y dibuja la línea con Chart.js (PrimeVue).
 */
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { mqttService } from '@/services/mqttService'
import Card from 'primevue/card'
import Chart from 'primevue/chart'
import Tag from 'primevue/tag'
import Skeleton from 'primevue/skeleton'

const props = defineProps({
  selectedDeviceId: { type: String, default: '' }
})

const LEGACY_TOPIC = import.meta.env.VITE_MQTT_TEMP_TOPIC || 'devices/salon/temperatura'
const MAX_POINTS = 30

const labels = ref([])
const temps = ref([])
const lastTemp = ref(null)
const hasSelectedTopicData = ref(false)

const selectedReadingTopic = computed(() =>
  props.selectedDeviceId ? `devices/${props.selectedDeviceId}/reading` : ''
)
const topicLabel = computed(() =>
  selectedReadingTopic.value && hasSelectedTopicData.value
    ? selectedReadingTopic.value
    : LEGACY_TOPIC
)
const storageKey = computed(() => `dashboard.temp.history.${props.selectedDeviceId || 'legacy'}`)

const hasData = computed(() => temps.value.length > 0)

const chartData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      label: 'Temperatura (ºC)',
      data: temps.value,
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239,68,68,0.08)',
      tension: 0.4,
      pointRadius: 3,
      pointBackgroundColor: '#ef4444',
      pointHoverRadius: 6,
      borderWidth: 2,
      fill: true
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 600, easing: 'easeInOutQuart' },
  transitions: {
    active: { animation: { duration: 200 } }
  },
  interaction: { intersect: false, mode: 'index' },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1e293b',
      titleColor: '#f8fafc',
      bodyColor: '#e2e8f0',
      padding: 10,
      cornerRadius: 8,
      displayColors: false,
      callbacks: {
        label: (ctx) => `${ctx.parsed.y.toFixed(1)} ºC`
      }
    }
  },
  scales: {
    x: {
      ticks: { maxRotation: 0, maxTicksLimit: 6, color: '#94a3b8', font: { size: 11 } },
      grid: { display: false }
    },
    y: {
      title: { display: true, text: 'ºC', color: '#94a3b8' },
      beginAtZero: false,
      ticks: { color: '#94a3b8', font: { size: 11 } },
      grid: { color: 'rgba(0,0,0,0.04)' }
    }
  }
}

function handleMessage(topic, payload) {
  if (topic === selectedReadingTopic.value) {
    const temperature = extractTemperature(payload, { readingTopic: true })
    if (temperature == null) return

    hasSelectedTopicData.value = true
    appendPoint(temperature)
    return
  }

  if (topic === LEGACY_TOPIC) {
    if (selectedReadingTopic.value && hasSelectedTopicData.value) return

    const temperature = extractTemperature(payload)
    if (temperature == null) {
      console.warn('[SalonChart] Payload invalido:', payload)
      return
    }

    appendPoint(temperature)
  }
}

function appendPoint(temperature) {
  const now = new Date().toLocaleTimeString('es-ES', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })

  labels.value = [...labels.value, now].slice(-MAX_POINTS)
  temps.value = [...temps.value, temperature].slice(-MAX_POINTS)
  lastTemp.value = temperature
  saveHistory()
}

function extractTemperature(payload, { readingTopic = false } = {}) {
  const raw = String(payload ?? '').trim()
  if (!raw) return null

  const parsed = parsePayload(raw)
  if (parsed == null) return null

  if (readingTopic) {
    const value = Number(parsed?.temperature ?? parsed?.temp)
    return Number.isFinite(value) ? value : null
  }

  const value = Number(parsed?.temperature ?? parsed?.temp ?? parsed?.value ?? parsed)
  return Number.isFinite(value) ? value : null
}

function parsePayload(raw) {
  try {
    const data = JSON.parse(raw)
    if (typeof data === 'number' && Number.isFinite(data)) {
      return data
    }

    if (data && typeof data === 'object') {
      return data
    }
  } catch {
    // Soporta payload plano tipo "23.45"
  }

  const plainValue = Number(raw.replace(',', '.'))
  return Number.isFinite(plainValue) ? plainValue : null
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(storageKey.value)
    if (!raw) return
    const parsed = JSON.parse(raw)
    const cachedLabels = Array.isArray(parsed?.labels) ? parsed.labels : []
    const cachedTemps = Array.isArray(parsed?.temps)
      ? parsed.temps.map((value) => Number(value)).filter((value) => Number.isFinite(value))
      : []

    const size = Math.min(cachedLabels.length, cachedTemps.length, MAX_POINTS)
    if (size === 0) return

    labels.value = cachedLabels.slice(-size)
    temps.value = cachedTemps.slice(-size)
    lastTemp.value = temps.value.at(-1) ?? null
  } catch {
    // Ignora cache corrupta
  }
}

function saveHistory() {
  try {
    localStorage.setItem(
      storageKey.value,
      JSON.stringify({
        labels: labels.value,
        temps: temps.value
      })
    )
  } catch {
    // Ignora errores de cuota o acceso
  }
}

function clearSeries() {
  labels.value = []
  temps.value = []
  lastTemp.value = null
}

let removeListener
onMounted(() => {
  loadHistory()
  mqttService.subscribe(LEGACY_TOPIC)
  if (selectedReadingTopic.value) {
    mqttService.subscribe(selectedReadingTopic.value)
  }
  removeListener = mqttService.onMessage(handleMessage)
})

watch(
  () => props.selectedDeviceId,
  (newDeviceId, oldDeviceId) => {
    hasSelectedTopicData.value = false

    if (oldDeviceId) {
      mqttService.unsubscribe(`devices/${oldDeviceId}/reading`)
    }

    clearSeries()
    loadHistory()

    if (newDeviceId) {
      mqttService.subscribe(`devices/${newDeviceId}/reading`)
    }
  }
)

onUnmounted(() => {
  mqttService.unsubscribe(LEGACY_TOPIC)
  if (selectedReadingTopic.value) {
    mqttService.unsubscribe(selectedReadingTopic.value)
  }
  removeListener?.()
})
</script>

<template>
  <Card class="chart-card">
    <template #title>
      <div class="chart-header">
        <div class="chart-title">
          <i class="pi pi-sun"></i>
          <span>Temperatura</span>
        </div>
        <Tag v-if="lastTemp != null" :value="lastTemp.toFixed(1) + ' ºC'" severity="danger" rounded />
        <Tag v-else value="Sin datos" severity="secondary" rounded />
      </div>
    </template>

    <template #subtitle>
      <div class="chart-subtitle">
        <i class="pi pi-wifi"></i>
        <code>{{ topicLabel }}</code>
      </div>
    </template>

    <template #content>
      <div class="chart-container">
        <Skeleton v-if="!hasData" height="250px" border-radius="12px" />
        <Chart v-else type="line" :data="chartData" :options="chartOptions" />
      </div>
    </template>
  </Card>
</template>

<style scoped>
.chart-card {
  border-radius: 12px;
  overflow: hidden;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chart-title i {
  color: #ef4444;
  font-size: 1.2rem;
}

.chart-subtitle {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #94a3b8;
  font-size: 0.85rem;
}

.chart-subtitle i { font-size: 0.75rem; }

.chart-container { position: relative; height: 250px; }

code {
  background: #f1f5f9;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 0.82em;
}
</style>
