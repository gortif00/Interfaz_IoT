/**
 * Cliente HTTP centralizado basado en axios.
 *
 * - Toma la URL base desde la configuración (.env).
 * - Añade automáticamente el token Bearer si hay sesión.
 * - Añade cabecera X-API-Key si está definida.
 * - Centraliza el manejo básico de errores.
 */
import axios from 'axios'
import { apiConfig } from '@/config/api'

const http = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: {
    'Content-Type': 'application/json'
  }
})

// ---- Interceptor de petición: añade token y api key ----
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (apiConfig.apiKey) {
    config.headers['X-API-Key'] = apiConfig.apiKey
  }
  return config
})

// ---- Interceptor de respuesta: centraliza errores ----
http.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el token ha caducado o no es válido, limpiamos sesión.
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token')
      // Redirigimos a login sólo si no estamos ya ahí
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    // Normalizamos el mensaje de error para que las vistas lo muestren fácil
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Error de conexión con el servidor'

    return Promise.reject(new Error(message))
  }
)

export default http
