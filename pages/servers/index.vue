<template>
  <div class="space-y-5 animate-fade-in">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="section-title">{{ $t('servers.title') }}</h2>
        <p class="section-subtitle">{{ $t('servers.subtitle', { running: runningCount, total: vpn.servers.length }) }}</p>
      </div>
      <button @click="showAddServer = true" class="btn-primary btn-sm">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        {{ $t('servers.addServer') }}
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div v-for="server in vpn.servers" :key="server.id"
        class="card hover:border-gray-300 transition-colors hover:shadow-md">
        <!-- Header -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div :class="['w-10 h-10 rounded-xl flex items-center justify-center shadow-sm',
              server.status === 'running' ? 'bg-emerald-100' : 'bg-red-100']">
              <svg class="w-5 h-5" :class="server.status === 'running' ? 'text-emerald-600' : 'text-red-500'"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
            </div>
            <div>
              <p class="font-semibold text-gray-900">{{ server.name }}</p>
              <p class="text-xs text-gray-500 font-mono" dir="ltr">{{ server.host }}:{{ server.port }}</p>
            </div>
          </div>
          <span :class="fmt.statusBadgeClass(server.status)">{{ server.status }}</span>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 gap-3 mb-4">
          <div class="bg-gray-50 border border-gray-100 rounded-lg p-3">
            <p class="text-xs text-gray-500 mb-1">{{ $t('common.protocol') }}</p>
            <span :class="fmt.protocolBadgeClass(server.protocol)">{{ server.protocol }}</span>
          </div>
          <div class="bg-gray-50 border border-gray-100 rounded-lg p-3">
            <p class="text-xs text-gray-500 mb-1">{{ $t('servers.clients') }}</p>
            <p class="text-sm font-semibold text-gray-800">
              {{ server.clients }}
              <span v-if="server.maxClients" class="text-gray-500 font-normal">/ {{ server.maxClients }}</span>
            </p>
          </div>
        </div>

        <!-- Capacity bar -->
        <div v-if="server.maxClients" class="mb-4">
          <div class="progress-bar">
            <div class="progress-fill bg-primary-500"
              :style="{ width: Math.round((server.clients / server.maxClients) * 100) + '%' }" />
          </div>
          <p class="text-xs text-gray-500 mt-1">
            {{ Math.round((server.clients / server.maxClients) * 100) }}% {{ $t('servers.capacity') }}
          </p>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 pt-3 border-t border-gray-100">
          <button v-if="server.status === 'running'"
            @click="restartServer(server.id)"
            class="btn-secondary btn-sm flex-1 justify-center"
            :disabled="restarting === server.id">
            <svg class="w-3.5 h-3.5" :class="restarting === server.id ? 'animate-spin' : ''"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ $t('common.restart') }}
          </button>
          <button v-if="server.status === 'running'"
            @click="vpn.stopServer(server.id)"
            class="btn-danger btn-sm flex-1 justify-center">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
            {{ $t('common.stop') }}
          </button>
          <button v-if="server.status === 'stopped'"
            @click="vpn.startServer(server.id)"
            class="btn-success btn-sm flex-1 justify-center">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ $t('common.start') }}
          </button>
          <button @click="notif.info($t('servers.editServer'), $t('servers.comingSoon'))" class="btn-ghost btn-sm p-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <ConfirmModal
      v-if="showAddServer"
      :title="$t('servers.addServer')"
      :message="$t('servers.comingSoon')"
      :confirm-label="$t('common.ok')"
      confirm-class="btn-primary"
      @confirm="showAddServer = false"
      @cancel="showAddServer = false"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const vpn = useVpnStore()
const fmt = useFormat()
const notif = useNotificationStore()
const { t } = useLocale()

const restarting = ref<string | null>(null)
const showAddServer = ref(false)
const runningCount = computed(() => vpn.servers.filter(s => s.status === 'running').length)

async function restartServer(id: string) {
  restarting.value = id
  await vpn.restartServer(id)
  restarting.value = null
  notif.success(t('servers.restarted'), t('servers.backOnline'))
}
</script>
