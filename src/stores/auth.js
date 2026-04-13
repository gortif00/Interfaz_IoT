/**
 * Store de autenticación con Pinia.
 *
 * Guarda el token y el usuario de la sesión.
 * Persiste el token en localStorage para no perderlo al recargar.
 *
 * Además gestiona la conexión MQTT:
 *  - Al hacer login → conecta al broker con las credenciales del usuario.
 *  - Al hacer logout → desconecta del broker.
 *  - Expone el estado de conexión MQTT para que la interfaz lo muestre.
 */
import { defineStore } from 'pinia'
import { authService } from '@/services/authService'
import { mqttService } from '@/services/mqttService'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    user: null,
    // Estado de la conexión MQTT: 'disconnected' | 'connected' | 'reconnecting' | 'error'
    mqttStatus: 'disconnected',
    mqttError: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isMqttConnected: (state) => state.mqttStatus === 'connected'
  },

  actions: {
    /**
     * Login del usuario + conexión MQTT.
     *
     * Recibe { email, password } desde el formulario.
     * 1. Autentica contra la API y guarda el JWT.
     * 2. Conecta al broker MQTT usando las mismas credenciales.
     */
    async login(credentials) {
      const { token, user } = await authService.login(credentials)
      this.token = token
      this.user = user
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(user))

      // Conectar MQTT (credenciales tomadas del .env)
      this.connectMqtt()
    },

    /**
     * Logout: limpia sesión + cierra MQTT.
     */
    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)

      // Cerrar conexión MQTT
      this.disconnectMqtt()
    },

    /**
     * Recupera la sesión de localStorage al arrancar la app.
     * Si hay sesión guardada, también reconecta MQTT (las credenciales
     * del broker están en el .env, no dependen del usuario).
     */
    loadTokenFromStorage() {
      const token = localStorage.getItem(TOKEN_KEY)
      const user = localStorage.getItem(USER_KEY)
      if (token) {
        this.token = token
        this.user = user ? JSON.parse(user) : null
        this.connectMqtt()
      }
    },

    /**
     * Conecta al broker MQTT por WebSocket.
     * Registra un listener para mantener mqttStatus sincronizado.
     */
    connectMqtt() {
      // Escuchamos los cambios de estado del servicio
      mqttService.onStatusChange((status, errorMsg) => {
        this.mqttStatus = status
        this.mqttError = status === 'error' ? errorMsg : null
      })

      mqttService.connect()
    },

    /**
     * Cierra la conexión MQTT.
     */
    disconnectMqtt() {
      mqttService.disconnect()
      this.mqttStatus = 'disconnected'
      this.mqttError = null
    }
  }
})
