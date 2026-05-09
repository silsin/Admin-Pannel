import { defineStore } from 'pinia'

export interface User {
  id: string
  username: string
  role: 'admin' | 'viewer'
  email?: string
  lastLogin?: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
    isAuthenticated: false,
  }),

  getters: {
    isAdmin: (state) => state.user?.role === 'admin',
  },

  actions: {
    async login(username: string, password: string) {
      // Mock login - replace with real API call
      if (username === 'admin' && password === 'admin') {
        const mockUser: User = {
          id: '1',
          username: 'admin',
          role: 'admin',
          email: 'admin@vpnpanel.local',
          lastLogin: new Date().toISOString(),
        }
        this.user = mockUser
        this.token = 'mock-jwt-token-' + Date.now()
        this.isAuthenticated = true

        if (process.client) {
          localStorage.setItem('vpn_token', this.token)
          localStorage.setItem('vpn_user', JSON.stringify(mockUser))
        }
        return { success: true }
      }
      return { success: false, message: 'Invalid credentials' }
    },

    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      if (process.client) {
        localStorage.removeItem('vpn_token')
        localStorage.removeItem('vpn_user')
      }
      navigateTo('/login')
    },

    restoreSession() {
      if (process.client) {
        const token = localStorage.getItem('vpn_token')
        const user = localStorage.getItem('vpn_user')
        if (token && user) {
          this.token = token
          this.user = JSON.parse(user)
          this.isAuthenticated = true
        }
      }
    },

    async changePassword(currentPassword: string, newPassword: string) {
      // Mock - replace with real API
      if (currentPassword === 'admin') {
        return { success: true }
      }
      return { success: false, message: 'Current password is incorrect' }
    },
  },
})
