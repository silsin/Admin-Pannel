import { defineStore } from 'pinia'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
}

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    items: [] as Notification[],
  }),

  actions: {
    add(notification: Omit<Notification, 'id'>) {
      const id = crypto.randomUUID()
      this.items.push({ ...notification, id })
      const duration = notification.duration ?? 4000
      if (duration > 0) {
        setTimeout(() => this.remove(id), duration)
      }
      return id
    },

    remove(id: string) {
      this.items = this.items.filter(n => n.id !== id)
    },

    success(title: string, message?: string) {
      return this.add({ type: 'success', title, message })
    },

    error(title: string, message?: string) {
      return this.add({ type: 'error', title, message, duration: 6000 })
    },

    warning(title: string, message?: string) {
      return this.add({ type: 'warning', title, message })
    },

    info(title: string, message?: string) {
      return this.add({ type: 'info', title, message })
    },
  },
})
