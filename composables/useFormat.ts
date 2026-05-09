export function useFormat() {
  function formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
  }

  function formatSpeed(bytesPerSec: number): string {
    return formatBytes(bytesPerSec) + '/s'
  }

  function formatUptime(seconds: number): string {
    const d = Math.floor(seconds / 86400)
    const h = Math.floor((seconds % 86400) / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (d > 0) return `${d}d ${h}h ${m}m`
    if (h > 0) return `${h}h ${m}m`
    return `${m}m`
  }

  function formatDate(iso: string | null | undefined): string {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  }

  function formatDateTime(iso: string | null | undefined): string {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  function formatRelative(iso: string | null | undefined): string {
    if (!iso) return '—'
    const diff = Date.now() - new Date(iso).getTime()
    const s = Math.floor(diff / 1000)
    if (s < 60) return 'just now'
    const m = Math.floor(s / 60)
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    const d = Math.floor(h / 24)
    return `${d}d ago`
  }

  function formatDuration(iso: string | null | undefined): string {
    if (!iso) return '—'
    const diff = Date.now() - new Date(iso).getTime()
    return formatUptime(Math.floor(diff / 1000))
  }

  function formatPercent(value: number, total: number): string {
    if (total === 0) return '0%'
    return `${Math.round((value / total) * 100)}%`
  }

  function percentOf(value: number, total: number): number {
    if (total === 0) return 0
    return Math.min(100, Math.round((value / total) * 100))
  }

  function protocolColor(protocol: string): string {
    const map: Record<string, string> = {
      openvpn: 'orange',
      wireguard: 'green',
      vmess: 'blue',
      vless: 'purple',
      trojan: 'red',
      shadowsocks: 'yellow',
      ssr: 'pink',
    }
    return map[protocol] || 'gray'
  }

  function protocolBadgeClass(protocol: string): string {
    const map: Record<string, string> = {
      openvpn: 'badge bg-orange-500/20 text-orange-400',
      wireguard: 'badge bg-emerald-500/20 text-emerald-400',
      vmess: 'badge bg-blue-500/20 text-blue-400',
      vless: 'badge bg-purple-500/20 text-purple-400',
      trojan: 'badge bg-red-500/20 text-red-400',
      shadowsocks: 'badge bg-yellow-500/20 text-yellow-400',
      ssr: 'badge bg-pink-500/20 text-pink-400',
    }
    return map[protocol] || 'badge-gray'
  }

  function statusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      active: 'badge-green',
      inactive: 'badge-gray',
      expired: 'badge-yellow',
      disabled: 'badge-red',
      running: 'badge-green',
      stopped: 'badge-red',
      error: 'badge-red',
    }
    return map[status] || 'badge-gray'
  }

  return {
    formatBytes,
    formatSpeed,
    formatUptime,
    formatDate,
    formatDateTime,
    formatRelative,
    formatDuration,
    formatPercent,
    percentOf,
    protocolColor,
    protocolBadgeClass,
    statusBadgeClass,
  }
}
