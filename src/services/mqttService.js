/**
 * Servicio MQTT para conectarse a un broker por WebSocket.
 *
 * ¿Por qué WebSocket?
 *   El navegador no puede abrir conexiones TCP directas (que es lo que usa
 *   MQTT normalmente en el puerto 1883). Por eso usamos WebSocket (ws:// o
 *   wss://), que sí está permitido desde un navegador. El broker debe tener
 *   habilitado el listener WebSocket (normalmente en el puerto 9001).
 *
 * Uso básico:
 *   import { mqttService } from '@/services/mqttService'
 *
 *   // Conectar (normalmente tras el login)
 *   mqttService.connect({ username: 'user@mail.com', password: '1234' })
 *
 *   // Suscribirse a un topic
 *   mqttService.subscribe('sensores/temperatura')
 *
 *   // Escuchar mensajes
 *   mqttService.onMessage((topic, payload) => {
 *     console.log(topic, payload)
 *   })
 *
 *   // Publicar
 *   mqttService.publish('actuadores/led', JSON.stringify({ state: 'on' }))
 *
 *   // Desconectar (normalmente en el logout)
 *   mqttService.disconnect()
 */
import mqtt from 'mqtt'

// Configuración MQTT desde variables de entorno de Vite
const BROKER_URL    = import.meta.env.VITE_MQTT_URL      || 'ws://localhost:9001'
const MQTT_USERNAME = import.meta.env.VITE_MQTT_USERNAME  || ''
const MQTT_PASSWORD = import.meta.env.VITE_MQTT_PASSWORD  || ''

// ---- Estado interno del módulo ----
let client = null
const messageListeners = new Set()
let onStatusChangeCallback = null

/**
 * Conecta al broker MQTT por WebSocket.
 * Las credenciales se leen de las variables de entorno (VITE_MQTT_USERNAME / PASSWORD).
 */
function connect() {
  // Si ya hay conexión activa, la cerramos primero
  if (client) {
    client.end(true)
  }

  client = mqtt.connect(BROKER_URL, {
    username: MQTT_USERNAME,
    password: MQTT_PASSWORD,
    reconnectPeriod: 5000,
    connectTimeout: 10000,
    // Keepalive bajo para mantener la conexión viva a través de proxies
    // (Nginx, etc.) que cortan WebSockets inactivos
    keepalive: 30
  })

  // ---- Eventos del cliente ----

  client.on('connect', () => {
    console.log('[MQTT] Conectado al broker:', BROKER_URL)
    _notifyStatus('connected')
  })

  client.on('reconnect', () => {
    console.log('[MQTT] Intentando reconectar...')
    _notifyStatus('reconnecting')
  })

  client.on('error', (err) => {
    console.error('[MQTT] Error:', err.message)
    _notifyStatus('error', err.message)
  })

  client.on('offline', () => {
    console.log('[MQTT] Desconectado del broker')
    _notifyStatus('disconnected')
  })

  client.on('close', () => {
    _notifyStatus('disconnected')
  })

  // Cuando llega un mensaje en un topic suscrito
  // Se notifica a TODOS los listeners registrados (puede haber varios componentes)
  client.on('message', (topic, messageBuffer) => {
    // En navegador MQTT.js entrega Uint8Array, no Buffer.
    // .toString() en Uint8Array da "[object Uint8Array]", así que usamos TextDecoder.
    const payload = messageBuffer instanceof Uint8Array
      ? new TextDecoder().decode(messageBuffer)
      : messageBuffer.toString()
    messageListeners.forEach((cb) => cb(topic, payload))
  })
}

/**
 * Cierra la conexión MQTT limpiamente.
 */
function disconnect() {
  if (client) {
    client.end(true)
    client = null
    console.log('[MQTT] Desconectado manualmente')
    _notifyStatus('disconnected')
  }
}

/**
 * Se suscribe a un topic para recibir mensajes.
 *
 * @param {string} topic - por ejemplo 'sensores/+/temperatura'
 */
function subscribe(topic) {
  if (!client) {
    console.warn('[MQTT] No hay conexión activa para suscribirse')
    return
  }
  client.subscribe(topic, (err) => {
    if (err) {
      console.error(`[MQTT] Error al suscribirse a "${topic}":`, err.message)
    } else {
      console.log(`[MQTT] Suscrito a: ${topic}`)
    }
  })
}

/**
 * Se desuscribe de un topic.
 *
 * @param {string} topic
 */
function unsubscribe(topic) {
  if (!client) return
  client.unsubscribe(topic, (err) => {
    if (err) {
      console.error(`[MQTT] Error al desuscribirse de "${topic}":`, err.message)
    } else {
      console.log(`[MQTT] Desuscrito de: ${topic}`)
    }
  })
}

/**
 * Publica un mensaje en un topic.
 *
 * @param {string} topic   - por ejemplo 'actuadores/led'
 * @param {string} payload - el contenido a enviar (texto o JSON.stringify)
 */
function publish(topic, payload) {
  if (!client) {
    console.warn('[MQTT] No hay conexión activa para publicar')
    return
  }
  client.publish(topic, payload, (err) => {
    if (err) {
      console.error(`[MQTT] Error al publicar en "${topic}":`, err.message)
    }
  })
}

/**
 * Registra un listener de mensajes. Pueden registrarse varios a la vez
 * (uno por cada componente que necesite escuchar mensajes).
 *
 * Devuelve una función para des-registrarlo (útil en onUnmounted).
 *
 * @param {Function} callback - recibe (topic: string, payload: string)
 * @returns {Function} función para eliminar el listener
 *
 * Ejemplo:
 *   const off = mqttService.onMessage((topic, payload) => { ... })
 *   // Más tarde:
 *   off()  // deja de escuchar
 */
function onMessage(callback) {
  messageListeners.add(callback)
  return () => messageListeners.delete(callback)
}

/**
 * Registra un callback que se ejecutará cuando cambie el estado de conexión.
 * Lo usa el store de auth para mantener sincronizado `mqttStatus`.
 *
 * @param {Function} callback - recibe (status: string, errorMsg?: string)
 */
function onStatusChange(callback) {
  onStatusChangeCallback = callback
}

/**
 * Devuelve true si hay una conexión activa al broker.
 */
function isConnected() {
  return client !== null && client.connected
}

// ---- Interno ----
function _notifyStatus(status, errorMsg) {
  if (onStatusChangeCallback) {
    onStatusChangeCallback(status, errorMsg)
  }
}

// Exportamos un objeto con todos los métodos
export const mqttService = {
  connect,
  disconnect,
  subscribe,
  unsubscribe,
  publish,
  onMessage,
  onStatusChange,
  isConnected
}
