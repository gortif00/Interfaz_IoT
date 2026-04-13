<script setup>
/**
 * Dashboard principal.
 * Muestra cards de resumen y accesos rápidos.
 */
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDevicesStore } from '@/stores/devices'
import SectionHeader from '@/components/ui/SectionHeader.vue'
import StatCard from '@/components/ui/StatCard.vue'
import WelcomeCard from '@/components/dashboard/WelcomeCard.vue'
import BindingDemoCard from '@/components/dashboard/BindingDemoCard.vue'
import ParentValueCard from '@/components/dashboard/ParentValueCard.vue'
import SalonChartCard from '@/components/dashboard/SalonChartCard.vue'
import SalonHumChartCard from '@/components/dashboard/SalonHumChartCard.vue'
import Card from 'primevue/card'
import Button from 'primevue/button'

// Estado local que enlazamos al BindingDemoCard mediante v-model.
// Cambiar esto desde fuera también mueve el slider y el input del hijo.
const demoValue = ref(25)

const router = useRouter()
const devicesStore = useDevicesStore()

onMounted(() => {
  if (devicesStore.items.length === 0) {
    devicesStore.fetchAll()
  }
})
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
        :value="devicesStore.total"
        icon="pi pi-microchip"
        color="blue"
        hint="Total registrados"
      />
      <StatCard
        title="Online"
        :value="devicesStore.online"
        icon="pi pi-check-circle"
        color="green"
        hint="Conectados ahora"
      />
      <StatCard
        title="Offline"
        :value="devicesStore.offline"
        icon="pi pi-times-circle"
        color="red"
        hint="Sin conexión"
      />
      <StatCard
        title="Lecturas hoy"
        value="—"
        icon="pi pi-chart-line"
        color="orange"
        hint="Pendiente de conectar"
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

    <!-- Gráficas MQTT en tiempo real
    <div class="charts-grid">
      <SalonChartCard />
      <SalonHumChartCard />
    </div> -->

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
