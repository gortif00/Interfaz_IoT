<script setup>
/**
 * Vista de registro de usuario.
 * Envía { name, email, password } a POST /auth/register.
 *
 * Tras un registro correcto mostramos un mensaje y redirigimos a /login
 * para que el usuario inicie sesión con sus credenciales.
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { authService } from '@/services/authService'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'

const router = useRouter()
const toast = useToast()

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const loading = ref(false)
const error = ref('')

async function handleRegister() {
  error.value = ''

  // Validaciones básicas
  if (!name.value || !email.value || !password.value) {
    error.value = 'Por favor, rellena todos los campos.'
    return
  }
  if (password.value.length < 4) {
    error.value = 'La contraseña debe tener al menos 4 caracteres.'
    return
  }
  if (password.value !== passwordConfirm.value) {
    error.value = 'Las contraseñas no coinciden.'
    return
  }

  loading.value = true
  try {
    await authService.register({
      name: name.value,
      email: email.value,
      password: password.value
    })

    toast.add({
      severity: 'success',
      summary: 'Cuenta creada',
      detail: 'Ya puedes iniciar sesión.',
      life: 4000
    })

    router.push({ name: 'login' })
  } catch (err) {
    error.value = err.message || 'Error al registrar el usuario'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="register-page">
    <div class="register-card">
      <div class="register-header">
        <i class="pi pi-user-plus register-logo"></i>
        <h1>Crear cuenta</h1>
        <p>Regístrate para acceder al panel</p>
      </div>

      <form class="register-form" @submit.prevent="handleRegister">
        <div class="field">
          <label for="name">Nombre</label>
          <InputText
            id="name"
            v-model="name"
            placeholder="Tu nombre"
            autocomplete="name"
          />
        </div>

        <div class="field">
          <label for="email">Email</label>
          <InputText
            id="email"
            v-model="email"
            placeholder="tucorreo@ejemplo.com"
            autocomplete="email"
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

        <div class="field">
          <label for="password-confirm">Repite la contraseña</label>
          <Password
            id="password-confirm"
            v-model="passwordConfirm"
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
          label="Crear cuenta"
          icon="pi pi-user-plus"
          :loading="loading"
          class="register-btn"
        />
      </form>

      <p class="login-hint">
        ¿Ya tienes cuenta?
        <router-link :to="{ name: 'login' }">Inicia sesión</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e293b 0%, #2563eb 100%);
  padding: 1rem;
}

.register-card {
  background: #fff;
  width: 100%;
  max-width: 440px;
  padding: 2.5rem 2rem;
  border-radius: 14px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}

.register-header {
  text-align: center;
  margin-bottom: 1.75rem;
}

.register-logo {
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

.register-header h1 {
  margin: 0;
  font-size: 1.4rem;
  color: #0f172a;
}

.register-header p {
  margin: 0.35rem 0 0;
  color: #64748b;
  font-size: 0.9rem;
}

.register-form {
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

.register-btn {
  margin-top: 0.5rem;
  width: 100%;
  justify-content: center;
}

.login-hint {
  margin: 1.25rem 0 0;
  text-align: center;
  color: #64748b;
  font-size: 0.88rem;
}

.login-hint a {
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
}

.login-hint a:hover {
  text-decoration: underline;
}
</style>
