<script setup>
/**
 * ParentValueCard
 * ---------------
 * Card "espejo" que muestra un valor que le pasa el padre.
 *
 * A diferencia de BindingDemoCard (que usa `v-model` / `defineModel`),
 * este componente recibe el valor en **una sola dirección**:
 *
 *   - El padre le pasa `:value="demoValue"`  (props down)
 *   - El hijo NO modifica el valor.
 *   - Si el usuario pulsa "Reset", el hijo emite un evento `reset`
 *     y es el padre quien decide qué hacer (events up).
 *
 * Esto ilustra el patrón clásico de Vue: "props down, events up".
 *
 * Props:
 *  - value:      número a mostrar
 *  - resetValue: valor sugerido al hacer reset (solo informativo para el label)
 *
 * Emits:
 *  - reset:      se dispara al pulsar el botón
 */
import Card from 'primevue/card'
import Button from 'primevue/button'

defineProps({
  value: {
    type: Number,
    required: true
  },
  resetValue: {
    type: Number,
    default: 50
  }
})

defineEmits(['reset'])
</script>

<template>
  <Card class="parent-value-card">
    <template #title>Valor en el padre</template>
    <template #subtitle>
      Este card NO conoce el slider, solo lee la misma variable.
    </template>
    <template #content>
      <p class="demo-text">
        El componente <code>DashboardView</code> tiene una variable
        <code>demoValue</code>. Esa misma variable está enlazada al
        <code>BindingDemoCard</code> con <code>v-model</code>, y también
        se muestra aquí debajo.
      </p>
      <p class="demo-text">
        Mueve el slider o escribe un número en el otro card: este valor
        se actualiza solo porque <strong>comparten la misma referencia</strong>.
      </p>

      <div class="demo-value">{{ value }}</div>

      <Button
        :label="`Reset a ${resetValue}`"
        icon="pi pi-refresh"
        severity="secondary"
        outlined
        size="small"
        @click="$emit('reset')"
      />
    </template>
  </Card>
</template>

<style scoped>
.parent-value-card {
  height: 100%;
}

.demo-text {
  color: #475569;
  line-height: 1.55;
  margin: 0 0 0.75rem;
}

.demo-text code {
  background: #f1f5f9;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 0.85em;
}

.demo-value {
  font-size: 3rem;
  font-weight: 700;
  color: #0ea5e9;
  text-align: center;
  margin: 1rem 0;
  font-variant-numeric: tabular-nums;
}
</style>
