import { defineStore } from 'pinia'

export interface User {
  id: string
  username: string
  role: 'admin' | 'agent'
  email?: string
  lastLogin?: string
  agentId?: string   // set when role === 'agent'
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
    isAuthenticated: false,
  }),

  getters: {
    isAdmin:  (state) => state.user?.role === 'admin',
    isAgent:  (state) => state.user?.role === 'agent',
  },

  actions: {
    async login(username: string, password: string) {
      // Admin login
      if (username === 'admin' && password === 'admin') {
        const mockUser: User = {
          id: '1',
          username: 'admin',
          role: 'admin',
          email: 'admin@vpnpanel.local',
          lastLogin: new Date().toISOString(),
        }
        this._setSession(mockUser)
        return { success: true }
      }

      // Agent login — check against agents store
      // We do a lazy import to avoid circular deps at module load time
      const agentsStore = useAgentsStore()
      if (agentsStore.agents.length === 0) {
        await agentsStore.fetchAgents()
      }

      const agent = agentsStore.agents.find(
        a => a.username === username && a.password === password
      )

      if (agent) {
        if (agent.status === 'suspended') {
          return { success: false, message: 'Your account has been suspended.' }
        }
        const agentUser: User = {
          id: agent.id,
          username: agent.username,
          role: 'agent',
          email: agent.email,
          lastLogin: new Date().toISOString(),
          agentId: agent.id,
        }
        await agentsStore.updateAgent(agent.id, { lastLogin: new Date().toISOString() })
        this._setSession(agentUser)
        return { success: true }
      }

      return { success: false, message: 'Invalid credentials' }
    },

    _setSession(user: User) {
      this.user = user
      this.token = 'mock-jwt-token-' + Date.now()
      this.isAuthenticated = true

      if (process.client) {
        localStorage.setItem('vpn_token', this.token)
        localStorage.setItem('vpn_user', JSON.stringify(user))
      }
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
        const user  = localStorage.getItem('vpn_user')
        if (token && user) {
          this.token = token
          this.user  = JSON.parse(user)
          this.isAuthenticated = true
        }
      }
    },

    async changePassword(currentPassword: string, newPassword: string) {
      if (currentPassword === 'admin') {
        return { success: true }
      }
      return { success: false, message: 'Current password is incorrect' }
    },
  },
})
