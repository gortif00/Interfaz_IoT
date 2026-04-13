<script setup>
/**
 * BindingDemoCard
 * ---------------
 * Card de demostración del "two-way data binding" (doble enlace de datos)
 * de Vue 3.
 *
 * Contiene:
 *  - Una barra deslizante (Slider de PrimeVue)
 *  - Un input numérico (InputNumber de PrimeVue)
 *  - Un display grande con el valor actual
 *
 * Los tres están enlazados al MISMO valor. Si mueves el slider, el número
 * cambia; si escribes un número, el slider se mueve. Y además, el valor
 * viaja al componente padre (DashboardView) gracias a `defineModel`.
 *
 * ----------------------------------------------------------------
 * Cómo funciona `defineModel` (Vue 3.4+)
 * ----------------------------------------------------------------
 * `defineModel()` crea automáticamente una prop `modelValue` + un evento
 * `update:modelValue`. Es el azúcar sintáctico detrás de `v-model`.
 *
 * En el padre:
 *    <BindingDemoCard v-model="valor" />
 *
 * Aquí dentro:
 *    const valor = defineModel({ default: 50 })
 *    // valor.value se lee y se escribe como cualquier ref,
 *    // pero está sincronizado con el padre en ambos sentidos.
 * ----------------------------------------------------------------
 */
import Card from 'primevue/card'
import Slider from 'primevue/slider'
import InputNumber from 'primevue/inputnumber'

// Valor enlazado con el padre mediante v-model
const value = defineModel({
  type: Number,
  default: 50
})
</script>

<template>
  <Card class="binding-card">
    <template #title>
      <div class="binding-title">
        <i class="pi pi-sliders-h"></i>
        <span>Two-way data binding</span>
      </div>
    </template>

    <template #subtitle>
      Mueve el slider o cambia el número: se sincronizan entre sí y con el padre.
    </template>

    <template #content>
      <!-- Valor actual, en grande, para ver el cambio en vivo -->
      <div class="value-display">
        {{ value }}
      </div>

      <!-- Slider: v-model enlaza con `value` -->
      <Slider v-model="value" :min="0" :max="100" class="slider" />

      <!-- Input numérico: también enlazado al MISMO `value` -->
      <div class="input-row">
        <label for="binding-input">Valor:</label>
        <InputNumber
          id="binding-input"
          v-model="value"
          :min="0"
          :max="100"
          show-buttons
          button-layout="horizontal"
          :step="1"
        >
          <template #incrementbuttonicon>
            <i class="pi pi-plus"></i>
          </template>
          <template #decrementbuttonicon>
            <i class="pi pi-minus"></i>
          </template>
        </InputNumber>
      </div>
    </template>
  </Card>
</template>

<style scoped>
.binding-card {
  height: 100%;
}

.binding-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.binding-title i {
  color: #0ea5e9;
}

.value-display {
  font-size: 3rem;
  font-weight: 700;
  color: #0f172a;
  text-align: center;
  margin: 0.5rem 0 1.5rem;
  font-variant-numeric: tabular-nums;
}

.slider {
  margin: 0 0.25rem 1.75rem;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.input-row label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #334155;
}

.input-row :deep(.p-inputnumber) {
  flex: 1;
}
</style>
