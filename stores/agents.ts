import { defineStore } from 'pinia'

export interface Agent {
  id: string
  username: string
  password: string
  email?: string
  walletBalance: number       // GB of bandwidth the admin has granted
  walletUsed: number          // GB consumed by this agent's clients
  maxClients: number          // client creation limit
  clientsCreated: number      // how many clients this agent has created
  status: 'active' | 'suspended'
  createdAt: string
  lastLogin?: string
  note?: string
}

export const useAgentsStore = defineStore('agents', {
  state: () => ({
    agents: [] as Agent[],
    loading: false,
  }),

  getters: {
    activeAgents: (state) => state.agents.filter(a => a.status === 'active'),
    totalWalletAllocated: (state) => state.agents.reduce((s, a) => s + a.walletBalance, 0),
    totalWalletUsed: (state) => state.agents.reduce((s, a) => s + a.walletUsed, 0),

    // Expose an agent by username for login lookup
    findByUsername: (state) => (username: string) =>
      state.agents.find(a => a.username === username),
  },

  actions: {
    async fetchAgents() {
      this.loading = true
      await new Promise(r => setTimeout(r, 300))
      if (this.agents.length === 0) {
        this.agents = generateMockAgents()
      }
      this.loading = false
    },

    async addAgent(data: Partial<Agent>) {
      const agent: Agent = {
        id: crypto.randomUUID(),
        username: data.username || 'agent',
        password: data.password || '123456',
        email: data.email,
        walletBalance: data.walletBalance ?? 100,
        walletUsed: 0,
        maxClients: data.maxClients ?? 50,
        clientsCreated: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        note: data.note,
      }
      this.agents.unshift(agent)
      return agent
    },

    async updateAgent(id: string, data: Partial<Agent>) {
      const idx = this.agents.findIndex(a => a.id === id)
      if (idx !== -1) {
        this.agents[idx] = { ...this.agents[idx], ...data }
      }
    },

    async deleteAgent(id: string) {
      this.agents = this.agents.filter(a => a.id !== id)
    },

    async toggleAgentStatus(id: string) {
      const agent = this.agents.find(a => a.id === id)
      if (agent) {
        agent.status = agent.status === 'active' ? 'suspended' : 'active'
      }
    },

    async topUpWallet(id: string, gb: number) {
      const agent = this.agents.find(a => a.id === id)
      if (agent) {
        agent.walletBalance += gb
      }
    },
  },
})

// ─── Mock Data ─────────────────────────────────────────────────────────────

function generateMockAgents(): Agent[] {
  return [
    {
      id: crypto.randomUUID(),
      username: 'agent1',
      password: 'agent123',
      email: 'agent1@vpn.local',
      walletBalance: 500,
      walletUsed: 120,
      maxClients: 50,
      clientsCreated: 14,
      status: 'active',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      lastLogin: new Date(Date.now() - 3600000).toISOString(),
      note: 'Region A reseller',
    },
    {
      id: crypto.randomUUID(),
      username: 'agent2',
      password: 'agent456',
      email: 'agent2@vpn.local',
      walletBalance: 200,
      walletUsed: 198,
      maxClients: 30,
      clientsCreated: 28,
      status: 'active',
      createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
      lastLogin: new Date(Date.now() - 7200000).toISOString(),
      note: '',
    },
    {
      id: crypto.randomUUID(),
      username: 'agent3',
      password: 'agent789',
      email: 'agent3@vpn.local',
      walletBalance: 1000,
      walletUsed: 450,
      maxClients: 100,
      clientsCreated: 62,
      status: 'suspended',
      createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
      lastLogin: new Date(Date.now() - 86400000 * 5).toISOString(),
      note: 'Suspended - payment overdue',
    },
  ]
}
