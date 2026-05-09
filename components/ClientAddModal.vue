<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal w-full max-w-lg">
      <div class="modal-header">
        <h3 class="font-semibold text-dark-100">{{ $t('clients.addClient') }}</h3>
        <button @click="$emit('close')" class="btn-ghost btn-sm p-1.5">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="modal-body space-y-4 max-h-[70vh] overflow-y-auto">
        <div>
          <label class="label">{{ $t('clients.clientName') }} <span class="text-red-400">*</span></label>
          <input v-model="form.name" type="text" class="input" :placeholder="$t('clients.clientNamePlaceholder')" required />
        </div>

        <div>
          <label class="label">{{ $t('common.email') }}</label>
          <input v-model="form.email" type="email" class="input" placeholder="alice@example.com" dir="ltr" />
        </div>

        <div>
          <label class="label">{{ $t('common.protocol') }} <span class="text-red-400">*</span></label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="p in protocols" :key="p.value"
              type="button"
              @click="form.protocol = p.value"
              :class="['px-3 py-2 rounded-lg text-xs font-medium border transition-all',
                form.protocol === p.value
                  ? 'border-primary-500 bg-primary-600/20 text-primary-300'
                  : 'border-dark-600 bg-dark-800 text-dark-400 hover:border-dark-500']"
            >
              {{ p.label }}
            </button>
          </div>
        </div>

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

        <div>
          <label class="label">{{ $t('common.note') }}</label>
          <textarea v-model="form.note" class="input resize-none" rows="2"
            :placeholder="$t('clients.notePlaceholder')" />
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="btn-secondary">{{ $t('common.cancel') }}</button>
        <button @click="save" class="btn-primary" :disabled="!form.name || saving">
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
const emit = defineEmits<{ close: []; saved: [] }>()
const vpn = useVpnStore()

const saving = ref(false)
const form = reactive({
  name: '', email: '', protocol: 'openvpn' as any,
  dataLimitGB: 0, expiresAt: '', note: '',
})

const protocols = [
  { value: 'openvpn',     label: 'OpenVPN' },
  { value: 'wireguard',   label: 'WireGuard' },
  { value: 'vmess',       label: 'VMess' },
  { value: 'vless',       label: 'VLESS' },
  { value: 'trojan',      label: 'Trojan' },
  { value: 'shadowsocks', label: 'Shadowsocks' },
]

async function save() {
  saving.value = true
  await vpn.addClient({
    name: form.name,
    email: form.email,
    protocol: form.protocol,
    dataLimit: form.dataLimitGB > 0 ? form.dataLimitGB * 1024 * 1024 * 1024 : null,
    expiresAt: form.expiresAt || null,
    note: form.note,
  })
  saving.value = false
  emit('saved')
}
</script>
