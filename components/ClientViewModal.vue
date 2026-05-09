<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal w-full max-w-2xl">
      <div class="modal-header">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-primary-600/20 flex items-center justify-center text-sm font-bold text-primary-400">
            {{ client.name[0] }}
          </div>
          <div>
            <h3 class="font-semibold text-dark-100">{{ client.name }}</h3>
            <p class="text-xs text-dark-500" dir="ltr">{{ client.email }}</p>
          </div>
        </div>
        <button @click="$emit('close')" class="btn-ghost btn-sm p-1.5">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="modal-body space-y-5 max-h-[75vh] overflow-y-auto">
        <!-- Badges -->
        <div class="flex flex-wrap gap-2">
          <span :class="fmt.statusBadgeClass(client.status)">{{ client.status }}</span>
          <span :class="fmt.protocolBadgeClass(client.protocol)">{{ client.protocol }}</span>
          <span v-if="client.connectedSince" class="badge-green">
            {{ $t('clients.connectedFor', { duration: fmt.formatDuration(client.connectedSince) }) }}
          </span>
        </div>

        <!-- Info grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <p class="text-xs text-dark-500 mb-0.5">{{ $t('clients.ipAddress') }}</p>
            <p class="text-sm text-dark-200 font-mono" dir="ltr">{{ client.ipAddress || '—' }}</p>
          </div>
          <div>
            <p class="text-xs text-dark-500 mb-0.5">UUID</p>
            <p class="text-sm text-dark-200 font-mono" dir="ltr">{{ client.uuid ? client.uuid.slice(0, 8) + '...' : '—' }}</p>
          </div>
          <div>
            <p class="text-xs text-dark-500 mb-0.5">{{ $t('common.created') }}</p>
            <p class="text-sm text-dark-200">{{ fmt.formatDate(client.createdAt) }}</p>
          </div>
          <div>
            <p class="text-xs text-dark-500 mb-0.5">{{ $t('common.lastSeen') }}</p>
            <p class="text-sm text-dark-200">{{ fmt.formatRelative(client.lastSeen) }}</p>
          </div>
          <div>
            <p class="text-xs text-dark-500 mb-0.5">{{ $t('common.expires') }}</p>
            <p class="text-sm text-dark-200">{{ fmt.formatDate(client.expiresAt) }}</p>
          </div>
          <div>
            <p class="text-xs text-dark-500 mb-0.5">{{ $t('clients.dataUsed') }}</p>
            <p class="text-sm text-dark-200">{{ fmt.formatBytes(client.dataUsed) }}</p>
          </div>
        </div>

        <!-- Traffic -->
        <div>
          <p class="label">{{ $t('clients.traffic') }}</p>
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-dark-800 rounded-lg p-3">
              <p class="text-xs text-dark-500 mb-1">↓ {{ $t('dashboard.downloadLabel') }}</p>
              <p class="text-sm font-semibold text-emerald-400">{{ fmt.formatBytes(client.downloadBytes) }}</p>
            </div>
            <div class="bg-dark-800 rounded-lg p-3">
              <p class="text-xs text-dark-500 mb-1">↑ {{ $t('dashboard.uploadLabel') }}</p>
              <p class="text-sm font-semibold text-blue-400">{{ fmt.formatBytes(client.uploadBytes) }}</p>
            </div>
          </div>
          <div v-if="client.dataLimit" class="mt-2">
            <div class="flex justify-between text-xs text-dark-500 mb-1">
              <span>{{ $t('clients.dataLimitLabel') }}</span>
              <span>{{ fmt.percentOf(client.dataUsed, client.dataLimit) }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill bg-primary-500"
                :style="{ width: fmt.percentOf(client.dataUsed, client.dataLimit) + '%' }" />
            </div>
            <p class="text-xs text-dark-500 mt-1">
              {{ fmt.formatBytes(client.dataUsed) }} / {{ fmt.formatBytes(client.dataLimit) }}
            </p>
          </div>
        </div>

        <!-- Config -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <p class="label mb-0">{{ $t('clients.configuration') }}</p>
            <button @click="copyConfig" class="btn-ghost btn-sm text-xs gap-1">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {{ copied ? $t('clients.copied') : $t('clients.copyConfig') }}
            </button>
          </div>
          <pre class="code-block text-xs overflow-x-auto max-h-48">{{ client.config }}</pre>
        </div>

        <div v-if="client.note">
          <p class="label">{{ $t('common.note') }}</p>
          <p class="text-sm text-dark-300">{{ client.note }}</p>
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
import type { VpnClient } from '~/stores/vpn'

const props = defineProps<{ client: VpnClient }>()
defineEmits<{ close: [] }>()

const vpn = useVpnStore()
const fmt = useFormat()
const { copy, copied } = useClipboard()

async function copyConfig() {
  if (props.client.config) await copy(props.client.config)
}
</script>
