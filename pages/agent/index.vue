<template>
  <div class="space-y-6 animate-fade-in">

    <!-- Welcome banner -->
    <div class="card bg-gradient-to-r from-violet-600/20 to-primary-600/10 border border-violet-600/30">
      <div class="flex flex-col sm:flex-row sm:items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-violet-600/30 flex items-center justify-center text-xl font-bold text-violet-300 flex-shrink-0">
          {{ auth.user?.username[0]?.toUpperCase() }}
        </div>
        <div class="flex-1">
          <h2 class="text-lg font-bold text-dark-100">{{ $t('agent.welcome', { name: auth.user?.username }) }}</h2>
          <p class="text-sm text-dark-400">{{ $t('agent.subtitle') }}</p>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <span class="status-dot online" />
          <span class="text-emerald-400 font-medium">{{ $t('agent.accountActive') }}</span>
        </div>
      </div>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="card border border-emerald-600/20 hover:border-emerald-600/40 transition-colors">
        <p class="text-xs text-dark-500 uppercase tracking-wider mb-2">{{ $t('agent.walletRemaining') }}</p>
        <p class="text-2xl font-bold text-emerald-400">{{ walletRemaining }} GB</p>
        <p class="text-xs text-dark-500 mt-1">{{ $t('agent.of') }} {{ myAgent?.walletBalance || 0 }} GB {{ $t('agent.total') }}</p>
        <div class="progress-bar mt-2">
          <div class="progress-fill bg-emerald-500" :style="{ width: walletUsedPercent + '%' }" />
        </div>
      </div>
      <div class="card border border-primary-600/20 hover:border-primary-600/40 transition-colors">
        <p class="text-xs text-dark-500 uppercase tracking-wider mb-2">{{ $t('agent.clientsCreated') }}</p>
        <p class="text-2xl font-bold text-primary-400">{{ myAgent?.clientsCreated || 0 }}</p>
        <p class="text-xs text-dark-500 mt-1">{{ $t('agent.of') }} {{ myAgent?.maxClients || 0 }} {{ $t('agent.maxAllowed') }}</p>
        <div class="progress-bar mt-2">
          <div class="progress-fill bg-primary-500" :style="{ width: clientPercent + '%' }" />
        </div>
      </div>
      <div class="card border border-blue-600/20 hover:border-blue-600/40 transition-colors">
        <p class="text-xs text-dark-500 uppercase tracking-wider mb-2">{{ $t('agent.onlineNow') }}</p>
        <p class="text-2xl font-bold text-blue-400">{{ myClients.filter(c => c.connectedSince).length }}</p>
        <p class="text-xs text-dark-500 mt-1">{{ $t('agent.outOf') }} {{ myClients.length }} {{ $t('agent.clients') }}</p>
      </div>
      <div class="card border border-orange-600/20 hover:border-orange-600/40 transition-colors">
        <p class="text-xs text-dark-500 uppercase tracking-wider mb-2">{{ $t('agent.dataUsed') }}</p>
        <p class="text-2xl font-bold text-orange-400">{{ myAgent?.walletUsed || 0 }} GB</p>
        <p class="text-xs text-dark-500 mt-1">{{ $t('agent.byYourClients') }}</p>
      </div>
    </div>

    <!-- Clients section -->
    <div class="card">
      <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div class="flex-1">
          <h3 class="section-title">{{ $t('agent.myClients') }}</h3>
          <p class="section-subtitle">{{ $t('agent.manageYourClients') }}</p>
        </div>
        <div class="flex items-center gap-2">
          <button @click="vpn.fetchClients()" class="btn-secondary btn-sm">
            <svg class="w-4 h-4" :class="vpn.loading ? 'animate-spin' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ $t('common.refresh') }}
          </button>
          <button @click="openCreateClient" :disabled="!canCreateMore" class="btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            {{ $t('agent.createClient') }}
          </button>
        </div>
      </div>

      <!-- Warnings -->
      <div v-if="!canCreateMore" class="mb-4 flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <svg class="w-4 h-4 text-yellow-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm text-yellow-400">{{ $t('agent.limitReached') }}</p>
      </div>
      <div v-if="walletRemaining <= 10 && walletRemaining >= 0" class="mb-4 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
        <svg class="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm text-red-400">{{ $t('agent.walletLow') }}</p>
      </div>

      <!-- Search -->
      <div class="relative mb-4">
        <svg class="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input v-model="search" type="text" class="input pl-9" :placeholder="$t('clients.searchPlaceholder')" />
      </div>

      <!-- Table -->
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>{{ $t('common.name') }}</th>
              <th>{{ $t('clients.protocols') }}</th>
              <th>{{ $t('common.status') }}</th>
              <th>{{ $t('clients.dataUsed') }}</th>
              <th>{{ $t('common.expires') }}</th>
              <th>{{ $t('common.lastSeen') }}</th>
              <th class="text-end">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="vpn.loading">
              <td colspan="7" class="text-center py-12"><LoadingSpinner /></td>
            </tr>
            <tr v-else-if="!filteredClients.length">
              <td colspan="7" class="text-center py-12 text-dark-500">{{ $t('common.noData') }}</td>
            </tr>

            <template v-for="client in filteredClients" :key="client.id">
              <!-- Main row -->
              <tr :class="expandedRows.includes(client.id) ? 'bg-dark-800/60' : ''">
                <td>
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-primary-600/20 flex items-center justify-center text-xs font-bold text-primary-400 flex-shrink-0">
                      {{ client.name[0] }}
                    </div>
                    <div class="min-w-0">
                      <p class="font-medium text-dark-200 truncate max-w-[120px]">{{ client.name }}</p>
                      <p class="text-xs text-dark-500 truncate max-w-[120px]">{{ client.email }}</p>
                    </div>
                  </div>
                </td>
                <!-- Multi-protocol badges -->
                <td>
                  <div class="flex flex-wrap gap-1">
                    <span v-for="p in client.protocols" :key="p" :class="fmt.protocolBadgeClass(p)">{{ p }}</span>
                  </div>
                </td>
                <td>
                  <div class="flex items-center gap-1.5">
                    <span :class="['status-dot', client.connectedSince ? 'online' : 'offline']" />
                    <span :class="fmt.statusBadgeClass(client.status)">{{ client.status }}</span>
                  </div>
                </td>
                <td>
                  <p class="text-sm">{{ fmt.formatBytes(client.dataUsed) }}</p>
                  <div v-if="client.dataLimit" class="mt-1">
                    <div class="progress-bar w-20">
                      <div class="progress-fill bg-primary-500"
                        :style="{ width: fmt.percentOf(client.dataUsed, client.dataLimit) + '%' }" />
                    </div>
                    <p class="text-xs text-dark-500 mt-0.5">
                      {{ fmt.percentOf(client.dataUsed, client.dataLimit) }}% of {{ fmt.formatBytes(client.dataLimit) }}
                    </p>
                  </div>
                </td>
                <td>
                  <span v-if="client.expiresAt" class="text-xs"
                    :class="isExpiringSoon(client.expiresAt) ? 'text-yellow-400' : 'text-dark-400'">
                    {{ fmt.formatDate(client.expiresAt) }}
                  </span>
                  <span v-else class="text-xs text-dark-500">{{ $t('common.never') }}</span>
                </td>
                <td class="text-dark-400 text-xs">
                  <span v-if="client.connectedSince" class="text-emerald-400">
                    {{ $t('clients.connectedFor', { duration: fmt.formatDuration(client.connectedSince) }) }}
                  </span>
                  <span v-else>{{ fmt.formatRelative(client.lastSeen) }}</span>
                </td>
                <td>
                  <div class="flex items-center justify-end gap-1">
                    <!-- Expand configs -->
                    <button @click="toggleExpand(client.id)"
                      class="btn-ghost btn-sm p-1.5"
                      :class="expandedRows.includes(client.id) ? 'text-primary-400' : ''"
                      :title="$t('clients.showConfigs')">
                      <svg class="w-4 h-4 transition-transform duration-200"
                        :class="expandedRows.includes(client.id) ? 'rotate-180' : ''"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button @click="viewClient(client)" class="btn-ghost btn-sm p-1.5" :title="$t('common.view')">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button @click="confirmDelete(client)" class="btn-ghost btn-sm p-1.5 text-red-400 hover:text-red-300" :title="$t('common.delete')">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Expandable config row -->
              <Transition name="expand-row">
                <tr v-if="expandedRows.includes(client.id)" class="bg-dark-800/30">
                  <td colspan="7" class="px-4 py-3">
                    <div class="flex flex-wrap gap-2 items-center">
                      <span class="text-xs text-dark-500 me-1">{{ $t('clients.downloadConfig') }}:</span>
                      <button
                        v-for="p in client.protocols" :key="p"
                        @click="downloadClientConfig(client, p)"
                        :class="['flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all hover:scale-105 border-dark-600 bg-dark-800']"
                      >
                        <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span :class="fmt.protocolBadgeClass(p).includes('blue') ? 'text-blue-400' : fmt.protocolBadgeClass(p).includes('purple') ? 'text-purple-400' : fmt.protocolBadgeClass(p).includes('emerald') ? 'text-emerald-400' : 'text-dark-300'">
                          {{ p }}
                        </span>
                        <span class="text-dark-500">.{{ configExt(p) }}</span>
                      </button>
                      <!-- Quick send -->
                      <button @click="viewClient(client)" class="ms-auto btn-ghost btn-sm text-xs gap-1.5 text-primary-400">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        {{ $t('clients.sendCredentials') }}
                      </button>
                    </div>
                  </td>
                </tr>
              </Transition>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modals -->
    <ClientAddModal  v-if="showAddModal"   @close="showAddModal = false" @saved="onClientSaved" />
    <ClientViewModal v-if="viewingClient"  :client="viewingClient"       @close="viewingClient = null" />
    <ConfirmModal
      v-if="deletingClient"
      :title="$t('clients.deleteClient')"
      :message="$t('clients.deleteConfirm', { name: deletingClient.name })"
      :confirm-label="$t('common.delete')"
      confirm-class="btn-danger"
      @confirm="doDelete"
      @cancel="deletingClient = null"
    />
  </div>
</template>

<script setup lang="ts">
import type { VpnClient, Protocol } from '~/stores/vpn'
definePageMeta({ middleware: 'auth' })

const auth = useAuthStore()
const vpn = useVpnStore()
const agentStore = useAgentsStore()
const notif = useNotificationStore()
const { t } = useLocale()
const fmt = useFormat()

if (auth.isAdmin) await navigateTo('/')

onMounted(async () => {
  await agentStore.fetchAgents()
  await vpn.fetchClients()
})

// ─── Agent data ───────────────────────────────────────────────────────────
const myAgent = computed(() =>
  agentStore.agents.find(a => a.id === auth.user?.agentId)
)
const myClients = computed(() => vpn.clients)

const walletRemaining = computed(() =>
  (myAgent.value?.walletBalance ?? 0) - (myAgent.value?.walletUsed ?? 0)
)
const walletUsedPercent = computed(() => {
  if (!myAgent.value?.walletBalance) return 0
  return Math.min(100, Math.round((myAgent.value.walletUsed / myAgent.value.walletBalance) * 100))
})
const clientPercent = computed(() => {
  if (!myAgent.value?.maxClients) return 0
  return Math.min(100, Math.round(((myAgent.value.clientsCreated) / myAgent.value.maxClients) * 100))
})
const canCreateMore = computed(() =>
  (myAgent.value?.clientsCreated ?? 0) < (myAgent.value?.maxClients ?? 0) &&
  walletRemaining.value > 0
)

// ─── Filtering ────────────────────────────────────────────────────────────
const search = ref('')
const filteredClients = computed(() => {
  if (!search.value) return myClients.value
  const q = search.value.toLowerCase()
  return myClients.value.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.email?.toLowerCase().includes(q) ||
    c.ipAddress?.includes(q)
  )
})

function isExpiringSoon(date: string) {
  return new Date(date).getTime() - Date.now() < 7 * 86400000
}

// ─── Row expand ───────────────────────────────────────────────────────────
const expandedRows = ref<string[]>([])
function toggleExpand(id: string) {
  const idx = expandedRows.value.indexOf(id)
  if (idx === -1) expandedRows.value.push(id)
  else expandedRows.value.splice(idx, 1)
}

// ─── Config download ──────────────────────────────────────────────────────
function configExt(p: Protocol) {
  return p === 'wireguard' ? 'conf' : p === 'openvpn' ? 'ovpn' : 'json'
}

function downloadClientConfig(client: VpnClient, p: Protocol) {
  const cfg = client.configs[p]
  if (!cfg) return
  const blob = new Blob([cfg], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${client.name}-${p}.${configExt(p)}`
  a.click()
  URL.revokeObjectURL(url)
  notif.success(t('clients.configDownloaded'), `${client.name} · ${p}.${configExt(p)}`)
}

// ─── Modals ───────────────────────────────────────────────────────────────
const showAddModal   = ref(false)
const viewingClient  = ref<VpnClient | null>(null)
const deletingClient = ref<VpnClient | null>(null)

function openCreateClient() { showAddModal.value = true }
function viewClient(c: VpnClient) { viewingClient.value = c }
function confirmDelete(c: VpnClient) { deletingClient.value = c }

async function onClientSaved() {
  showAddModal.value = false
  if (myAgent.value) {
    await agentStore.updateAgent(myAgent.value.id, {
      clientsCreated: (myAgent.value.clientsCreated || 0) + 1,
    })
  }
  notif.success(t('common.save'), t('clients.saved'))
}

async function doDelete() {
  if (!deletingClient.value) return
  await vpn.deleteClient(deletingClient.value.id)
  if (myAgent.value && (myAgent.value.clientsCreated || 0) > 0) {
    await agentStore.updateAgent(myAgent.value.id, {
      clientsCreated: (myAgent.value.clientsCreated || 0) - 1,
    })
  }
  notif.success(t('common.delete'), t('clients.clientDeleted', { name: deletingClient.value.name }))
  deletingClient.value = null
}
</script>

<style scoped>
.expand-row-enter-active, .expand-row-leave-active {
  transition: opacity 0.2s ease;
}
.expand-row-enter-from, .expand-row-leave-to { opacity: 0; }
.expand-row-enter-to,   .expand-row-leave-from { opacity: 1; }
</style>
