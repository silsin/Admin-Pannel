<template>
  <div class="space-y-5 animate-fade-in">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="section-title">{{ $t('inbounds.title') }}</h2>
        <p class="section-subtitle">{{ $t('inbounds.subtitle') }}</p>
      </div>
      <button @click="showAdd = true" class="btn-primary btn-sm">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        {{ $t('inbounds.addInbound') }}
      </button>
    </div>

    <div class="space-y-3">
      <div v-for="rule in inbounds" :key="rule.id" class="card hover:border-dark-600 transition-colors">
        <div class="flex items-start gap-4">
          <div :class="['w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
            rule.enabled ? 'bg-emerald-500/20' : 'bg-dark-700']">
            <svg class="w-5 h-5" :class="rule.enabled ? 'text-emerald-400' : 'text-dark-500'"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
            </svg>
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap mb-2">
              <h3 class="font-semibold text-dark-100">{{ rule.tag }}</h3>
              <span :class="fmt.protocolBadgeClass(rule.protocol)">{{ rule.protocol }}</span>
              <span :class="rule.enabled ? 'badge-green' : 'badge-gray'">
                {{ rule.enabled ? $t('common.enable') : $t('common.disable') }}
              </span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <p class="text-dark-500 mb-0.5">Listen</p>
                <p class="font-mono text-dark-300" dir="ltr">{{ rule.listen }}:{{ rule.port }}</p>
              </div>
              <div>
                <p class="text-dark-500 mb-0.5">{{ $t('inbounds.network') }}</p>
                <p class="text-dark-300">{{ rule.network }}</p>
              </div>
              <div>
                <p class="text-dark-500 mb-0.5">{{ $t('inbounds.tls') }}</p>
                <p class="text-dark-300">{{ rule.tls ? $t('inbounds.tls') : $t('inbounds.tlsNone') }}</p>
              </div>
              <div>
                <p class="text-dark-500 mb-0.5">{{ $t('servers.clients') }}</p>
                <p class="text-dark-300">{{ rule.clients }}</p>
              </div>
            </div>

            <div v-if="rule.remark" class="mt-2 text-xs text-dark-500">{{ rule.remark }}</div>
          </div>

          <div class="flex items-center gap-2 flex-shrink-0">
            <button @click="rule.enabled = !rule.enabled"
              :class="rule.enabled ? 'btn-secondary' : 'btn-success'" class="btn-sm">
              {{ rule.enabled ? $t('common.disable') : $t('common.enable') }}
            </button>
            <button @click="notif.info($t('common.edit'), $t('inbounds.editComingSoon'))" class="btn-ghost btn-sm p-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button @click="deleteRule(rule.id)" class="btn-ghost btn-sm p-2 text-red-400">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Modal -->
    <div v-if="showAdd" class="modal-overlay" @click.self="showAdd = false">
      <div class="modal w-full max-w-2xl">
        <div class="modal-header">
          <h3 class="font-semibold text-dark-100">{{ $t('inbounds.addInbound') }}</h3>
          <button @click="showAdd = false" class="btn-ghost btn-sm p-1.5">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="modal-body space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">{{ $t('inbounds.tagName') }}</label>
              <input v-model="newRule.tag" type="text" class="input" :placeholder="$t('inbounds.tagPlaceholder')" />
            </div>
            <div>
              <label class="label">{{ $t('common.protocol') }}</label>
              <select v-model="newRule.protocol" class="input">
                <option value="vmess">VMess</option>
                <option value="vless">VLESS</option>
                <option value="trojan">Trojan</option>
                <option value="shadowsocks">Shadowsocks</option>
                <option value="openvpn">OpenVPN</option>
                <option value="wireguard">WireGuard</option>
              </select>
            </div>
            <div>
              <label class="label">{{ $t('inbounds.listenAddress') }}</label>
              <input v-model="newRule.listen" type="text" class="input" dir="ltr" placeholder="0.0.0.0" />
            </div>
            <div>
              <label class="label">{{ $t('inbounds.port') }}</label>
              <input v-model.number="newRule.port" type="number" class="input" placeholder="10086" />
            </div>
            <div>
              <label class="label">{{ $t('inbounds.network') }}</label>
              <select v-model="newRule.network" class="input">
                <option value="tcp">TCP</option>
                <option value="udp">UDP</option>
                <option value="tcp,udp">TCP + UDP</option>
                <option value="ws">WebSocket</option>
                <option value="grpc">gRPC</option>
              </select>
            </div>
            <div>
              <label class="label">{{ $t('inbounds.tls') }}</label>
              <select v-model="newRule.tls" class="input">
                <option :value="false">{{ $t('inbounds.tlsNone') }}</option>
                <option :value="true">TLS</option>
              </select>
            </div>
          </div>
          <div>
            <label class="label">{{ $t('inbounds.remark') }}</label>
            <input v-model="newRule.remark" type="text" class="input" :placeholder="$t('inbounds.remarkPlaceholder')" />
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showAdd = false" class="btn-secondary">{{ $t('common.cancel') }}</button>
          <button @click="addRule" class="btn-primary">{{ $t('inbounds.addInbound') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const fmt = useFormat()
const notif = useNotificationStore()
const { t } = useLocale()
const showAdd = ref(false)

const newRule = reactive({
  tag: '', protocol: 'vmess', listen: '0.0.0.0',
  port: 10086, network: 'tcp', tls: false, remark: '',
})

const inbounds = ref([
  { id: '1', tag: 'vmess-ws-tls',  protocol: 'vmess',       listen: '0.0.0.0', port: 443,  network: 'ws',     tls: true,  enabled: true,  clients: 8, remark: 'Main VMess entry' },
  { id: '2', tag: 'vless-reality', protocol: 'vless',       listen: '0.0.0.0', port: 443,  network: 'tcp',    tls: true,  enabled: true,  clients: 4, remark: 'VLESS with Reality' },
  { id: '3', tag: 'trojan-tcp',    protocol: 'trojan',      listen: '0.0.0.0', port: 8443, network: 'tcp',    tls: true,  enabled: true,  clients: 2, remark: '' },
  { id: '4', tag: 'ss-aes256',     protocol: 'shadowsocks', listen: '0.0.0.0', port: 8388, network: 'tcp,udp',tls: false, enabled: false, clients: 0, remark: 'Shadowsocks AES-256' },
])

function addRule() {
  inbounds.value.push({ id: crypto.randomUUID(), ...newRule, enabled: true, clients: 0 })
  showAdd.value = false
  notif.success(t('inbounds.addInbound'), t('inbounds.added', { tag: newRule.tag }))
  Object.assign(newRule, { tag: '', protocol: 'vmess', listen: '0.0.0.0', port: 10086, network: 'tcp', tls: false, remark: '' })
}

function deleteRule(id: string) {
  inbounds.value = inbounds.value.filter(r => r.id !== id)
  notif.success(t('inbounds.deleted'))
}
</script>
