<script setup>
/**
 * Lecturas de un dispositivo concreto.
 * Recibe el id del dispositivo desde la ruta: /devices/:id/readings
 */
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { readingsService } from '@/services/readingsService'
import { devicesService } from '@/services/devicesService'
import SectionHeader from '@/components/ui/SectionHeader.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const deviceId = route.params.id
const device = ref(null)
const readings = ref([])
const loading = ref(false)

async function loadData() {
  loading.value = true
  try {
    // Cargamos en paralelo info del dispositivo y sus lecturas
    const [deviceData, readingsData] = await Promise.all([
      devicesService.get(deviceId).catch(() => null),
      readingsService.byDevice(deviceId)
    ])
    device.value = deviceData
    readings.value = readingsData
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error al cargar lecturas',
      detail: err.message,
      life: 4000
    })
    readings.value = []
  } finally {
    loading.value = false
  }
}

function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  return isNaN(d) ? value : d.toLocaleString()
}

onMounted(loadData)
</script>

<template>
  <div>
    <SectionHeader
      :title="device ? `Lecturas de ${device.name}` : `Lecturas del dispositivo #${deviceId}`"
      :subtitle="device?.location ? `Ubicación: ${device.location}` : 'Histórico de lecturas registradas'"
      icon="pi pi-chart-line"
    >
      <template #actions>
        <Button
          label="Volver"
          icon="pi pi-arrow-left"
          severity="secondary"
          outlined
          @click="router.push('/userdevices')"
        />
        <Button
          label="Refrescar"
          icon="pi pi-refresh"
          :loading="loading"
          @click="loadData"
        />
      </template>
    </SectionHeader>

    <div v-if="loading && readings.length === 0" class="state-box">
      <ProgressSpinner style="width: 40px; height: 40px" />
      <p>Cargando lecturas...</p>
    </div>

    <div v-else class="table-wrapper">
      <DataTable
        :value="readings"
        :paginator="readings.length > 10"
        :rows="10"
        striped-rows
        data-key="_id"
        responsive-layout="scroll"
      >
        <template #empty>
          <div class="empty-state">
            <i class="pi pi-inbox"></i>
            <p>No hay lecturas para este dispositivo</p>
          </div>
        </template>

        <Column header="Temperatura">
          <template #body="{ data }">
            <span v-if="data.temperature != null">
              {{ data.temperature }} ºC
            </span>
            <span v-else class="muted">—</span>
          </template>
        </Column>
        <Column header="Humedad">
          <template #body="{ data }">
            <span v-if="data.humidity != null">
              {{ data.humidity }} %
            </span>
            <span v-else class="muted">—</span>
          </template>
        </Column>
        <Column header="Fecha">
          <template #body="{ data }">
            {{ formatDate(data.timestamp || data.createdAt || data.date) }}
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<style scoped>
.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem 1rem;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  color: #64748b;
}

.table-wrapper {
  background: #fff;
  border-radius: 12px;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.empty-state {
  text-align: center;
  color: #94a3b8;
  padding: 2rem 1rem;
}

.empty-state i {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.5rem;
  color: #cbd5e1;
}

.muted {
  color: #94a3b8;
}
</style>
