<script setup>
/**
 * Vista de Login.
 * Usuario de prueba (mock): admin@iot.com / 1234
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  error.value = ''
  if (!email.value || !password.value) {
    error.value = 'Por favor, rellena todos los campos.'
    return
  }

  loading.value = true
  try {
    await auth.login({ email: email.value, password: password.value })
    router.push({ name: 'dashboard' })
  } catch (err) {
    error.value = err.message || 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <i class="pi pi-bolt login-logo"></i>
        <h1>IoT Dashboard</h1>
        <p>Inicia sesión para continuar</p>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="field">
          <label for="email">Email</label>
          <InputText
            id="email"
            v-model="email"
            placeholder="admin@iot.com"
            autocomplete="username"
          />
        </div>

        <div class="field">
          <label for="password">Contraseña</label>
          <Password
            id="password"
            v-model="password"
            :feedback="false"
            toggle-mask
            placeholder="••••••"
            input-class="w-full"
            fluid
          />
        </div>

        <Message v-if="error" severity="error" :closable="false">
          {{ error }}
        </Message>

        <Button
          type="submit"
          label="Iniciar sesión"
          icon="pi pi-sign-in"
          :loading="loading"
          class="login-btn"
        />
      </form>

      <p class="register-hint">
        ¿No tienes cuenta?
        <router-link :to="{ name: 'register' }">Regístrate</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e293b 0%, #2563eb 100%);
  padding: 1rem;
}

.login-card {
  background: #fff;
  width: 100%;
  max-width: 420px;
  padding: 2.5rem 2rem;
  border-radius: 14px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}

.login-header {
  text-align: center;
  margin-bottom: 1.75rem;
}

.login-logo {
  font-size: 2.25rem;
  color: #2563eb;
  background: #dbeafe;
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
}

.login-header h1 {
  margin: 0;
  font-size: 1.4rem;
  color: #0f172a;
}

.login-header p {
  margin: 0.35rem 0 0;
  color: #64748b;
  font-size: 0.9rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.field label {
  font-size: 0.88rem;
  font-weight: 500;
  color: #334155;
}

.field :deep(.p-inputtext),
.field :deep(.p-password),
.field :deep(.p-password-input) {
  width: 100%;
}

.login-btn {
  margin-top: 0.5rem;
  width: 100%;
  justify-content: center;
}

.register-hint {
  margin: 1.25rem 0 0;
  text-align: center;
  color: #64748b;
  font-size: 0.88rem;
}

.register-hint a {
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
}

.register-hint a:hover {
  text-decoration: underline;
}
</style>
