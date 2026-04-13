<script setup>
import { useRouter } from 'vue-router'
import Button from 'primevue/button'

const router = useRouter()
</script>

<template>
  <div class="not-found">
    <div class="not-found-box">
      <i class="pi pi-exclamation-triangle"></i>
      <h1>404</h1>
      <p>La página que buscas no existe.</p>
      <Button
        label="Volver al inicio"
        icon="pi pi-home"
        @click="router.push('/')"
      />
    </div>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  padding: 1rem;
}

.not-found-box {
  text-align: center;
  background: #fff;
  padding: 3rem 2.5rem;
  border-radius: 14px;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08);
  max-width: 420px;
}

.not-found-box i {
  font-size: 3rem;
  color: #f59e0b;
  margin-bottom: 0.5rem;
}

.not-found-box h1 {
  margin: 0.25rem 0;
  font-size: 3rem;
  color: #0f172a;
}

.not-found-box p {
  color: #64748b;
  margin: 0 0 1.5rem;
}
</style>
