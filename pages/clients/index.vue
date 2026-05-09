<template>
  <div class="space-y-5 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-3">
      <div class="flex-1">
        <h2 class="section-title">{{ $t('clients.title') }}</h2>
        <p class="section-subtitle">{{ $t('clients.subtitle', { total: vpn.clients.length, online: vpn.onlineClients.length }) }}</p>
      </div>
      <div class="flex items-center gap-2">
        <button @click="vpn.fetchClients()" class="btn-secondary btn-sm">
          <svg class="w-4 h-4" :class="vpn.loading ? 'animate-spin' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {{ $t('common.refresh') }}
        </button>
        <button @click="showAddModal = true" class="btn-primary btn-sm">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ $t('clients.addClient') }}
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="card p-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <svg class="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500"
            :class="isRTL ? 'right-3' : 'left-3'"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input v-model="search" type="text" class="input"
            :class="isRTL ? 'pr-9' : 'pl-9'"
            :placeholder="$t('clients.searchPlaceholder')" />
        </div>
        <select v-model="protocolFilter" class="input sm:w-44">
          <option value="all">{{ $t('clients.allProtocols') }}</option>
          <option value="openvpn">OpenVPN</option>
          <option value="wireguard">WireGuard</option>
          <option value="vmess">VMess</option>
          <option value="vless">VLESS</option>
          <option value="trojan">Trojan</option>
          <option value="shadowsocks">Shadowsocks</option>
        </select>
        <select v-model="statusFilter" class="input sm:w-40">
          <option value="all">{{ $t('clients.allStatus') }}</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="expired">Expired</option>
          <option value="disabled">Disabled</option>
        </select>
        <select v-model="sortBy" class="input sm:w-48">
          <option value="name">{{ $t('clients.sortName') }}</option>
          <option value="created">{{ $t('clients.sortCreated') }}</option>
          <option value="data">{{ $t('clients.sortData') }}</option>
          <option value="lastSeen">{{ $t('clients.sortLastSeen') }}</option>
        </select>
      </div>
    </div>

    <!-- Bulk actions bar -->
    <div v-if="selected.length"
      class="flex items-center gap-3 p-3 bg-primary-600/10 border border-primary-600/30 rounded-xl">
      <span class="text-sm text-primary-400 font-medium">
        {{ $t('clients.selected', { count: selected.length }) }}
      </span>
      <div class="flex items-center gap-2 ms-auto">
        <button @click="bulkEnable"  class="btn-success btn-sm">{{ $t('clients.bulkEnable') }}</button>
        <button @click="bulkDisable" class="btn-secondary btn-sm">{{ $t('clients.bulkDisable') }}</button>
        <button @click="bulkDelete"  class="btn-danger btn-sm">{{ $t('clients.bulkDelete') }}</button>
        <button @click="selected = []" class="btn-ghost btn-sm">{{ $t('clients.clearSelection') }}</button>
      </div>
    </div>

    <!-- Table -->
    <div class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th class="w-10">
              <input type="checkbox" class="rounded" :checked="allSelected" @change="toggleAll" />
            </th>
            <th>{{ $t('common.name') }}</th>
            <th>{{ $t('common.protocol') }}</th>
            <th>{{ $t('common.status') }}</th>
            <th>{{ $t('clients.ipAddress') }}</th>
            <th>{{ $t('clients.dataUsed') }}</th>
            <th>{{ $t('common.expires') }}</th>
            <th>{{ $t('common.lastSeen') }}</th>
            <th class="text-end">{{ $t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="vpn.loading">
            <td colspan="9" class="text-center py-12"><LoadingSpinner /></td>
          </tr>
          <tr v-else-if="!filteredClients.length">
            <td colspan="9" class="text-center py-12 text-dark-500">{{ $t('common.noData') }}</td>
          </tr>
          <tr v-for="client in filteredClients" :key="client.id">
            <td>
              <input type="checkbox" class="rounded" :value="client.id" v-model="selected" />
            </td>
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
            <td><span :class="fmt.protocolBadgeClass(client.protocol)">{{ client.protocol }}</span></td>
            <td>
              <div class="flex items-center gap-1.5">
                <span :class="['status-dot', client.connectedSince ? 'online' : 'offline']" />
                <span :class="fmt.statusBadgeClass(client.status)">{{ client.status }}</span>
              </div>
            </td>
            <td class="font-mono text-xs text-dark-400" dir="ltr">{{ client.ipAddress || '—' }}</td>
            <td>
              <div>
                <p class="text-sm">{{ fmt.formatBytes(client.dataUsed) }}</p>
                <div v-if="client.dataLimit" class="mt-1">
                  <div class="progress-bar w-20">
                    <div class="progress-fill bg-primary-500"
                      :style="{ width: fmt.percentOf(client.dataUsed, client.dataLimit) + '%' }" />
                  </div>
                  <p class="text-xs text-dark-500 mt-0.5">
                    {{ fmt.percentOf(client.dataUsed, client.dataLimit) }}% {{ $t('common.of') ?? 'of' }} {{ fmt.formatBytes(client.dataLimit) }}
                  </p>
                </div>
              </div>
            </td>
            <td>
              <span v-if="client.expiresAt"
                :class="isExpiringSoon(client.expiresAt) ? 'text-yellow-400' : 'text-dark-400'"
                class="text-xs">
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
                <button @click="viewClient(client)" class="btn-ghost btn-sm p-1.5" :title="$t('common.view')">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button @click="editClient(client)" class="btn-ghost btn-sm p-1.5" :title="$t('common.edit')">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button @click="vpn.toggleClientStatus(client.id)" class="btn-ghost btn-sm p-1.5"
                  :title="client.status === 'active' ? $t('common.disable') : $t('common.enable')">
                  <svg v-if="client.status === 'active'" class="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  <svg v-else class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
        </tbody>
      </table>
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between text-sm text-dark-400">
      <span>{{ $t('clients.showingOf', { shown: filteredClients.length, total: vpn.clients.length }) }}</span>
    </div>

    <!-- Modals -->
    <ClientAddModal  v-if="showAddModal"    @close="showAddModal = false"   @saved="onClientSaved" />
    <ClientEditModal v-if="editingClient"   :client="editingClient"         @close="editingClient = null" @saved="onClientSaved" />
    <ClientViewModal v-if="viewingClient"   :client="viewingClient"         @close="viewingClient = null" />
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
import type { VpnClient } from '~/stores/vpn'
definePageMeta({ middleware: 'auth' })

const vpn = useVpnStore()
const fmt = useFormat()
const notif = useNotificationStore()
const { t, isRTL } = useLocale()

const search = ref('')
const protocolFilter = ref('all')
const statusFilter = ref('all')
const sortBy = ref('name')
const selected = ref<string[]>([])
const showAddModal = ref(false)
const editingClient = ref<VpnClient | null>(null)
const viewingClient = ref<VpnClient | null>(null)
const deletingClient = ref<VpnClient | null>(null)

const filteredClients = computed(() => {
  let list = [...vpn.clients]
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.ipAddress?.includes(q)
    )
  }
  if (protocolFilter.value !== 'all') list = list.filter(c => c.protocol === protocolFilter.value)
  if (statusFilter.value !== 'all') list = list.filter(c => c.status === statusFilter.value)
  list.sort((a, b) => {
    if (sortBy.value === 'name') return a.name.localeCompare(b.name)
    if (sortBy.value === 'data') return b.dataUsed - a.dataUsed
    if (sortBy.value === 'created') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    if (sortBy.value === 'lastSeen') return new Date(b.lastSeen || 0).getTime() - new Date(a.lastSeen || 0).getTime()
    return 0
  })
  return list
})

const allSelected = computed(() =>
  filteredClients.value.length > 0 && filteredClients.value.every(c => selected.value.includes(c.id))
)

function toggleAll(e: Event) {
  selected.value = (e.target as HTMLInputElement).checked
    ? filteredClients.value.map(c => c.id) : []
}

function isExpiringSoon(date: string) {
  return new Date(date).getTime() - Date.now() < 7 * 86400000
}

function viewClient(c: VpnClient)    { viewingClient.value = c }
function editClient(c: VpnClient)    { editingClient.value = c }
function confirmDelete(c: VpnClient) { deletingClient.value = c }

async function doDelete() {
  if (!deletingClient.value) return
  await vpn.deleteClient(deletingClient.value.id)
  notif.success(t('common.delete'), t('clients.clientDeleted', { name: deletingClient.value.name }))
  deletingClient.value = null
}

async function bulkEnable() {
  for (const id of selected.value) {
    const c = vpn.clients.find(x => x.id === id)
    if (c && c.status !== 'active') await vpn.toggleClientStatus(id)
  }
  notif.success(t('clients.bulkEnable'), t('clients.clientsEnabled', { count: selected.value.length }))
  selected.value = []
}

async function bulkDisable() {
  for (const id of selected.value) {
    const c = vpn.clients.find(x => x.id === id)
    if (c && c.status === 'active') await vpn.toggleClientStatus(id)
  }
  notif.success(t('clients.bulkDisable'), t('clients.clientsDisabled', { count: selected.value.length }))
  selected.value = []
}

async function bulkDelete() {
  for (const id of selected.value) await vpn.deleteClient(id)
  notif.success(t('common.delete'), t('clients.clientsDeleted', { count: selected.value.length }))
  selected.value = []
}

function onClientSaved() {
  showAddModal.value = false
  editingClient.value = null
  notif.success(t('common.save'), t('clients.saved'))
}
</script>
