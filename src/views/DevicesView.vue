<script setup>
/**
 * Listado de dispositivos con CRUD completo.
 *
 * - Carga datos desde el store (que a su vez usa devicesService).
 * - Permite crear, editar y eliminar dispositivos.
 * - Para actuadores oculta el botón de "Lecturas" (no tienen lecturas).
 */
import { onMounted, ref } from 'vue'
/*importamos welcomecard para mostrar un mensaje de bienvenida en la vista de dispositivos, es un componente que hemos creado nosotros mismos para el dashboard pero que podemos reutilizar en cualquier parte de la aplicación */
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { useDevicesStore } from '@/stores/devices'
import SectionHeader from '@/components/ui/SectionHeader.vue'
import DeviceFormDialog from '@/components/devices/DeviceFormDialog.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'

const devicesStore = useDevicesStore()
const toast = useToast()
const confirm = useConfirm()
const router = useRouter()

// ---- Dialog de crear/editar ----
const dialogVisible = ref(false)
const dialogLoading = ref(false)
const selectedDevice = ref(null) // null = crear, objeto = editar

function openCreate() {
  selectedDevice.value = null
  dialogVisible.value = true
}

function openEdit(device) {
  selectedDevice.value = { ...device }
  dialogVisible.value = true
}

function openReadings(device) {
  const id = device._id || device.id
  router.push({ name: 'device-readings', params: { id } })
}

async function loadDevices() {
  await devicesStore.fetchAll()
  if (devicesStore.error) {
    toast.add({
      severity: 'error',
      summary: 'Error al cargar dispositivos',
      detail: devicesStore.error,
      life: 4000
    })
  } else if (devicesStore.usingFallback) {
    toast.add({
      severity: 'info',
      summary: 'Mostrando todos los dispositivos',
      detail: 'El servidor no soporta filtrado por usuario. Se muestran todos los dispositivos disponibles.',
      life: 5000
    })
  }
}

async function onSubmitDevice(payload) {
  dialogLoading.value = true
  try {
    if (selectedDevice.value) {
      const id = selectedDevice.value._id || selectedDevice.value.id
      await devicesStore.update(id, payload)
      toast.add({
        severity: 'success',
        summary: 'Dispositivo actualizado',
        life: 3000
      })
    } else {
      await devicesStore.create(payload)
      toast.add({
        severity: 'success',
        summary: 'Dispositivo creado',
        life: 3000
      })
    }
    dialogVisible.value = false
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error al guardar',
      detail: err.message,
      life: 4000
    })
  } finally {
    dialogLoading.value = false
  }
}

function confirmDelete(device) {
  confirm.require({
    message: `¿Seguro que quieres eliminar "${device.name}"? Esta acción no se puede deshacer.`,
    header: 'Eliminar dispositivo',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Eliminar',
    rejectLabel: 'Cancelar',
    acceptClass: 'p-button-danger',
    accept: () => deleteDevice(device)
  })
}

async function deleteDevice(device) {
  const id = device._id || device.id
  try {
    await devicesStore.remove(id)
    toast.add({
      severity: 'success',
      summary: 'Dispositivo eliminado',
      life: 3000
    })
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error al eliminar',
      detail: err.message,
      life: 4000
    })
  }
}

function isActuator(device) {
  const t = (device?.type || '').toLowerCase()
  return t.includes('actuador') || t.includes('actuator')
}

onMounted(loadDevices)
</script>

<template>
  <div>
    <SectionHeader
      title="Dispositivos"
      subtitle="Listado de dispositivos conectados al sistema"
      icon="pi pi-microchip"
    >
      <template #actions>
        <Button
          label="Nuevo"
          icon="pi pi-plus"
          @click="openCreate"
        />
        <Button
          label="Refrescar"
          icon="pi pi-refresh"
          severity="secondary"
          outlined
          :loading="devicesStore.loading"
          @click="loadDevices"
        />
      </template>
    </SectionHeader>

    <!-- Loading inicial -->
    <div v-if="devicesStore.loading && devicesStore.items.length === 0" class="state-box">
      <ProgressSpinner style="width: 40px; height: 40px" />
      <p>Cargando dispositivos...</p>
    </div>

    <!-- Tabla de datos -->
    <div v-else class="table-wrapper">
      <DataTable
        :value="devicesStore.items"
        :paginator="devicesStore.items.length > 10"
        :rows="10"
        striped-rows
        data-key="_id"
        responsive-layout="scroll"
      >
        <template #empty>
          <div class="empty-state">
            <i class="pi pi-inbox"></i>
            <p>No hay dispositivos registrados</p>
          </div>
        </template>

        <Column field="name" header="Nombre" />
        <Column field="type" header="Tipo" />
        <Column field="location" header="Ubicación" />
        <Column header="Acciones" style="width: 260px">
          <template #body="{ data }">
            <div class="row-actions">
              <Button
                v-if="!isActuator(data)"
                icon="pi pi-chart-line"
                severity="info"
                text
                rounded
                size="small"
                aria-label="Ver lecturas"
                v-tooltip.top="'Lecturas'"
                @click="openReadings(data)"
              />
              <Button
                icon="pi pi-pencil"
                severity="secondary"
                text
                rounded
                size="small"
                aria-label="Editar"
                v-tooltip.top="'Editar'"
                @click="openEdit(data)"
              />
              <Button
                icon="pi pi-trash"
                severity="danger"
                text
                rounded
                size="small"
                aria-label="Eliminar"
                v-tooltip.top="'Eliminar'"
                @click="confirmDelete(data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  

    <DeviceFormDialog
      v-model:visible="dialogVisible"
      :device="selectedDevice"
      :loading="dialogLoading"
      @submit="onSubmitDevice"
    />
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

.row-actions {
  display: flex;
  gap: 0.25rem;
}
</style>
