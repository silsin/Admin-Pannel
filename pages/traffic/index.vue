<template>
  <div class="space-y-5 animate-fade-in">
    <div>
      <h2 class="section-title">{{ $t('traffic.title') }}</h2>
      <p class="section-subtitle">{{ $t('traffic.subtitle') }}</p>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="card text-center">
        <p class="text-xs text-gray-500 mb-1">{{ $t('traffic.currentDownload') }}</p>
        <p class="text-xl font-bold text-emerald-600">{{ fmt.formatSpeed(vpn.stats?.networkIn || 0) }}</p>
      </div>
      <div class="card text-center">
        <p class="text-xs text-gray-500 mb-1">{{ $t('traffic.currentUpload') }}</p>
        <p class="text-xl font-bold text-blue-600">{{ fmt.formatSpeed(vpn.stats?.networkOut || 0) }}</p>
      </div>
      <div class="card text-center">
        <p class="text-xs text-gray-500 mb-1">{{ $t('traffic.totalDownloaded') }}</p>
        <p class="text-xl font-bold text-gray-800">{{ fmt.formatBytes(vpn.stats?.networkInTotal || 0) }}</p>
      </div>
      <div class="card text-center">
        <p class="text-xs text-gray-500 mb-1">{{ $t('traffic.totalUploaded') }}</p>
        <p class="text-xl font-bold text-gray-800">{{ fmt.formatBytes(vpn.stats?.networkOutTotal || 0) }}</p>
      </div>
    </div>

    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-900">{{ $t('traffic.liveTraffic') }}</h3>
        <div class="flex items-center gap-4 text-xs text-gray-500">
          <span class="flex items-center gap-1.5">
            <span class="w-3 h-0.5 bg-emerald-500 rounded inline-block" />
            {{ $t('dashboard.downloadLabel') }}
          </span>
          <span class="flex items-center gap-1.5">
            <span class="w-3 h-0.5 bg-blue-500 rounded inline-block" />
            {{ $t('dashboard.uploadLabel') }}
          </span>
        </div>
      </div>
      <TrafficChart :data="vpn.trafficHistory" :height="280" />
    </div>

    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-900">{{ $t('traffic.clientTraffic') }}</h3>
        <select v-model="sortTraffic" class="input w-52 text-xs py-1.5">
          <option value="total">{{ $t('traffic.sortTotal') }}</option>
          <option value="download">{{ $t('traffic.sortDownload') }}</option>
          <option value="upload">{{ $t('traffic.sortUpload') }}</option>
        </select>
      </div>
      <div class="space-y-3">
        <div v-for="client in sortedClients" :key="client.id" class="flex items-center gap-4">
          <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-600 flex-shrink-0">
            {{ client.name[0] }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-medium text-gray-800 truncate">{{ client.name }}</span>
              <span class="text-xs text-gray-500 ms-2 flex-shrink-0">{{ fmt.formatBytes(client.dataUsed) }}</span>
            </div>
            <div class="flex gap-1">
              <div class="progress-bar flex-1">
                <div class="progress-fill bg-emerald-500"
                  :style="{ width: fmt.percentOf(client.downloadBytes, maxDownload) + '%' }" />
              </div>
              <div class="progress-bar flex-1">
                <div class="progress-fill bg-blue-500"
                  :style="{ width: fmt.percentOf(client.uploadBytes, maxUpload) + '%' }" />
              </div>
            </div>
            <div class="flex gap-4 mt-0.5">
              <span class="text-xs text-gray-500">↓ {{ fmt.formatBytes(client.downloadBytes) }}</span>
              <span class="text-xs text-gray-500">↑ {{ fmt.formatBytes(client.uploadBytes) }}</span>
            </div>
          </div>
          <span :class="fmt.protocolBadgeClass(client.protocol)" class="flex-shrink-0">{{ client.protocol }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const vpn = useVpnStore()
const fmt = useFormat()
const sortTraffic = ref('total')

const sortedClients = computed(() =>
  [...vpn.clients].sort((a, b) => {
    if (sortTraffic.value === 'download') return b.downloadBytes - a.downloadBytes
    if (sortTraffic.value === 'upload')   return b.uploadBytes - a.uploadBytes
    return b.dataUsed - a.dataUsed
  }).slice(0, 15)
)

const maxDownload = computed(() => Math.max(...vpn.clients.map(c => c.downloadBytes), 1))
const maxUpload   = computed(() => Math.max(...vpn.clients.map(c => c.uploadBytes), 1))
</script>
