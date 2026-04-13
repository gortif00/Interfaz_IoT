/**
 * Configuración centralizada de la API.
 *
 * Para cambiar entre local y producción solo hay que tocar los archivos
 *   .env              -> desarrollo (npm run dev)
 *   .env.production   -> producción (npm run build)
 *
 * Variables disponibles:
 *   VITE_API_BASE_URL     -> URL base del backend
 *   VITE_API_KEY          -> API key opcional
 *   VITE_AUTH_LOGIN_PATH  -> ruta del endpoint de login
 */
export const apiConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  apiKey: import.meta.env.VITE_API_KEY || '',
  loginPath: import.meta.env.VITE_AUTH_LOGIN_PATH || '/auth/login',
  timeout: 10000
}

// Endpoints de la aplicación agrupados por recurso.
// Cambiar aquí cualquier ruta se refleja en toda la app.
export const endpoints = {
  auth: {
    login: apiConfig.loginPath,
    register: '/auth/register'
  },
  devices: {
    list: '/devices',
    mine: '/devices/mine',
    detail: (id) => `/devices/${id}`,
    create: '/devices',
    update: (id) => `/devices/${id}`,
    remove: (id) => `/devices/${id}`
  },
  readings: {
    byDevice: (deviceId) => `/readings/device/${deviceId}`,
    byDeviceRange: (deviceId, start, end) =>
      `/readings/device/${deviceId}/range?start=${start}&end=${end}`,
    create: '/readings',
    removeByDevice: (deviceId) => `/readings/device/${deviceId}`
  }
}
