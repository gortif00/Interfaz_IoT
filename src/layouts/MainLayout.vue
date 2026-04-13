<script setup>
/**
 * Layout general de la aplicación.
 * Incluye sidebar lateral + topbar + área de contenido (<router-view>).
 */
import { ref } from 'vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'

const sidebarCollapsed = ref(false)

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
</script>

<template>
  <div class="app-layout" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <AppSidebar :collapsed="sidebarCollapsed" />

    <div class="app-main">
      <AppTopbar @toggle-sidebar="toggleSidebar" />
      <main class="app-content">
        <router-view />
      </main>
    </div>

    <Toast position="top-right" />
    <ConfirmDialog />
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background: var(--app-bg);
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.app-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .app-content {
    padding: 1rem;
  }
}
</style>
