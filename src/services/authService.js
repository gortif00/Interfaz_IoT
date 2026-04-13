/**
 * Servicio de autenticación.
 *
 * Envía { email, password } como JSON al endpoint de login.
 * El backend responde con { message, token, expiresIn }.
 */
import http from './http'
import { endpoints } from '@/config/api'

export const authService = {
  async login(credentials) {
    const { data } = await http.post(endpoints.auth.login, {
      email: credentials.email,
      password: credentials.password
    })

    return {
      token: data.token,
      user: { email: credentials.email }
    }
  },

  /**
   * Registra un usuario nuevo.
   * Backend: POST /auth/register { name, email, password }
   */
  async register({ name, email, password }) {
    const { data } = await http.post(endpoints.auth.register, {
      name,
      email,
      password
    })
    return data
  }
}
