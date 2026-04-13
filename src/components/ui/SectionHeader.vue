<script setup>
/**
 * Cabecera reutilizable para cualquier vista.
 * Muestra título, subtítulo opcional y un slot para acciones (botones, etc.).
 */
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  icon: { type: String, default: '' }
})
</script>

<template>
  <div class="section-header">
    <div class="section-header-text">
      <h2>
        <i v-if="icon" :class="icon"></i>
        {{ title }}
      </h2>
      <p v-if="subtitle">{{ subtitle }}</p>
    </div>
    <div class="section-header-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.section-header-text h2 {
  margin: 0 0 0.25rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.section-header-text h2 i {
  color: #2563eb;
  font-size: 1.25rem;
}

.section-header-text p {
  margin: 0;
  color: #64748b;
  font-size: 0.92rem;
}

.section-header-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
</style>
