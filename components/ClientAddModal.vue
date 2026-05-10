<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal w-full max-w-xl">
      <div class="modal-header">
        <h3 class="font-semibold text-dark-100">{{ $t('clients.addClient') }}</h3>
        <button @click="$emit('close')" class="btn-ghost btn-sm p-1.5">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="modal-body space-y-4 max-h-[75vh] overflow-y-auto">
        <!-- Name -->
        <div>
          <label class="label">{{ $t('clients.clientName') }} <span class="text-red-400">*</span></label>
          <input v-model="form.name" type="text" class="input" :placeholder="$t('clients.clientNamePlaceholder')" required />
        </div>

        <!-- Contact -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="label">{{ $t('common.email') }}</label>
            <input v-model="form.email" type="email" class="input" placeholder="alice@example.com" dir="ltr" />
          </div>
          <div>
            <label class="label">{{ $t('clients.telegram') }}</label>
            <input v-model="form.telegram" type="text" class="input" placeholder="@username" dir="ltr" />
          </div>
        </div>

        <!-- Multi-Protocol -->
        <div>
          <label class="label">
            {{ $t('clients.protocols') }} <span class="text-red-400">*</span>
            <span class="text-xs text-dark-500 font-normal ms-2">{{ $t('clients.protocolsHint') }}</span>
          </label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="p in PROTOCOLS" :key="p.value"
              type="button"
              @click="toggleProtocol(p.value)"
              :class="['px-3 py-2 rounded-lg text-xs font-medium border transition-all flex items-center justify-center gap-1.5',
                form.protocols.includes(p.value)
                  ? 'border-primary-500 bg-primary-600/20 text-primary-300'
                  : 'border-dark-600 bg-dark-800 text-dark-400 hover:border-dark-500']"
            >
              <svg v-if="form.protocols.includes(p.value)" class="w-3 h-3 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
              {{ p.label }}
            </button>
          </div>
          <p v-if="!form.protocols.length" class="text-xs text-red-400 mt-1">{{ $t('clients.protocolRequired') }}</p>
        </div>

        <!-- Data limit + expiry -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">{{ $t('clients.dataLimit') }}</label>
            <div class="flex gap-2">
              <input v-model.number="form.dataLimitGB" type="number" class="input flex-1"
                :placeholder="$t('clients.dataLimitHint')" min="0" />
              <span class="flex items-center text-sm text-dark-400 px-2">GB</span>
            </div>
          </div>
          <div>
            <label class="label">{{ $t('clients.expiryDate') }}</label>
            <input v-model="form.expiresAt" type="date" class="input" dir="ltr" />
          </div>
        </div>

        <!-- Note -->
        <div>
          <label class="label">{{ $t('common.note') }}</label>
          <textarea v-model="form.note" class="input resize-none" rows="2"
            :placeholder="$t('clients.notePlaceholder')" />
        </div>

        <!-- ─── Send Credentials ──────────────────────────────────────── -->
        <div class="border border-dark-700 rounded-xl p-4 space-y-3 bg-dark-800/50">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-dark-200">{{ $t('clients.sendCredentials') }}</p>
            <span class="text-xs text-dark-500">{{ $t('clients.optional') }}</span>
          </div>

          <!-- Email -->
          <div class="flex items-center gap-3">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="form.sendEmail" class="rounded accent-primary-500" />
              <span class="text-sm text-dark-300">{{ $t('clients.sendViaEmail') }}</span>
            </label>
          </div>
          <div v-if="form.sendEmail" class="ps-6">
            <input v-model="form.sendEmailAddr" type="email" class="input"
              :placeholder="form.email || 'recipient@example.com'" dir="ltr" />
            <p class="text-xs text-dark-500 mt-1">{{ $t('clients.emailLeaveBlank') }}</p>
          </div>

          <!-- Telegram -->
          <div class="flex items-center gap-3">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="form.sendTelegram" class="rounded accent-primary-500" />
              <span class="text-sm text-dark-300">{{ $t('clients.sendViaTelegram') }}</span>
            </label>
          </div>
          <div v-if="form.sendTelegram" class="ps-6">
            <input v-model="form.sendTelegramUser" type="text" class="input"
              :placeholder="form.telegram || '@username'" dir="ltr" />
            <p class="text-xs text-dark-500 mt-1">{{ $t('clients.telegramLeaveBlank') }}</p>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="btn-secondary">{{ $t('common.cancel') }}</button>
        <button @click="save" class="btn-primary" :disabled="!form.name || !form.protocols.length || saving">
          <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ $t('clients.createClient') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Protocol } from '~/stores/vpn'

const emit = defineEmits<{ close: []; saved: [client: any] }>()
const vpn = useVpnStore()
const notif = useNotificationStore()
const { t } = useLocale()

const saving = ref(false)

const PROTOCOLS = [
  { value: 'openvpn'     as Protocol, label: 'OpenVPN'     },
  { value: 'wireguard'   as Protocol, label: 'WireGuard'   },
  { value: 'vmess'       as Protocol, label: 'VMess'       },
  { value: 'vless'       as Protocol, label: 'VLESS'       },
  { value: 'trojan'      as Protocol, label: 'Trojan'      },
  { value: 'shadowsocks' as Protocol, label: 'Shadowsocks' },
]

const form = reactive({
  name: '',
  email: '',
  telegram: '',
  protocols: ['openvpn'] as Protocol[],
  dataLimitGB: 0,
  expiresAt: '',
  note: '',
  // send credentials
  sendEmail: false,
  sendEmailAddr: '',
  sendTelegram: false,
  sendTelegramUser: '',
})

function toggleProtocol(p: Protocol) {
  const idx = form.protocols.indexOf(p)
  if (idx === -1) {
    form.protocols.push(p)
  } else {
    if (form.protocols.length === 1) return   // must keep at least one
    form.protocols.splice(idx, 1)
  }
}

async function save() {
  if (!form.protocols.length) return
  saving.value = true

  const newClient = await vpn.addClient({
    name: form.name,
    email: form.email || undefined,
    telegram: form.telegram || undefined,
    protocols: [...form.protocols],
    dataLimit: form.dataLimitGB > 0 ? form.dataLimitGB * 1024 * 1024 * 1024 : null,
    expiresAt: form.expiresAt || null,
    note: form.note,
  })

  // ── Mock: send credentials ──────────────────────────────────────
  if (form.sendEmail) {
    const addr = form.sendEmailAddr || form.email
    if (addr) {
      await new Promise(r => setTimeout(r, 300))   // simulate API call
      notif.success(t('clients.credentialsSent'), t('clients.sentViaEmail', { addr }))
    }
  }
  if (form.sendTelegram) {
    const user = form.sendTelegramUser || form.telegram
    if (user) {
      await new Promise(r => setTimeout(r, 300))
      notif.success(t('clients.credentialsSent'), t('clients.sentViaTelegram', { user }))
    }
  }

  saving.value = false
  emit('saved', newClient)
}
</script>
