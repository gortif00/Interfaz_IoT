<script setup>
/**
 * Card reutilizable para mostrar una estadística rápida.
 * Uso:
 *   <StatCard title="Dispositivos" :value="12" icon="pi pi-microchip" color="blue" />
 */
defineProps({
  title: { type: String, required: true },
  value: { type: [String, Number], required: true },
  icon: { type: String, default: 'pi pi-chart-bar' },
  color: { type: String, default: 'blue' }, // blue | green | red | orange
  hint: { type: String, default: '' }
})
</script>

<template>
  <div class="stat-card" :class="`stat-${color}`">
    <div class="stat-icon">
      <i :class="icon"></i>
    </div>
    <div class="stat-body">
      <p class="stat-title">{{ title }}</p>
      <p class="stat-value">{{ value }}</p>
      <p v-if="hint" class="stat-hint">{{ hint }}</p>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 1.25rem 1.35rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
  border: 1px solid #e2e8f0;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  flex-shrink: 0;
}

.stat-title {
  margin: 0;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.stat-value {
  margin: 0.25rem 0 0;
  color: #0f172a;
  font-size: 1.75rem;
  font-weight: 700;
}

.stat-hint {
  margin: 0.25rem 0 0;
  color: #94a3b8;
  font-size: 0.8rem;
}

/* Variantes de color */
.stat-blue .stat-icon  { background: #dbeafe; color: #2563eb; }
.stat-green .stat-icon { background: #dcfce7; color: #16a34a; }
.stat-red .stat-icon   { background: #fee2e2; color: #dc2626; }
.stat-orange .stat-icon{ background: #ffedd5; color: #ea580c; }
</style>
