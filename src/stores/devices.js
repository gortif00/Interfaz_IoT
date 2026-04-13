/**
 * Store de dispositivos.
 *
 * Centraliza el estado del listado para poder reutilizarlo desde
 * distintas vistas (dashboard, devices, etc.).
 */
import { defineStore } from 'pinia'
import { devicesService } from '@/services/devicesService'

export const useDevicesStore = defineStore('devices', {
  state: () => ({
    items: [],
    loading: false,
    error: null,
    usingFallback: false
  }),

  getters: {
    total: (state) => state.items.length,
    online: (state) =>
      state.items.filter((d) => (d.status || '').toLowerCase() === 'online').length,
    offline: (state) =>
      state.items.filter((d) => (d.status || '').toLowerCase() === 'offline').length
  },

  actions: {
    async fetchAll() {
      this.loading = true
      this.error = null
      this.usingFallback = false
      try {
        this.items = await devicesService.mine()
      } catch (err) {
        // Si /devices/mine no está disponible, usamos /devices como fallback
        try {
          this.items = await devicesService.list()
          this.usingFallback = true
        } catch (fallbackErr) {
          this.error = fallbackErr.message
          this.items = []
        }
      } finally {
        this.loading = false
      }
    },

    async create(device) {
      const created = await devicesService.create(device)
      // Releemos la lista para mantenernos alineados con el backend
      await this.fetchAll()
      return created
    },

    async update(id, device) {
      const updated = await devicesService.update(id, device)
      await this.fetchAll()
      return updated
    },

    async remove(id) {
      await devicesService.remove(id)
      this.items = this.items.filter((d) => (d._id || d.id) !== id)
    }
  }
})
