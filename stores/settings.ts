import { defineStore } from 'pinia'

export interface AppSettings {
  serverName: string
  serverHost: string
  serverPort: number
  timezone: string
  language: string
  autoRefresh: boolean
  refreshInterval: number // seconds
  telegramBotToken: string
  telegramChatId: string
  telegramNotifications: boolean
  emailNotifications: boolean
  emailSmtp: string
  emailPort: number
  emailUser: string
  emailPassword: string
  emailFrom: string
  defaultDataLimit: number // GB, 0 = unlimited
  defaultExpireDays: number // 0 = never
  maxClients: number
  allowedIPs: string
  dnsServers: string
  mtu: number
  keepalive: number
  twoFactorAuth: boolean
  sessionTimeout: number // minutes
  loginAttempts: number
  banDuration: number // minutes
}

export const useSettingsStore = defineStore('settings', {
  state: (): AppSettings => ({
    serverName: 'My VPN Server',
    serverHost: '0.0.0.0',
    serverPort: 1194,
    timezone: 'UTC',
    language: 'en',
    autoRefresh: true,
    refreshInterval: 10,
    telegramBotToken: '',
    telegramChatId: '',
    telegramNotifications: false,
    emailNotifications: false,
    emailSmtp: '',
    emailPort: 587,
    emailUser: '',
    emailPassword: '',
    emailFrom: '',
    defaultDataLimit: 0,
    defaultExpireDays: 0,
    maxClients: 100,
    allowedIPs: '0.0.0.0/0',
    dnsServers: '1.1.1.1, 8.8.8.8',
    mtu: 1420,
    keepalive: 25,
    twoFactorAuth: false,
    sessionTimeout: 60,
    loginAttempts: 5,
    banDuration: 30,
  }),

  actions: {
    async save(data: Partial<AppSettings>) {
      Object.assign(this.$state, data)
      if (process.client) {
        localStorage.setItem('vpn_settings', JSON.stringify(this.$state))
      }
    },

    load() {
      if (process.client) {
        const saved = localStorage.getItem('vpn_settings')
        if (saved) {
          try {
            Object.assign(this.$state, JSON.parse(saved))
          } catch {}
        }
      }
    },
  },
})
