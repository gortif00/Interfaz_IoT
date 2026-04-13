/**
 * Servicio para consumir los endpoints de /devices.
 * Todos los métodos devuelven promesas y lanzan errores que las vistas capturan.
 */
import http from './http'
import { endpoints } from '@/config/api'

export const devicesService = {
  /** Lista todos los dispositivos (público) */
  async list() {
    const { data } = await http.get(endpoints.devices.list)
    return data
  },

  /** Lista solo los dispositivos del usuario autenticado */
  async mine() {
    const { data } = await http.get(endpoints.devices.mine)
    return data
  },

  async get(id) {
    const { data } = await http.get(endpoints.devices.detail(id))
    return data
  },

  async create(device) {
    const { data } = await http.post(endpoints.devices.create, device)
    return data
  },

  async update(id, device) {
    const { data } = await http.put(endpoints.devices.update(id), device)
    return data
  },

  async remove(id) {
    const { data } = await http.delete(endpoints.devices.remove(id))
    return data
  }
}
