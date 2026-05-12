<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal w-full max-w-lg animate-fade-in">
      <!-- Success Header -->
      <div class="text-center pt-8 pb-6 px-6">
        <div class="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <svg class="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 tracking-tight mb-2">{{ $t('clientCreated.title') }}</h3>
        <p class="text-gray-500">{{ $t('clientCreated.subtitle', { name: client.name }) }}</p>
      </div>

      <div class="px-6 pb-6 space-y-5">
        <!-- Subscription Link Card -->
        <div class="bg-gradient-to-r from-primary-50 to-primary-100/30 border border-primary-200 rounded-xl p-4">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-900 mb-1">{{ $t('clientCreated.subscriptionLink') }}</p>
              <p class="text-xs text-gray-500 mb-3">{{ $t('clientCreated.saveThisLink') }}</p>
              
              <div class="flex items-center gap-2">
                <code class="flex-1 bg-white/70 px-3 py-2 rounded-lg text-xs font-mono text-gray-700 break-all">
                  {{ subscriptionUrl }}
                </code>
                <button @click="copySubscriptionLink" class="btn-secondary btn-sm flex-shrink-0 p-2">
                  <svg v-if="!linkCopied" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <svg v-else class="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>

              <div class="flex items-center gap-2 mt-3">
                <a :href="subscriptionUrl" target="_blank" class="btn-primary btn-sm flex-1 justify-center">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  {{ $t('clientCreated.openPage') }}
                </a>
                <button v-if="client.email" @click="sendEmail" :disabled="sendingEmail" class="btn-secondary btn-sm flex-1 justify-center">
                  <svg v-if="!sendingEmail" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {{ sendingEmail ? $t('clientCreated.sending') : $t('clientCreated.emailLink') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Config Downloads -->
        <div>
          <p class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {{ $t('clientCreated.downloadConfigs') }}
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div v-for="protocol in client.protocols" :key="protocol" 
              class="border border-gray-200 rounded-xl overflow-hidden hover:border-primary-300 hover:shadow-sm transition-all">
              <div class="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
                <span :class="fmt.protocolBadgeClass(protocol)">{{ protocol }}</span>
              </div>
              <div class="p-3 space-y-2">
                <button @click="downloadConfig(protocol)" class="btn-primary w-full justify-center btn-sm">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {{ $t('common.download') }}
                </button>
                <button @click="copyConfig(protocol)" class="btn-secondary w-full justify-center btn-sm">
                  <svg v-if="copiedProtocol !== protocol" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <svg v-else class="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {{ copiedProtocol === protocol ? $t('clientCreated.copied') : $t('common.copy') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- QR Code Option -->
        <div v-if="client.protocols.length === 1" class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
            <svg class="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-900">{{ $t('clientCreated.showQRCode') }}</p>
            <p class="text-xs text-gray-500">{{ $t('clientCreated.scanToImport') }}</p>
          </div>
          <button @click="showQR = !showQR" class="btn-secondary btn-sm">
            {{ showQR ? $t('common.hide') : $t('common.show') }}
          </button>
        </div>

        <!-- QR Code Display -->
        <div v-if="showQR && client.protocols.length === 1" class="bg-white border border-gray-200 rounded-xl p-6 text-center">
          <div class="w-48 h-48 bg-gray-100 rounded-xl mx-auto mb-3 flex items-center justify-center">
            <!-- Placeholder QR - in real app would be actual QR code -->
            <div class="text-center">
              <svg class="w-16 h-16 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              <p class="text-xs text-gray-400">{{ $t('clientCreated.qrPlaceholder') }}</p>
            </div>
          </div>
          <p class="text-sm font-medium text-gray-700">{{ client.protocols[0].toUpperCase() }} Config</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer bg-gray-50/50">
        <button @click="$emit('close')" class="btn-secondary">
          {{ $t('common.close') }}
        </button>
        <button @click="$emit('createAnother')" class="btn-primary">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ $t('clientCreated.createAnother') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VpnClient, Protocol } from '~/stores/vpn'

const props = defineProps<{
  client: VpnClient
}>()

const emit = defineEmits<{
  close: []
  createAnother: []
}>()

const fmt = useFormat()
const notif = useNotificationStore()
const { t } = useLocale()
const { copy } = useClipboard()

const linkCopied = ref(false)
const copiedProtocol = ref<Protocol | null>(null)
const sendingEmail = ref(false)
const showQR = ref(false)

const subscriptionUrl = computed(() => {
  if (typeof window === 'undefined') return ''
  const token = props.client.subscriptionToken
  return token ? `${window.location.origin}/sub/${token}` : ''
})

async function copySubscriptionLink() {
  if (!subscriptionUrl.value) return
  await copy(subscriptionUrl.value)
  linkCopied.value = true
  setTimeout(() => linkCopied.value = false, 2000)
  notif.success(t('clientCreated.linkCopied'), t('clientCreated.linkCopiedDesc'))
}

async function copyConfig(protocol: Protocol) {
  const cfg = props.client.configs?.[protocol]
  if (!cfg) return
  await copy(cfg)
  copiedProtocol.value = protocol
  setTimeout(() => copiedProtocol.value = null, 2000)
}

function downloadConfig(protocol: Protocol) {
  const cfg = props.client.configs?.[protocol]
  if (!cfg) return

  const ext = protocol === 'wireguard' ? 'conf' : protocol === 'openvpn' ? 'ovpn' : 'json'
  const blob = new Blob([cfg], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${props.client.name}-${protocol}.${ext}`
  a.click()
  URL.revokeObjectURL(url)

  notif.success(t('clients.configDownloaded'), `${props.client.name} · ${protocol}`)
}

async function sendEmail() {
  if (!props.client.email) return
  sendingEmail.value = true
  // Simulate sending
  await new Promise(r => setTimeout(r, 1500))
  sendingEmail.value = false
  notif.success(t('clientCreated.emailSent'), t('clientCreated.emailSentDesc', { email: props.client.email }))
}
</script>
