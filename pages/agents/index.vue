<template>
  <div class="space-y-6 animate-fade-in">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-3">
      <div class="flex-1">
        <h2 class="section-title">{{ $t('agents.title') }}</h2>
        <p class="section-subtitle">{{ $t('agents.subtitle', { total: agentStore.agents.length, active: agentStore.activeAgents.length }) }}</p>
      </div>
      <button @click="openAdd" class="btn-primary btn-sm">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        {{ $t('agents.addAgent') }}
      </button>
    </div>

    <!-- Summary cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="card flex flex-col gap-1">
        <p class="text-xs text-dark-500 uppercase tracking-wider">{{ $t('agents.totalAgents') }}</p>
        <p class="text-2xl font-bold text-dark-100">{{ agentStore.agents.length }}</p>
        <p class="text-xs text-emerald-400">{{ agentStore.activeAgents.length }} {{ $t('agents.active') }}</p>
      </div>
      <div class="card flex flex-col gap-1">
        <p class="text-xs text-dark-500 uppercase tracking-wider">{{ $t('agents.walletAllocated') }}</p>
        <p class="text-2xl font-bold text-primary-400">{{ agentStore.totalWalletAllocated }} GB</p>
        <p class="text-xs text-dark-500">{{ $t('agents.totalGranted') }}</p>
      </div>
      <div class="card flex flex-col gap-1">
        <p class="text-xs text-dark-500 uppercase tracking-wider">{{ $t('agents.walletUsed') }}</p>
        <p class="text-2xl font-bold text-orange-400">{{ agentStore.totalWalletUsed }} GB</p>
        <p class="text-xs text-dark-500">{{ $t('agents.consumedByClients') }}</p>
      </div>
      <div class="card flex flex-col gap-1">
        <p class="text-xs text-dark-500 uppercase tracking-wider">{{ $t('agents.totalClients') }}</p>
        <p class="text-2xl font-bold text-dark-100">{{ totalClientsCreated }}</p>
        <p class="text-xs text-dark-500">{{ $t('agents.acrossAllAgents') }}</p>
      </div>
    </div>

    <!-- Agents Table -->
    <div class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>{{ $t('common.name') }}</th>
            <th>{{ $t('common.status') }}</th>
            <th>{{ $t('agents.wallet') }}</th>
            <th>{{ $t('agents.clients') }}</th>
            <th>{{ $t('common.lastSeen') }}</th>
            <th>{{ $t('common.note') }}</th>
            <th class="text-end">{{ $t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="agentStore.loading">
            <td colspan="7" class="text-center py-12"><LoadingSpinner /></td>
          </tr>
          <tr v-else-if="!agentStore.agents.length">
            <td colspan="7" class="text-center py-12 text-dark-500">{{ $t('common.noData') }}</td>
          </tr>
          <tr v-for="agent in agentStore.agents" :key="agent.id">
            <!-- Name / email -->
            <td>
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-violet-600/20 flex items-center justify-center text-xs font-bold text-violet-400 flex-shrink-0">
                  {{ agent.username[0].toUpperCase() }}
                </div>
                <div class="min-w-0">
                  <p class="font-medium text-dark-200 truncate max-w-[120px]">{{ agent.username }}</p>
                  <p class="text-xs text-dark-500 truncate max-w-[120px]">{{ agent.email || '—' }}</p>
                </div>
              </div>
            </td>

            <!-- Status -->
            <td>
              <span :class="agent.status === 'active'
                ? 'badge-success'
                : 'badge-danger'">
                {{ agent.status }}
              </span>
            </td>

            <!-- Wallet -->
            <td>
              <div class="min-w-[120px]">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs text-dark-400">{{ agent.walletUsed }} / {{ agent.walletBalance }} GB</span>
                  <span class="text-xs font-semibold"
                    :class="walletPercent(agent) > 90 ? 'text-red-400' : walletPercent(agent) > 70 ? 'text-yellow-400' : 'text-emerald-400'">
                    {{ walletPercent(agent) }}%
                  </span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill"
                    :class="walletPercent(agent) > 90 ? 'bg-red-500' : walletPercent(agent) > 70 ? 'bg-yellow-500' : 'bg-emerald-500'"
                    :style="{ width: walletPercent(agent) + '%' }" />
                </div>
              </div>
            </td>

            <!-- Clients -->
            <td>
              <span class="text-sm text-dark-200">{{ agent.clientsCreated }}</span>
              <span class="text-xs text-dark-500"> / {{ agent.maxClients }}</span>
            </td>

            <!-- Last seen -->
            <td class="text-xs text-dark-400">{{ fmt.formatRelative(agent.lastLogin) }}</td>

            <!-- Note -->
            <td class="text-xs text-dark-500 max-w-[140px] truncate">{{ agent.note || '—' }}</td>

            <!-- Actions -->
            <td>
              <div class="flex items-center justify-end gap-1">
                <!-- Top up wallet -->
                <button @click="openTopUp(agent)" class="btn-ghost btn-sm p-1.5 text-emerald-400 hover:text-emerald-300"
                  :title="$t('agents.topUp')">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <!-- Edit -->
                <button @click="openEdit(agent)" class="btn-ghost btn-sm p-1.5" :title="$t('common.edit')">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <!-- Toggle status -->
                <button @click="agentStore.toggleAgentStatus(agent.id)" class="btn-ghost btn-sm p-1.5"
                  :title="agent.status === 'active' ? $t('common.disable') : $t('common.enable')">
                  <svg v-if="agent.status === 'active'" class="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  <svg v-else class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <!-- Delete -->
                <button @click="confirmDel(agent)" class="btn-ghost btn-sm p-1.5 text-red-400 hover:text-red-300" :title="$t('common.delete')">
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

    <!-- Add / Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-backdrop" @click.self="showModal = false">
        <div class="modal-box max-w-md w-full">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-dark-100">
              {{ editingAgent ? $t('agents.editAgent') : $t('agents.addAgent') }}
            </h3>
            <button @click="showModal = false" class="btn-ghost btn-sm p-1.5">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <form @submit.prevent="saveAgent" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label">{{ $t('auth.username') }}</label>
                <input v-model="form.username" type="text" class="input" required />
              </div>
              <div>
                <label class="label">{{ $t('auth.password') }}</label>
                <input v-model="form.password" type="text" class="input" required />
              </div>
            </div>
            <div>
              <label class="label">{{ $t('common.email') }}</label>
              <input v-model="form.email" type="email" class="input" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label">{{ $t('agents.walletBalance') }} (GB)</label>
                <input v-model.number="form.walletBalance" type="number" min="0" class="input" required />
              </div>
              <div>
                <label class="label">{{ $t('agents.maxClients') }}</label>
                <input v-model.number="form.maxClients" type="number" min="1" class="input" required />
              </div>
            </div>
            <div>
              <label class="label">{{ $t('common.note') }}</label>
              <input v-model="form.note" type="text" class="input" :placeholder="$t('clients.notePlaceholder')" />
            </div>

            <div class="flex gap-3 pt-2">
              <button type="button" @click="showModal = false" class="btn-secondary flex-1">{{ $t('common.cancel') }}</button>
              <button type="submit" class="btn-primary flex-1">
                {{ editingAgent ? $t('common.save') : $t('agents.createAgent') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Top-up Modal -->
    <Teleport to="body">
      <div v-if="showTopUp" class="modal-backdrop" @click.self="showTopUp = false">
        <div class="modal-box max-w-sm w-full">
          <h3 class="text-lg font-semibold text-dark-100 mb-4">{{ $t('agents.topUpTitle') }}</h3>
          <p class="text-sm text-dark-400 mb-4">
            {{ $t('agents.topUpFor') }} <span class="text-dark-200 font-semibold">{{ topUpAgent?.username }}</span>
            · {{ $t('agents.currentBalance') }}: <span class="text-emerald-400 font-bold">{{ topUpAgent?.walletBalance }} GB</span>
          </p>
          <div class="mb-4">
            <label class="label">{{ $t('agents.addGb') }}</label>
            <input v-model.number="topUpAmount" type="number" min="1" class="input" />
          </div>
          <div class="flex gap-3">
            <button @click="showTopUp = false" class="btn-secondary flex-1">{{ $t('common.cancel') }}</button>
            <button @click="doTopUp" class="btn-primary flex-1">{{ $t('agents.topUp') }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirm -->
    <ConfirmModal
      v-if="deletingAgent"
      :title="$t('agents.deleteAgent')"
      :message="$t('agents.deleteConfirm', { name: deletingAgent.username })"
      :confirm-label="$t('common.delete')"
      confirm-class="btn-danger"
      @confirm="doDelete"
      @cancel="deletingAgent = null"
    />
  </div>
</template>

<script setup lang="ts">
import type { Agent } from '~/stores/agents'
definePageMeta({ middleware: 'auth' })

const agentStore = useAgentsStore()
const notif = useNotificationStore()
const { t } = useLocale()
const fmt = useFormat()

// Guard: admin only
const auth = useAuthStore()
if (auth.isAgent) await navigateTo('/agent')

onMounted(() => agentStore.fetchAgents())

// ─── Summary ──────────────────────────────────────────────────────────────
const totalClientsCreated = computed(() =>
  agentStore.agents.reduce((s, a) => s + a.clientsCreated, 0)
)

function walletPercent(agent: Agent) {
  if (!agent.walletBalance) return 0
  return Math.min(100, Math.round((agent.walletUsed / agent.walletBalance) * 100))
}

// ─── Add / Edit ───────────────────────────────────────────────────────────
const showModal = ref(false)
const editingAgent = ref<Agent | null>(null)
const form = reactive({
  username: '',
  password: '',
  email: '',
  walletBalance: 100,
  maxClients: 50,
  note: '',
})

function openAdd() {
  editingAgent.value = null
  Object.assign(form, { username: '', password: '', email: '', walletBalance: 100, maxClients: 50, note: '' })
  showModal.value = true
}

function openEdit(agent: Agent) {
  editingAgent.value = agent
  Object.assign(form, {
    username: agent.username,
    password: agent.password,
    email: agent.email || '',
    walletBalance: agent.walletBalance,
    maxClients: agent.maxClients,
    note: agent.note || '',
  })
  showModal.value = true
}

async function saveAgent() {
  if (editingAgent.value) {
    await agentStore.updateAgent(editingAgent.value.id, { ...form })
    notif.success(t('agents.editAgent'), t('agents.agentUpdated', { name: form.username }))
  } else {
    await agentStore.addAgent({ ...form })
    notif.success(t('agents.addAgent'), t('agents.agentCreated', { name: form.username }))
  }
  showModal.value = false
}

// ─── Top-up ───────────────────────────────────────────────────────────────
const showTopUp = ref(false)
const topUpAgent = ref<Agent | null>(null)
const topUpAmount = ref(100)

function openTopUp(agent: Agent) {
  topUpAgent.value = agent
  topUpAmount.value = 100
  showTopUp.value = true
}

async function doTopUp() {
  if (!topUpAgent.value) return
  await agentStore.topUpWallet(topUpAgent.value.id, topUpAmount.value)
  notif.success(t('agents.topUp'), t('agents.walletUpdated', { name: topUpAgent.value.username, gb: topUpAmount.value }))
  showTopUp.value = false
}

// ─── Delete ───────────────────────────────────────────────────────────────
const deletingAgent = ref<Agent | null>(null)
function confirmDel(agent: Agent) { deletingAgent.value = agent }
async function doDelete() {
  if (!deletingAgent.value) return
  await agentStore.deleteAgent(deletingAgent.value.id)
  notif.success(t('common.delete'), t('agents.agentDeleted', { name: deletingAgent.value.username }))
  deletingAgent.value = null
}
</script>
