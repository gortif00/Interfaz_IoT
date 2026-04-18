/**
 * Servicio para consumir los endpoints de /devices.
 * Todos los métodos devuelven promesas y lanzan errores que las vistas capturan.
 */
import http from './http'
import { endpoints } from '@/config/api'

function looksLikeHtml(value) {
  return typeof value === 'string' && /^\s*</.test(value)
}

function findFirstArray(value, depth = 0) {
  if (depth > 4 || value == null) return null
  if (Array.isArray(value)) return value
  if (typeof value !== 'object') return null

  for (const nested of Object.values(value)) {
    const found = findFirstArray(nested, depth + 1)
    if (found) return found
  }

  return null
}

function normalizeStatus(device) {
  const raw = String(device?.status || '').toLowerCase().trim()
  if (raw === 'online' || raw === 'offline') return raw

  if (device?.online === true || device?.isOnline === true) return 'online'
  if (device?.online === false || device?.isOnline === false) return 'offline'

  return 'offline'
}

function normalizeLastSeen(device) {
  return (
    device?.lastSeen ||
    device?.last_seen ||
    device?.lastReadingAt ||
    device?.updatedAt ||
    device?.createdAt ||
    null
  )
}

function normalizeDevice(device) {
  const mongoId = device?._id || device?.id || null
  const deviceId =
    device?.deviceId ||
    device?.device_id ||
    device?.serial ||
    device?.mac ||
    (mongoId ? String(mongoId) : null)

  return {
    ...device,
    _id: mongoId,
    id: mongoId,
    deviceId: deviceId ? String(deviceId) : 'sin-id',
    name: device?.name || device?.deviceName || `Dispositivo ${deviceId || 'sin-id'}`,
    type: device?.type || device?.kind || 'sensor',
    location: device?.location || device?.room || 'Sin ubicacion',
    status: normalizeStatus(device),
    lastSeen: normalizeLastSeen(device)
  }
}

function normalizeDeviceList(data) {
  if (looksLikeHtml(data)) {
    throw new Error('La API devolvio HTML en vez de JSON. Revisa el proxy Nginx del backend.')
  }

  if (Array.isArray(data)) return data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.devices)) return data.devices
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.data?.devices)) return data.data.devices
  if (Array.isArray(data?.data?.items)) return data.data.items
  if (Array.isArray(data?.result?.devices)) return data.result.devices
  if (Array.isArray(data?.result?.items)) return data.result.items

  const firstArray = findFirstArray(data)
  if (firstArray) return firstArray

  throw new Error('Respuesta inesperada del servidor al listar dispositivos (formato no reconocido)')
}

export const devicesService = {
  /** Lista todos los dispositivos (público) */
  async list() {
    const { data } = await http.get(endpoints.devices.list)
    return normalizeDeviceList(data).map(normalizeDevice)
  },

  /** Lista solo los dispositivos del usuario autenticado */
  async mine() {
    const { data } = await http.get(endpoints.devices.mine)
    return normalizeDeviceList(data).map(normalizeDevice)
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
