<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Stat cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- System resources -->
      <div class="card space-y-4">
        <h2 class="section-title">{{ $t('dashboard.systemResources') }}</h2>

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
            <div class="bg-dark-800 rounded-lg p-3">
              <p class="text-xs text-dark-500 mb-1">↓ {{ $t('dashboard.downloadLabel') }}</p>
              <p class="text-sm font-semibold text-emerald-400">{{ fmt.formatSpeed(vpn.stats.networkIn) }}</p>
            </div>
            <div class="bg-dark-800 rounded-lg p-3">
              <p class="text-xs text-dark-500 mb-1">↑ {{ $t('dashboard.uploadLabel') }}</p>
              <p class="text-sm font-semibold text-blue-400">{{ fmt.formatSpeed(vpn.stats.networkOut) }}</p>
            </div>
          </div>

          <div class="flex items-center justify-between pt-1">
            <span class="text-xs text-dark-500">{{ $t('dashboard.uptime') }}</span>
            <span class="text-xs font-mono text-dark-300">{{ fmt.formatUptime(vpn.stats.uptime) }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-dark-500">{{ $t('dashboard.activeConnections') }}</span>
            <span class="text-xs font-mono text-dark-300">{{ vpn.stats.activeConnections }}</span>
          </div>
        </div>

        <div v-else class="flex items-center justify-center h-32">
          <LoadingSpinner />
        </div>
      </div>

      <!-- Traffic chart -->
      <div class="card lg:col-span-2">
        <div class="flex items-center justify-between mb-4">
          <h2 class="section-title">{{ $t('dashboard.liveTraffic') }}</h2>
          <div class="flex items-center gap-4 text-xs text-dark-500">
            <span class="flex items-center gap-1.5">
              <span class="w-3 h-0.5 bg-emerald-400 rounded inline-block" />
              {{ $t('dashboard.downloadLabel') }}
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-3 h-0.5 bg-blue-400 rounded inline-block" />
              {{ $t('dashboard.uploadLabel') }}
            </span>
          </div>
        </div>
        <TrafficChart :data="vpn.trafficHistory" />
      </div>
    </div>

    <!-- Servers + Protocol distribution -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="section-title">{{ $t('dashboard.servers') }}</h2>
          <NuxtLink to="/servers" class="text-xs text-primary-400 hover:text-primary-300">
            {{ $t('dashboard.viewAll') }}
          </NuxtLink>
        </div>
        <div class="space-y-2">
          <div v-for="server in vpn.servers" :key="server.id"
            class="flex items-center gap-3 p-3 bg-dark-800 rounded-lg">
            <span :class="['status-dot', server.status === 'running' ? 'online' : 'offline']" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-dark-200 truncate">{{ server.name }}</p>
              <p class="text-xs text-dark-500 font-mono" dir="ltr">{{ server.host }}:{{ server.port }}</p>
            </div>
            <span :class="fmt.protocolBadgeClass(server.protocol)">{{ server.protocol }}</span>
            <span class="text-xs text-dark-400">{{ server.clients }} {{ $t('servers.clients') }}</span>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="section-title">{{ $t('dashboard.protocolDistribution') }}</h2>
          <NuxtLink to="/clients" class="text-xs text-primary-400 hover:text-primary-300">
            {{ $t('dashboard.viewClients') }}
          </NuxtLink>
        </div>
        <ProtocolChart :data="vpn.clientsByProtocol" />
      </div>
    </div>

    <!-- Recent clients table -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h2 class="section-title">{{ $t('dashboard.recentClients') }}</h2>
        <NuxtLink to="/clients" class="btn-secondary btn-sm">{{ $t('dashboard.manageAll') }}</NuxtLink>
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
                  <div class="w-7 h-7 rounded-full bg-primary-600/20 flex items-center justify-center text-xs font-bold text-primary-400">
                    {{ client.name[0] }}
                  </div>
                  <div>
                    <p class="font-medium text-dark-200">{{ client.name }}</p>
                    <p class="text-xs text-dark-500">{{ client.email }}</p>
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
              <td class="font-mono text-xs" dir="ltr">{{ client.ipAddress || '—' }}</td>
              <td>{{ fmt.formatBytes(client.dataUsed) }}</td>
              <td class="text-dark-400">{{ fmt.formatRelative(client.lastSeen) }}</td>
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
