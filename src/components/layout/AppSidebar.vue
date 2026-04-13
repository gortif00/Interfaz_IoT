<script setup>
/**
 * Sidebar lateral con navegación principal.
 * Para añadir nuevas secciones, basta con añadir un objeto al array `menu`.
 */
defineProps({
  collapsed: { type: Boolean, default: false }
})

const menu = [
  { label: 'Dashboard', icon: 'pi pi-home', to: '/dashboard' },
  { label: 'Dispositivos', icon: 'pi pi-microchip', to: '/userdevices' }
  // Aquí se pueden añadir más entradas: Lecturas, Actuadores, Histórico...
  // { label: 'Lecturas', icon: 'pi pi-chart-line', to: '/readings' },
]
</script>

<template>
  <aside class="sidebar" :class="{ collapsed }">
    <div class="sidebar-header">
      <i class="pi pi-bolt sidebar-logo"></i>
      <span v-if="!collapsed" class="sidebar-title">IoT Dashboard</span>
    </div>

    <nav class="sidebar-nav">
      <router-link
        v-for="item in menu"
        :key="item.to"
        :to="item.to"
        class="sidebar-link"
        active-class="active"
      >
        <i :class="item.icon"></i>
        <span v-if="!collapsed">{{ item.label }}</span>
      </router-link>
    </nav>

    <div class="sidebar-footer" v-if="!collapsed">
      <small>v1.0.0 · IoT</small>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 250px;
  background: #1e293b;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  transition: width 0.25s ease;
  flex-shrink: 0;
}

.sidebar.collapsed {
  width: 72px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.sidebar-logo {
  font-size: 1.5rem;
  color: #60a5fa;
}

.sidebar-title {
  font-weight: 600;
  font-size: 1.05rem;
  white-space: nowrap;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.7rem 0.85rem;
  border-radius: 8px;
  color: #cbd5e1;
  text-decoration: none;
  font-size: 0.95rem;
  transition: background 0.15s ease, color 0.15s ease;
  white-space: nowrap;
}

.sidebar-link:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
}

.sidebar-link.active {
  background: #2563eb;
  color: #fff;
}

.sidebar-link i {
  font-size: 1.1rem;
  min-width: 1.25rem;
  text-align: center;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  color: #94a3b8;
  text-align: center;
}

@media (max-width: 768px) {
  .sidebar {
    width: 72px;
  }
  .sidebar-title,
  .sidebar-link span,
  .sidebar-footer {
    display: none;
  }
}
</style>
