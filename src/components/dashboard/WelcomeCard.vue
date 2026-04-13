<script setup>
/**
 * WelcomeCard
 * -----------
 * Card de bienvenida del dashboard.
 *
 * Es un ejemplo sencillo de cómo se crea un componente propio en Vue 3:
 *
 *  1. Creamos un archivo .vue dentro de /components.
 *  2. Definimos (opcionalmente) props para recibir datos desde el padre.
 *  3. Escribimos el template con el HTML del componente.
 *  4. Añadimos estilos "scoped" (solo afectan a este archivo).
 *  5. Lo importamos y usamos en la vista que queramos.
 *
 * Props:
 *  - title:    título mostrado en la cabecera del card
 *  - subtitle: frase corta debajo del título (opcional)
 *
 * Slot por defecto:
 *  - Si se pasa contenido entre <WelcomeCard>...</WelcomeCard>, se muestra
 *    en lugar del texto por defecto. Esto hace al componente reutilizable.
 */
import Card from 'primevue/card'

defineProps({
  title: {
    type: String,
    default: 'Bienvenida'
  },
  subtitle: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <Card class="welcome-card">
    <template #title>
      <div class="welcome-title">
        
        <span>{{ title }}</span>
      </div>
    </template>

    <template #subtitle v-if="subtitle">
      {{ subtitle }}
    </template>

    <template #content>
      <!--
        <slot /> permite que el padre inserte su propio contenido.
        Si no pasa nada, se muestra el texto por defecto.
      -->
      <slot>
        <p class="welcome-text">
          Este es el panel base del proyecto de <strong>IoT</strong>.
          Desde aquí podréis navegar al listado de dispositivos y ampliar
          la aplicación con nuevas vistas (lecturas, actuadores, histórico...).
        </p>
        <p class="welcome-text">
          El código está organizado por carpetas (<code>views</code>,
          <code>components</code>, <code>stores</code>, <code>services</code>)
          para facilitar su extensión.
        </p>
      </slot>
    </template>
  </Card>
</template>

<style scoped>
.welcome-card {
  height: 100%;
}

.welcome-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.welcome-title i {
  color: #6366f1;
}

.welcome-text {
  color: #475569;
  line-height: 1.55;
  margin: 0 0 0.75rem;
}

.welcome-text code {
  background: #f1f5f9;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 0.85em;
}
</style>
