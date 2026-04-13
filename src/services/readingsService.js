/**
 * Servicio para consumir los endpoints de /readings.
 */
import http from './http'
import { endpoints } from '@/config/api'

export const readingsService = {
  async byDevice(deviceId) {
    const { data } = await http.get(endpoints.readings.byDevice(deviceId))
    return data
  },

  async byDeviceRange(deviceId, start, end) {
    const { data } = await http.get(
      endpoints.readings.byDeviceRange(deviceId, start, end)
    )
    return data
  },

  async create(reading) {
    const { data } = await http.post(endpoints.readings.create, reading)
    return data
  },

  async removeByDevice(deviceId) {
    const { data } = await http.delete(endpoints.readings.removeByDevice(deviceId))
    return data
  }
}
