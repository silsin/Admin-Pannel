import { defineStore } from 'pinia'

export type Protocol = 'openvpn' | 'wireguard' | 'vmess' | 'vless' | 'trojan' | 'shadowsocks' | 'ssr'

export interface VpnClient {
  id: string
  name: string
  // primary protocol (first in the list, kept for backward compat with table display)
  protocol: Protocol
  // all assigned protocols
  protocols: Protocol[]
  // per-protocol configs
  configs: Partial<Record<Protocol, string>>
  status: 'active' | 'inactive' | 'expired' | 'disabled'
  ipAddress?: string
  allowedIPs?: string
  publicKey?: string
  privateKey?: string
  uuid?: string
  email?: string
  telegram?: string           // NEW: telegram username for sending credentials
  expiresAt?: string | null
  dataLimit?: number | null   // bytes, null = unlimited
  dataUsed: number            // bytes
  uploadBytes: number
  downloadBytes: number
  createdAt: string
  lastSeen?: string | null
  connectedSince?: string | null
  config?: string             // kept for backward compat (= configs[protocol])
  qrCode?: string
  tags?: string[]
  note?: string
}

export interface ServerStats {
  cpuUsage: number
  memoryUsage: number
  memoryTotal: number
  diskUsage: number
  diskTotal: number
  uptime: number
  networkIn: number
  networkOut: number
  networkInTotal: number
  networkOutTotal: number
  activeConnections: number
  totalClients: number
  onlineClients: number
}

export interface VpnServer {
  id: string
  name: string
  protocol: Protocol
  host: string
  port: number
  status: 'running' | 'stopped' | 'error'
  clients: number
  maxClients?: number
  config?: Record<string, any>
}

export interface TrafficPoint {
  time: string
  in: number
  out: number
}

export const useVpnStore = defineStore('vpn', {
  state: () => ({
    clients: [] as VpnClient[],
    servers: [] as VpnServer[],
    stats: null as ServerStats | null,
    trafficHistory: [] as TrafficPoint[],
    loading: false,
    selectedProtocol: 'all' as Protocol | 'all',
    logs: [] as string[],
  }),

  getters: {
    filteredClients: (state) => {
      if (state.selectedProtocol === 'all') return state.clients
      return state.clients.filter(c => c.protocols.includes(state.selectedProtocol as Protocol))
    },
    activeClients:  (state) => state.clients.filter(c => c.status === 'active'),
    onlineClients:  (state) => state.clients.filter(c => c.connectedSince),
    totalDownload:  (state) => state.clients.reduce((sum, c) => sum + c.downloadBytes, 0),
    totalUpload:    (state) => state.clients.reduce((sum, c) => sum + c.uploadBytes, 0),
    clientsByProtocol: (state) => {
      const map: Record<string, number> = {}
      state.clients.forEach(c => {
        c.protocols.forEach(p => {
          map[p] = (map[p] || 0) + 1
        })
      })
      return map
    },
  },

  actions: {
    async fetchClients() {
      this.loading = true
      await new Promise(r => setTimeout(r, 400))
      this.clients = generateMockClients()
      this.loading = false
    },

    async fetchStats() {
      this.stats = generateMockStats()
      this.trafficHistory = generateTrafficHistory()
    },

    async fetchServers() {
      this.servers = generateMockServers()
    },

    async fetchLogs() {
      this.logs = generateMockLogs()
    },

    async addClient(data: Partial<VpnClient>) {
      const protocols: Protocol[] = data.protocols?.length
        ? data.protocols
        : [data.protocol || 'openvpn']

      const configs: Partial<Record<Protocol, string>> = {}
      protocols.forEach(p => {
        configs[p] = generateMockConfig(p, data.name || 'New Client')
      })

      const newClient: VpnClient = {
        id: crypto.randomUUID(),
        name: data.name || 'New Client',
        protocol: protocols[0],
        protocols,
        configs,
        config: configs[protocols[0]],
        status: 'active',
        dataUsed: 0,
        uploadBytes: 0,
        downloadBytes: 0,
        createdAt: new Date().toISOString(),
        expiresAt: data.expiresAt || null,
        dataLimit: data.dataLimit || null,
        email: data.email,
        telegram: data.telegram,
        note: data.note,
        tags: data.tags || [],
        ipAddress: `10.8.0.${Math.floor(Math.random() * 200) + 10}`,
        uuid: crypto.randomUUID(),
      }
      this.clients.unshift(newClient)
      return newClient
    },

    async updateClient(id: string, data: Partial<VpnClient>) {
      const idx = this.clients.findIndex(c => c.id === id)
      if (idx !== -1) {
        const updated = { ...this.clients[idx], ...data }
        // regenerate configs if protocols changed
        if (data.protocols) {
          updated.protocol = data.protocols[0]
          updated.protocols = data.protocols
          data.protocols.forEach(p => {
            if (!updated.configs[p]) {
              updated.configs[p] = generateMockConfig(p, updated.name)
            }
          })
          updated.config = updated.configs[updated.protocol]
        }
        this.clients[idx] = updated
      }
    },

    async deleteClient(id: string) {
      this.clients = this.clients.filter(c => c.id !== id)
    },

    async toggleClientStatus(id: string) {
      const client = this.clients.find(c => c.id === id)
      if (client) {
        client.status = client.status === 'active' ? 'disabled' : 'active'
      }
    },

    async resetClientTraffic(id: string) {
      const client = this.clients.find(c => c.id === id)
      if (client) {
        client.dataUsed = 0
        client.uploadBytes = 0
        client.downloadBytes = 0
      }
    },

    async restartServer(id: string) {
      const server = this.servers.find(s => s.id === id)
      if (server) {
        server.status = 'stopped'
        await new Promise(r => setTimeout(r, 1500))
        server.status = 'running'
      }
    },

    async stopServer(id: string) {
      const server = this.servers.find(s => s.id === id)
      if (server) server.status = 'stopped'
    },

    async startServer(id: string) {
      const server = this.servers.find(s => s.id === id)
      if (server) server.status = 'running'
    },

    startStatsPolling() {
      setInterval(() => {
        if (this.stats) {
          this.stats.cpuUsage = Math.max(5, Math.min(95, this.stats.cpuUsage + (Math.random() - 0.5) * 10))
          this.stats.networkIn = Math.random() * 5 * 1024 * 1024
          this.stats.networkOut = Math.random() * 3 * 1024 * 1024
          this.stats.activeConnections = Math.floor(Math.random() * 20) + 5

          const now = new Date().toLocaleTimeString()
          this.trafficHistory.push({ time: now, in: this.stats.networkIn, out: this.stats.networkOut })
          if (this.trafficHistory.length > 30) this.trafficHistory.shift()
        }
      }, 3000)
    },
  },
})

// ─── Mock Data Generators ────────────────────────────────────────────────────

function generateMockClients(): VpnClient[] {
  const allProtocols: Protocol[] = ['openvpn', 'wireguard', 'vmess', 'vless', 'trojan', 'shadowsocks']
  const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Iris', 'Jack',
    'Kate', 'Liam', 'Mia', 'Noah', 'Olivia', 'Paul', 'Quinn', 'Rachel', 'Sam', 'Tina']
  const statuses: VpnClient['status'][] = ['active', 'active', 'active', 'inactive', 'expired', 'disabled']

  return names.map((name, i) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const isOnline = status === 'active' && Math.random() > 0.5
    const upload = Math.floor(Math.random() * 5 * 1024 * 1024 * 1024)
    const download = Math.floor(Math.random() * 20 * 1024 * 1024 * 1024)

    // assign 1–3 random protocols
    const shuffled = [...allProtocols].sort(() => Math.random() - 0.5)
    const count = Math.floor(Math.random() * 3) + 1
    const protocols = shuffled.slice(0, count) as Protocol[]
    const protocol = protocols[0]

    const configs: Partial<Record<Protocol, string>> = {}
    protocols.forEach(p => { configs[p] = generateMockConfig(p, name) })

    return {
      id: crypto.randomUUID(),
      name,
      protocol,
      protocols,
      configs,
      config: configs[protocol],
      status,
      ipAddress: `10.8.0.${i + 2}`,
      email: `${name.toLowerCase()}@example.com`,
      telegram: Math.random() > 0.5 ? `@${name.toLowerCase()}_vpn` : undefined,
      uuid: crypto.randomUUID(),
      expiresAt: Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 90 * 86400000).toISOString() : null,
      dataLimit: Math.random() > 0.5 ? Math.floor(Math.random() * 100) * 1024 * 1024 * 1024 : null,
      dataUsed: upload + download,
      uploadBytes: upload,
      downloadBytes: download,
      createdAt: new Date(Date.now() - Math.random() * 180 * 86400000).toISOString(),
      lastSeen: isOnline ? new Date().toISOString() : new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
      connectedSince: isOnline ? new Date(Date.now() - Math.random() * 3600000).toISOString() : null,
      tags: Math.random() > 0.7 ? ['premium'] : [],
      note: Math.random() > 0.8 ? 'VIP client' : '',
    }
  })
}

function generateMockStats(): ServerStats {
  return {
    cpuUsage: Math.random() * 60 + 10,
    memoryUsage: 3.2 * 1024 * 1024 * 1024,
    memoryTotal: 8 * 1024 * 1024 * 1024,
    diskUsage: 45 * 1024 * 1024 * 1024,
    diskTotal: 100 * 1024 * 1024 * 1024,
    uptime: Math.floor(Math.random() * 30 * 86400),
    networkIn: Math.random() * 5 * 1024 * 1024,
    networkOut: Math.random() * 3 * 1024 * 1024,
    networkInTotal: 1.2 * 1024 * 1024 * 1024 * 1024,
    networkOutTotal: 0.8 * 1024 * 1024 * 1024 * 1024,
    activeConnections: Math.floor(Math.random() * 20) + 5,
    totalClients: 20,
    onlineClients: Math.floor(Math.random() * 10) + 3,
  }
}

function generateTrafficHistory(): TrafficPoint[] {
  const points: TrafficPoint[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 3000)
    points.push({
      time: d.toLocaleTimeString(),
      in: Math.random() * 5 * 1024 * 1024,
      out: Math.random() * 3 * 1024 * 1024,
    })
  }
  return points
}

function generateMockServers(): VpnServer[] {
  return [
    { id: '1', name: 'OpenVPN UDP',   protocol: 'openvpn',     host: '0.0.0.0', port: 1194,  status: 'running', clients: 8,  maxClients: 100 },
    { id: '2', name: 'OpenVPN TCP',   protocol: 'openvpn',     host: '0.0.0.0', port: 443,   status: 'running', clients: 3,  maxClients: 100 },
    { id: '3', name: 'WireGuard',     protocol: 'wireguard',   host: '0.0.0.0', port: 51820, status: 'running', clients: 5,  maxClients: 50  },
    { id: '4', name: 'V2Ray VMess',   protocol: 'vmess',       host: '0.0.0.0', port: 10086, status: 'running', clients: 4,  maxClients: 200 },
    { id: '5', name: 'VLESS Reality', protocol: 'vless',       host: '0.0.0.0', port: 443,   status: 'stopped', clients: 0,  maxClients: 200 },
    { id: '6', name: 'Trojan-GFW',   protocol: 'trojan',      host: '0.0.0.0', port: 8443,  status: 'running', clients: 2,  maxClients: 100 },
  ]
}

function generateMockLogs(): string[] {
  const entries = []
  const now = Date.now()
  for (let i = 0; i < 50; i++) {
    const t = new Date(now - i * 15000).toISOString()
    const msgs = [
      `[INFO] Client Alice connected from 192.168.1.100`,
      `[INFO] Client Bob disconnected, session duration: 2h 15m`,
      `[WARN] Client Charlie exceeded data limit`,
      `[INFO] OpenVPN server restarted successfully`,
      `[INFO] New client certificate issued for Diana`,
      `[ERROR] Failed to connect client Eve: timeout`,
      `[INFO] WireGuard handshake completed for Frank`,
      `[INFO] Traffic stats updated for all clients`,
    ]
    entries.push(`${t} ${msgs[i % msgs.length]}`)
  }
  return entries
}

export function generateMockConfig(protocol: Protocol, name: string): string {
  if (protocol === 'openvpn') {
    return `client
dev tun
proto udp
remote vpn.example.com 1194
resolv-retry infinite
nobind
persist-key
persist-tun
ca ca.crt
cert ${name}.crt
key ${name}.key
cipher AES-256-GCM
auth SHA256
verb 3`
  }
  if (protocol === 'wireguard') {
    return `[Interface]
PrivateKey = <PRIVATE_KEY>
Address = 10.8.0.2/24
DNS = 1.1.1.1

[Peer]
PublicKey = <SERVER_PUBLIC_KEY>
Endpoint = vpn.example.com:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25`
  }
  if (protocol === 'shadowsocks') {
    return JSON.stringify({
      server: 'vpn.example.com',
      server_port: 8388,
      password: `ss-${name.toLowerCase()}-${Math.random().toString(36).slice(2, 8)}`,
      method: 'aes-256-gcm',
      remarks: name,
    }, null, 2)
  }
  if (protocol === 'trojan') {
    return `trojan://<PASSWORD>@vpn.example.com:8443?sni=vpn.example.com#${encodeURIComponent(name)}`
  }
  // vmess / vless / default
  return JSON.stringify({
    v: '2',
    ps: name,
    add: 'vpn.example.com',
    port: protocol === 'vless' ? '443' : '10086',
    id: '<UUID>',
    aid: '0',
    net: 'ws',
    type: 'none',
    host: 'vpn.example.com',
    path: '/ray',
    tls: 'tls',
    protocol,
  }, null, 2)
}
