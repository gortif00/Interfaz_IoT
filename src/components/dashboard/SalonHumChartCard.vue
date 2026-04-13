<script setup>
/**
 * SalonHumChartCard — Gráfica en tiempo real de humedad.
 * Se suscribe al topic MQTT y dibuja la línea con Chart.js (PrimeVue).
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { mqttService } from '@/services/mqttService'
import Card from 'primevue/card'
import Chart from 'primevue/chart'
import Tag from 'primevue/tag'
import Skeleton from 'primevue/skeleton'

const TOPIC = 'devices/salon/temperatura'
const MAX_POINTS = 30

const labels = ref([])
const hums = ref([])
const lastHum = ref(null)

const hasData = computed(() => hums.value.length > 0)

const chartData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      label: 'Humedad (%)',
      data: hums.value,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.08)',
      tension: 0.4,
      pointRadius: 3,
      pointBackgroundColor: '#3b82f6',
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
        label: (ctx) => `${ctx.parsed.y.toFixed(1)} %`
      }
    }
  },
  scales: {
    x: {
      ticks: { maxRotation: 0, maxTicksLimit: 6, color: '#94a3b8', font: { size: 11 } },
      grid: { display: false }
    },
    y: {
      title: { display: true, text: '%', color: '#94a3b8' },
      min: 0, max: 100,
      ticks: { color: '#94a3b8', font: { size: 11 } },
      grid: { color: 'rgba(0,0,0,0.04)' }
    }
  }
}

function handleMessage(topic, payload) {
  if (topic !== TOPIC) return
  try {
    const data = JSON.parse(payload)
    const now = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

    labels.value = [...labels.value, now].slice(-MAX_POINTS)
    hums.value   = [...hums.value, data.humidity].slice(-MAX_POINTS)
    lastHum.value = data.humidity
  } catch (err) {
    console.warn('[SalonHumChart] Error:', err.message)
  }
}

let removeListener
onMounted(() => {
  mqttService.subscribe(TOPIC)
  removeListener = mqttService.onMessage(handleMessage)
})
onUnmounted(() => {
  mqttService.unsubscribe(TOPIC)
  removeListener?.()
})
</script>

<template>
  <Card class="chart-card">
    <template #title>
      <div class="chart-header">
        <div class="chart-title">
          <i class="pi pi-cloud"></i>
          <span>Humedad</span>
        </div>
        <Tag v-if="lastHum != null" :value="lastHum.toFixed(1) + ' %'" severity="info" rounded />
        <Tag v-else value="Sin datos" severity="secondary" rounded />
      </div>
    </template>

    <template #subtitle>
      <div class="chart-subtitle">
        <i class="pi pi-wifi"></i>
        <code>{{ TOPIC }}</code>
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
  color: #3b82f6;
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
