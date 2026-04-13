<script setup>
/**
 * Dialog reutilizable para crear o editar un dispositivo.
 *
 * Props:
 *  - visible       (Boolean, v-model): controla la apertura del dialog
 *  - device        (Object|null): si viene con datos, se edita; si es null, se crea
 *  - loading       (Boolean): deshabilita el botón Guardar mientras hay petición
 *
 * Emits:
 *  - update:visible  (para v-model)
 *  - submit          (payload: datos del formulario)
 */
import { ref, watch, computed } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Select from 'primevue/select'

const props = defineProps({
  visible: { type: Boolean, default: false },
  device: { type: Object, default: null },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:visible', 'submit'])

const isEdit = computed(() => !!props.device)

const typeOptions = [
  { label: 'Sensor', value: 'sensor' },
  { label: 'Actuador', value: 'actuador' }
]

const form = ref({
  name: '',
  type: '',
  location: ''
})

const errors = ref({})

function resetForm() {
  form.value = {
    name: props.device?.name || '',
    type: props.device?.type || '',
    location: props.device?.location || ''
  }
  errors.value = {}
}

// Cada vez que se abre o cambia el dispositivo, reseteamos el formulario
watch(
  () => [props.visible, props.device],
  ([isVisible]) => {
    if (isVisible) resetForm()
  },
  { immediate: true }
)

function validate() {
  const e = {}
  if (!form.value.name?.trim()) e.name = 'El nombre es obligatorio'
  if (!form.value.type?.trim()) e.type = 'El tipo es obligatorio'
  errors.value = e
  return Object.keys(e).length === 0
}

function onSubmit() {
  if (!validate()) return
  emit('submit', { ...form.value })
}

function onCancel() {
  emit('update:visible', false)
}
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="(v) => emit('update:visible', v)"
    :header="isEdit ? 'Editar dispositivo' : 'Nuevo dispositivo'"
    modal
    :style="{ width: '30rem' }"
    :closable="!loading"
  >
    <form class="form" @submit.prevent="onSubmit">
      <div class="field">
        <label for="device-name">Nombre *</label>
        <InputText
          id="device-name"
          v-model="form.name"
          :invalid="!!errors.name"
          autofocus
        />
        <small v-if="errors.name" class="error">{{ errors.name }}</small>
      </div>

      <div class="field">
        <label for="device-type">Tipo *</label>
        <Select
          id="device-type"
          v-model="form.type"
          :options="typeOptions"
          option-label="label"
          option-value="value"
          placeholder="Selecciona un tipo"
          :invalid="!!errors.type"
          editable
        />
        <small v-if="errors.type" class="error">{{ errors.type }}</small>
      </div>

      <div class="field">
        <label for="device-location">Ubicación</label>
        <InputText id="device-location" v-model="form.location" />
      </div>
    </form>

    <template #footer>
      <Button
        label="Cancelar"
        severity="secondary"
        text
        :disabled="loading"
        @click="onCancel"
      />
      <Button
        :label="isEdit ? 'Guardar cambios' : 'Crear'"
        icon="pi pi-check"
        :loading="loading"
        @click="onSubmit"
      />
    </template>
  </Dialog>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 0.25rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #334155;
}

.field :deep(.p-inputtext),
.field :deep(.p-select) {
  width: 100%;
}

.error {
  color: #dc2626;
  font-size: 0.8rem;
}
</style>
