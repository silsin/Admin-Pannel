<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal w-full max-w-2xl">
      <div class="modal-header">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-600">
            {{ client.name[0] }}
          </div>
          <div>
            <h3 class="font-semibold text-gray-900">{{ client.name }}</h3>
            <p class="text-xs text-gray-500" dir="ltr">{{ client.email }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <!-- Send Credentials button -->
          <button @click="showSend = !showSend"
            class="btn-secondary btn-sm gap-1.5 text-xs"
            :class="showSend ? 'bg-primary-50 border-primary-300 text-primary-700' : ''">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            {{ $t('clients.sendCredentials') }}
          </button>
          <button @click="$emit('close')" class="btn-ghost btn-sm p-1.5">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div class="modal-body space-y-5 max-h-[78vh] overflow-y-auto">

        <!-- Send Credentials Panel (collapsible) -->
        <Transition name="slide-down">
          <div v-if="showSend" class="border border-primary-200 bg-primary-50/50 rounded-xl p-4 space-y-3">
            <p class="text-sm font-semibold text-primary-700">{{ $t('clients.sendCredentials') }}</p>

            <!-- Email -->
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <input type="checkbox" v-model="send.email" id="sv-email" class="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <label for="sv-email" class="text-sm text-gray-700 cursor-pointer">{{ $t('clients.sendViaEmail') }}</label>
              </div>
              <div v-if="send.email" class="ps-5">
                <input v-model="send.emailAddr" type="email" class="input"
                  :placeholder="client.email || 'recipient@example.com'" dir="ltr" />
              </div>
            </div>

            <!-- Telegram -->
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <input type="checkbox" v-model="send.telegram" id="sv-tg" class="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <label for="sv-tg" class="text-sm text-gray-700 cursor-pointer">{{ $t('clients.sendViaTelegram') }}</label>
              </div>
              <div v-if="send.telegram" class="ps-5">
                <input v-model="send.telegramUser" type="text" class="input"
                  :placeholder="client.telegram || '@username'" dir="ltr" />
              </div>
            </div>

            <!-- Which protocols to include -->
            <div>
              <p class="text-xs text-gray-500 mb-2">{{ $t('clients.includeProtocols') }}</p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="p in client.protocols" :key="p"
                  type="button"
                  @click="toggleSendProtocol(p)"
                  :class="['px-2.5 py-1 rounded-md text-xs font-medium border transition-all',
                    send.protocols.includes(p)
                      ? 'border-primary-500 bg-primary-100 text-primary-700 shadow-sm'
                      : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50']"
                >{{ p }}</button>
              </div>
            </div>

            <button @click="doSend" :disabled="sending || (!send.email && !send.telegram)"
              class="btn-primary btn-sm w-full justify-center disabled:opacity-50">
              <svg v-if="sending" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {{ sending ? $t('clients.sending') : $t('clients.sendNow') }}
            </button>
          </div>
        </Transition>

        <!-- Badges -->
        <div class="flex flex-wrap gap-2">
          <span :class="fmt.statusBadgeClass(client.status)">{{ client.status }}</span>
          <span v-for="p in client.protocols" :key="p" :class="fmt.protocolBadgeClass(p)">{{ p }}</span>
          <span v-if="client.connectedSince" class="badge-green">
            {{ $t('clients.connectedFor', { duration: fmt.formatDuration(client.connectedSince) }) }}
          </span>
          <span v-if="client.telegram" class="badge-blue flex items-center gap-1">
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.038 9.598c-.15.669-.543.832-1.098.517l-3.04-2.24-1.468 1.41c-.162.162-.298.298-.612.298l.218-3.094 5.638-5.09c.245-.218-.053-.339-.381-.12l-6.968 4.388-3.002-.938c-.652-.204-.666-.652.136-.965l11.71-4.514c.544-.198 1.02.133.905.75z"/>
            </svg>
            {{ client.telegram }}
          </span>
        </div>

        <!-- Info grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <p class="text-xs text-gray-500 mb-0.5">{{ $t('clients.ipAddress') }}</p>
            <p class="text-sm text-gray-800 font-mono" dir="ltr">{{ client.ipAddress || '—' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-0.5">UUID</p>
            <p class="text-sm text-gray-800 font-mono" dir="ltr">{{ client.uuid ? client.uuid.slice(0, 8) + '...' : '—' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-0.5">{{ $t('common.created') }}</p>
            <p class="text-sm text-gray-800">{{ fmt.formatDate(client.createdAt) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-0.5">{{ $t('common.lastSeen') }}</p>
            <p class="text-sm text-gray-800">{{ fmt.formatRelative(client.lastSeen) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-0.5">{{ $t('common.expires') }}</p>
            <p class="text-sm text-gray-800">{{ fmt.formatDate(client.expiresAt) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-0.5">{{ $t('clients.dataUsed') }}</p>
            <p class="text-sm text-gray-800">{{ fmt.formatBytes(client.dataUsed) }}</p>
          </div>
        </div>

        <!-- Traffic -->
        <div>
          <p class="label">{{ $t('clients.traffic') }}</p>
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
              <p class="text-xs text-emerald-600 mb-1">↓ {{ $t('dashboard.downloadLabel') }}</p>
              <p class="text-sm font-semibold text-emerald-700">{{ fmt.formatBytes(client.downloadBytes) }}</p>
            </div>
            <div class="bg-blue-50 border border-blue-100 rounded-lg p-3">
              <p class="text-xs text-blue-600 mb-1">↑ {{ $t('dashboard.uploadLabel') }}</p>
              <p class="text-sm font-semibold text-blue-700">{{ fmt.formatBytes(client.uploadBytes) }}</p>
            </div>
          </div>
          <div v-if="client.dataLimit" class="mt-2">
            <div class="flex justify-between text-xs text-gray-500 mb-1">
              <span>{{ $t('clients.dataLimitLabel') }}</span>
              <span>{{ fmt.percentOf(client.dataUsed, client.dataLimit) }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill bg-primary-500"
                :style="{ width: fmt.percentOf(client.dataUsed, client.dataLimit) + '%' }" />
            </div>
            <p class="text-xs text-gray-500 mt-1">
              {{ fmt.formatBytes(client.dataUsed) }} / {{ fmt.formatBytes(client.dataLimit) }}
            </p>
          </div>
        </div>

        <!-- ─── Per-Protocol Configs ──────────────────────────────────── -->
        <div>
          <p class="label mb-3">{{ $t('clients.configurations') }}</p>
          <div class="space-y-3">
            <div v-for="p in client.protocols" :key="p"
              class="border border-gray-200 rounded-xl overflow-hidden bg-white">
              <!-- Protocol header -->
              <div class="flex items-center justify-between px-4 py-2.5 bg-gray-50 cursor-pointer border-b border-gray-100"
                @click="toggleConfigExpand(p)">
                <div class="flex items-center gap-2">
                  <span :class="fmt.protocolBadgeClass(p)">{{ p }}</span>
                  <span class="text-xs text-gray-500">{{ configLineCount(p) }} lines</span>
                </div>
                <div class="flex items-center gap-1">
                  <!-- Copy -->
                  <button @click.stop="copyConfig(p)" class="btn-ghost btn-sm p-1.5 text-xs gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {{ copiedProtocol === p ? $t('clients.copied') : $t('clients.copyConfig') }}
                  </button>
                  <!-- Download -->
                  <button @click.stop="downloadConfig(p)" class="btn-ghost btn-sm p-1.5 text-xs gap-1 text-emerald-600 hover:text-emerald-700">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {{ $t('clients.download') }}
                  </button>
                  <!-- Expand chevron -->
                  <svg class="w-4 h-4 text-gray-400 transition-transform duration-200"
                    :class="expandedProtocols.includes(p) ? 'rotate-180' : ''"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <!-- Config content -->
              <Transition name="expand">
                <pre v-if="expandedProtocols.includes(p)"
                  class="code-block text-xs overflow-x-auto max-h-48 rounded-none border-0 border-t border-gray-200">{{ client.configs[p] }}</pre>
              </Transition>
            </div>
          </div>
        </div>

        <div v-if="client.note">
          <p class="label">{{ $t('common.note') }}</p>
          <p class="text-sm text-gray-600">{{ client.note }}</p>
        </div>

        <!-- ─── Subscription Link ─────────────────────────────────────── -->
        <div class="border border-primary-200 rounded-xl p-4 space-y-3 bg-gradient-to-r from-primary-50 to-primary-50/30">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-sm font-semibold text-gray-900 mb-1">{{ $t('clients.subscriptionLink') }}</p>
              <p class="text-xs text-gray-500 mb-3">{{ $t('clients.subscriptionLinkDesc') }}</p>
              <div class="flex items-center gap-2">
                <code class="flex-1 bg-white/80 px-3 py-2 rounded-lg text-xs font-mono text-gray-700 break-all">
                  {{ subscriptionUrl }}
                </code>
                <button @click="copySubscriptionLink" class="btn-secondary btn-sm flex-shrink-0">
                  <svg v-if="!linkCopied" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span v-else class="text-emerald-600 text-xs font-medium">{{ $t('clients.copied') }}</span>
                </button>
                <a :href="subscriptionUrl" target="_blank" class="btn-primary btn-sm flex-shrink-0">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  {{ $t('clients.open') }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="vpn.resetClientTraffic(client.id)" class="btn-secondary btn-sm">
          {{ $t('clients.resetTraffic') }}
        </button>
        <button @click="$emit('close')" class="btn-primary">{{ $t('common.close') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VpnClient, Protocol } from '~/stores/vpn'

const props = defineProps<{ client: VpnClient }>()
defineEmits<{ close: [] }>()

const vpn = useVpnStore()
const fmt = useFormat()
const notif = useNotificationStore()
const { t } = useLocale()
const { copy } = useClipboard()

// ─── Config expand state ───────────────────────────────────────────────────
const expandedProtocols = ref<Protocol[]>(props.client.protocols.slice(0, 1))
function toggleConfigExpand(p: Protocol) {
  const idx = expandedProtocols.value.indexOf(p)
  if (idx === -1) expandedProtocols.value.push(p)
  else expandedProtocols.value.splice(idx, 1)
}

function configLineCount(p: Protocol) {
  return props.client.configs[p]?.split('\n').length ?? 0
}

// ─── Copy / Download ───────────────────────────────────────────────────────
const copiedProtocol = ref<Protocol | null>(null)
const linkCopied = ref(false)

const subscriptionUrl = computed(() => {
  if (typeof window === 'undefined') return ''
  const token = props.client.subscriptionToken
  return token ? `${window.location.origin}/sub/${token}` : ''
})

async function copySubscriptionLink() {
  if (!subscriptionUrl.value) return
  await copy(subscriptionUrl.value)
  linkCopied.value = true
  setTimeout(() => { linkCopied.value = false }, 2000)
}

async function copyConfig(p: Protocol) {
  const cfg = props.client.configs[p]
  if (!cfg) return
  await copy(cfg)
  copiedProtocol.value = p
  setTimeout(() => { copiedProtocol.value = null }, 2000)
}

function downloadConfig(p: Protocol) {
  const cfg = props.client.configs[p]
  if (!cfg) return
  const ext = p === 'wireguard' ? 'conf'
    : p === 'openvpn' ? 'ovpn'
    : ['vmess', 'vless', 'trojan', 'shadowsocks'].includes(p) ? 'json'
    : 'txt'
  const blob = new Blob([cfg], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${props.client.name}-${p}.${ext}`
  a.click()
  URL.revokeObjectURL(url)
  notif.success(t('clients.configDownloaded'), `${props.client.name} · ${p}.${ext}`)
}

// ─── Send Credentials ─────────────────────────────────────────────────────
const showSend = ref(false)
const sending = ref(false)
const send = reactive({
  email: false,
  emailAddr: '',
  telegram: false,
  telegramUser: '',
  protocols: [...props.client.protocols] as Protocol[],
})

function toggleSendProtocol(p: Protocol) {
  const idx = send.protocols.indexOf(p)
  if (idx === -1) send.protocols.push(p)
  else if (send.protocols.length > 1) send.protocols.splice(idx, 1)
}

async function doSend() {
  sending.value = true
  await new Promise(r => setTimeout(r, 600))

  if (send.email) {
    const addr = send.emailAddr || props.client.email
    if (addr) notif.success(t('clients.credentialsSent'), t('clients.sentViaEmail', { addr }))
    else notif.error(t('common.error'), t('clients.noEmailAddress'))
  }
  if (send.telegram) {
    const user = send.telegramUser || props.client.telegram
    if (user) notif.success(t('clients.credentialsSent'), t('clients.sentViaTelegram', { user }))
    else notif.error(t('common.error'), t('clients.noTelegram'))
  }

  sending.value = false
  showSend.value = false
}
</script>

<style scoped>
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.25s ease; overflow: hidden; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; max-height: 0; }
.slide-down-enter-to, .slide-down-leave-from { opacity: 1; max-height: 600px; }

.expand-enter-active, .expand-leave-active { transition: all 0.2s ease; overflow: hidden; }
.expand-enter-from, .expand-leave-to { opacity: 0; max-height: 0; }
.expand-enter-to, .expand-leave-from { opacity: 1; max-height: 300px; }
</style>
