<template>
  <div class="space-y-8 animate-fade-in">
    <!-- Stat cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-5">
      <StatCard
        :title="$t('dashboard.onlineClients')"
        :value="vpn.onlineClients.length"
        :sub="$t('dashboard.ofTotal', { total: vpn.clients.length })"
        color="green" icon="users"
      />
      <StatCard
        :title="$t('dashboard.activeServers')"
        :value="activeServers"
        :sub="$t('dashboard.ofServers', { total: vpn.servers.length })"
        color="blue" icon="server"
      />
      <StatCard
        :title="$t('dashboard.totalDownload')"
        :value="fmt.formatBytes(vpn.totalDownload)"
        :sub="$t('dashboard.allTime')"
        color="purple" icon="download"
      />
      <StatCard
        :title="$t('dashboard.totalUpload')"
        :value="fmt.formatBytes(vpn.totalUpload)"
        :sub="$t('dashboard.allTime')"
        color="orange" icon="upload"
      />
    </div>

    <!-- System resources + Traffic chart -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <!-- System resources -->
      <div class="card card-hover space-y-5">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
            <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 class="section-title mb-0">{{ $t('dashboard.systemResources') }}</h2>
        </div>

        <div v-if="vpn.stats">
          <ResourceBar
            :label="$t('dashboard.cpuUsage')"
            :value="vpn.stats.cpuUsage" :max="100"
            :display="`${Math.round(vpn.stats.cpuUsage)}%`"
            color="blue"
          />
          <ResourceBar
            :label="$t('dashboard.memory')"
            :value="vpn.stats.memoryUsage" :max="vpn.stats.memoryTotal"
            :display="`${fmt.formatBytes(vpn.stats.memoryUsage)} / ${fmt.formatBytes(vpn.stats.memoryTotal)}`"
            color="purple"
          />
          <ResourceBar
            :label="$t('dashboard.disk')"
            :value="vpn.stats.diskUsage" :max="vpn.stats.diskTotal"
            :display="`${fmt.formatBytes(vpn.stats.diskUsage)} / ${fmt.formatBytes(vpn.stats.diskTotal)}`"
            color="orange"
          />

          <div class="divider" />

          <div class="grid grid-cols-2 gap-3">
            <div class="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4 border border-emerald-100">
              <div class="flex items-center gap-1.5 mb-2">
                <svg class="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                <p class="text-xs font-medium text-emerald-700">{{ $t('dashboard.downloadLabel') }}</p>
              </div>
              <p class="text-lg font-bold text-emerald-800 tracking-tight">{{ fmt.formatSpeed(vpn.stats.networkIn) }}</p>
            </div>
            <div class="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-100">
              <div class="flex items-center gap-1.5 mb-2">
                <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <p class="text-xs font-medium text-blue-700">{{ $t('dashboard.uploadLabel') }}</p>
              </div>
              <p class="text-lg font-bold text-blue-800 tracking-tight">{{ fmt.formatSpeed(vpn.stats.networkOut) }}</p>
            </div>
          </div>

          <div class="bg-slate-50/70 rounded-xl p-4 space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-sm font-medium text-slate-700">{{ $t('dashboard.uptime') }}</span>
              </div>
              <span class="text-sm font-semibold font-mono text-slate-900">{{ fmt.formatUptime(vpn.stats.uptime) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span class="text-sm font-medium text-slate-700">{{ $t('dashboard.activeConnections') }}</span>
              </div>
              <span class="text-sm font-semibold font-mono text-slate-900">{{ vpn.stats.activeConnections }}</span>
            </div>
          </div>
        </div>

        <div v-else class="flex items-center justify-center h-32">
          <LoadingSpinner />
        </div>
      </div>

      <!-- Traffic chart -->
      <div class="card card-hover lg:col-span-2">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <h2 class="section-title mb-0">{{ $t('dashboard.liveTraffic') }}</h2>
          </div>
          <div class="flex items-center gap-4 text-xs font-medium">
            <span class="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full">
              <span class="w-2 h-2 bg-emerald-500 rounded-full" />
              {{ $t('dashboard.downloadLabel') }}
            </span>
            <span class="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
              <span class="w-2 h-2 bg-blue-500 rounded-full" />
              {{ $t('dashboard.uploadLabel') }}
            </span>
          </div>
        </div>
        <TrafficChart :data="vpn.trafficHistory" />
      </div>
    </div>

    <!-- Servers + Protocol distribution -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div class="card card-hover">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
              <svg class="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
            </div>
            <h2 class="section-title mb-0">{{ $t('dashboard.servers') }}</h2>
          </div>
          <NuxtLink to="/servers" class="text-sm text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1">
            {{ $t('dashboard.viewAll') }}
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </NuxtLink>
        </div>
        <div class="space-y-2">
          <div v-for="server in vpn.servers" :key="server.id"
            class="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white hover:shadow-md hover:border-slate-200 transition-all">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              :class="server.status === 'running' ? 'bg-emerald-100' : 'bg-red-100'">
              <svg class="w-5 h-5" :class="server.status === 'running' ? 'text-emerald-600' : 'text-red-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-slate-900 truncate">{{ server.name }}</p>
              <p class="text-xs text-slate-500 font-mono" dir="ltr">{{ server.host }}:{{ server.port }}</p>
            </div>
            <div class="flex items-center gap-3">
              <span :class="fmt.protocolBadgeClass(server.protocol)">{{ server.protocol }}</span>
              <span class="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">{{ server.clients }} {{ $t('servers.clients') }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card card-hover">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-100 to-pink-50 flex items-center justify-center">
              <svg class="w-5 h-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
            <h2 class="section-title mb-0">{{ $t('dashboard.protocolDistribution') }}</h2>
          </div>
          <NuxtLink to="/clients" class="text-sm text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1">
            {{ $t('dashboard.viewClients') }}
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </NuxtLink>
        </div>
        <ProtocolChart :data="vpn.clientsByProtocol" />
      </div>
    </div>

    <!-- Recent clients table -->
    <div class="card card-hover">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center">
            <svg class="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h2 class="section-title mb-0">{{ $t('dashboard.recentClients') }}</h2>
        </div>
        <NuxtLink to="/clients" class="btn-secondary btn-sm">
          {{ $t('dashboard.manageAll') }}
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </NuxtLink>
      </div>
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>{{ $t('common.name') }}</th>
              <th>{{ $t('common.protocol') }}</th>
              <th>{{ $t('common.status') }}</th>
              <th>{{ $t('clients.ipAddress') }}</th>
              <th>{{ $t('clients.dataUsed') }}</th>
              <th>{{ $t('common.lastSeen') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="client in recentClients" :key="client.id">
              <td>
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-600">
                    {{ client.name[0] }}
                  </div>
                  <div>
                    <p class="font-medium text-slate-800">{{ client.name }}</p>
                    <p class="text-xs text-slate-500">{{ client.email }}</p>
                  </div>
                </div>
              </td>
              <td><span :class="fmt.protocolBadgeClass(client.protocol)">{{ client.protocol }}</span></td>
              <td>
                <div class="flex items-center gap-1.5">
                  <span :class="['status-dot', client.connectedSince ? 'online' : 'offline']" />
                  <span :class="fmt.statusBadgeClass(client.status)">{{ client.status }}</span>
                </div>
              </td>
              <td class="font-mono text-xs text-slate-600" dir="ltr">{{ client.ipAddress || '—' }}</td>
              <td class="text-slate-700">{{ fmt.formatBytes(client.dataUsed) }}</td>
              <td class="text-slate-500">{{ fmt.formatRelative(client.lastSeen) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const vpn = useVpnStore()
const fmt = useFormat()

const activeServers = computed(() => vpn.servers.filter(s => s.status === 'running').length)
const recentClients = computed(() => [...vpn.clients].slice(0, 8))
</script>
