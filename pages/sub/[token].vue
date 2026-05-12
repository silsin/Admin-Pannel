<template>
  <div class="min-h-screen bg-slate-50" :dir="isRTL ? 'rtl' : 'ltr'">
    <!-- Elegant Header -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div class="max-w-4xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span class="font-bold text-slate-800 text-lg">{{ $t('auth.title') }}</span>
          </div>
          <div class="flex items-center gap-4">
            <div v-if="client" class="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
              <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span class="text-sm font-medium text-green-700">{{ client.status === 'active' ? 'Active' : client.status }}</span>
            </div>
            <div class="relative">
              <select v-model="currentLocale" @change="changeLocale" 
                class="appearance-none bg-slate-100 hover:bg-slate-200 transition-colors border-0 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer">
                <option value="fa">🇮🇷 فارسی</option>
                <option value="en">🇺🇸 English</option>
              </select>
              <svg class="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-6 py-10">
      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>

      <!-- Error -->
      <div v-else-if="!client" class="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
        <div class="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-slate-900 mb-2">{{ $t('subscription.notFound') }}</h2>
        <p class="text-slate-500">{{ $t('subscription.invalidToken') }}</p>
      </div>

      <!-- Client Subscription Page -->
      <div v-else class="space-y-8">
        <!-- Normal vs Wallet -->
        <div class="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 shadow-sm">
          <div class="inline-flex rounded-xl bg-slate-100 p-1 self-start">
            <button
              type="button"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              :class="viewMode === 'normal' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'"
              @click="viewMode = 'normal'"
            >
              {{ $t('subscription.normalMode') }}
            </button>
            <button
              type="button"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              :class="viewMode === 'wallet' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'"
              @click="viewMode = 'wallet'"
            >
              {{ $t('subscription.walletMode') }}
            </button>
          </div>
          <p class="text-xs text-slate-500 leading-relaxed max-w-xl">{{ $t('subscription.viewModeHint') }}</p>
        </div>

        <!-- Profile Header Card -->
        <div class="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div class="flex items-center gap-5">
              <div class="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <span class="text-3xl font-bold text-white">{{ client.name[0] }}</span>
              </div>
              <div>
                <h2 class="text-3xl font-bold text-slate-900">{{ client.name }}</h2>
                <p class="text-slate-500 mt-1">{{ client.email }}</p>
              </div>
            </div>
            <div class="flex items-center gap-6">
              <div class="text-center md:text-right">
                <p class="text-4xl font-bold text-slate-900">{{ daysLeft }}</p>
                <p class="text-sm text-slate-500">{{ $t('subscription.days') }}</p>
              </div>
              <div v-if="client.expiresAt" class="hidden md:block text-right border-l border-slate-200 pl-6">
                <p class="text-sm text-slate-500">{{ $t('subscription.expires') }}</p>
                <p class="text-lg font-medium text-slate-700">{{ fmt.formatDate(client.expiresAt) }}</p>
              </div>
            </div>
          </div>
          
          <!-- Progress Bar -->
          <div class="mt-8">
            <div class="flex justify-between text-sm mb-2">
              <span class="text-slate-500">{{ $t('subscription.timeLeft') }}</span>
              <span class="text-slate-700 font-medium">{{ daysLeft }} {{ $t('subscription.days') }}</span>
            </div>
            <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div class="h-full bg-indigo-600 rounded-full transition-all duration-500"
                :style="{ width: Math.min(100, (Number(daysLeft) / 30) * 100) + '%' }" />
            </div>
          </div>
        </div>

        <template v-if="viewMode === 'normal'">
        <!-- Stats Grid - Clean Professional Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Data Usage -->
          <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 class="font-semibold text-slate-900">{{ $t('subscription.dataUsage') }}</h3>
            </div>
            
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-sm text-slate-500">{{ $t('subscription.used') }}</span>
                <span class="font-semibold text-slate-900">{{ fmt.formatBytes(client.dataUsed) }}</span>
              </div>
              <div v-if="client.dataLimit" class="flex items-center justify-between">
                <span class="text-sm text-slate-500">{{ $t('subscription.total') }}</span>
                <span class="font-semibold text-slate-900">{{ fmt.formatBytes(client.dataLimit) }}</span>
              </div>
              
              <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-indigo-600 rounded-full transition-all" :style="{ width: dataUsagePercent + '%' }" />
              </div>
              
              <p class="text-xs text-slate-500 text-center">{{ dataUsagePercent }}% {{ $t('subscription.used') }}</p>
              
              <div class="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                <div class="text-center">
                  <p class="text-xs text-slate-400 mb-1">↓ {{ $t('dashboard.downloadLabel') }}</p>
                  <p class="font-semibold text-slate-700">{{ fmt.formatBytes(client.downloadBytes) }}</p>
                </div>
                <div class="text-center">
                  <p class="text-xs text-slate-400 mb-1">↑ {{ $t('dashboard.uploadLabel') }}</p>
                  <p class="font-semibold text-slate-700">{{ fmt.formatBytes(client.uploadBytes) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Protocols -->
          <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3" />
                </svg>
              </div>
              <h3 class="font-semibold text-slate-900">{{ $t('subscription.protocols') }}</h3>
            </div>
            <div class="space-y-2">
              <div v-for="protocol in client.protocols" :key="protocol" 
                class="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span class="text-sm font-medium text-slate-700 uppercase">{{ protocol }}</span>
                <button @click="downloadConfig(protocol)" class="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                  <svg class="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Service Info -->
          <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="font-semibold text-slate-900">{{ $t('subscription.serviceInfo') }}</h3>
            </div>
            <div class="space-y-3">
              <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span class="text-sm text-slate-500">{{ $t('subscription.created') }}</span>
                <span class="text-sm font-medium text-slate-900">{{ fmt.formatDate(client.createdAt) }}</span>
              </div>
              <div v-if="client.expiresAt" class="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span class="text-sm text-slate-500">{{ $t('subscription.expires') }}</span>
                <span class="text-sm font-medium text-slate-900">{{ fmt.formatDate(client.expiresAt) }}</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span class="text-sm text-slate-500">{{ $t('subscription.protocols') }}</span>
                <span class="text-sm font-medium text-slate-900">{{ client.protocols.length }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Subscription Link Section -->
        <div class="bg-slate-900 rounded-2xl p-6">
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-300 mb-1">{{ $t('subscription.yourLink') }}</p>
              <p class="text-xs text-slate-500 mb-3">{{ $t('subscription.saveLink') }}</p>
              <div class="flex items-center gap-2">
                <code class="flex-1 bg-slate-800 px-3 py-2 rounded-lg text-sm text-slate-300 font-mono break-all">
                  {{ subscriptionUrl }}
                </code>
                <button @click="copySubscriptionLink" class="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                  {{ linkCopied ? $t('clients.copied') : $t('subscription.copy') }}
                </button>
              </div>
            </div>
          </div>
        </div>
        </template>

        <!-- Wallet mode: balance + instant configs -->
        <template v-else>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-1 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-6 shadow-sm">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-amber-200">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 class="font-semibold text-slate-900">{{ $t('subscription.walletBalance') }}</h3>
              </div>
              <p class="text-3xl font-bold text-slate-900 tracking-tight">{{ fmt.formatBytes(walletBalance) }}</p>
              <p class="text-sm text-slate-600 mt-4 leading-relaxed">{{ $t('subscription.walletHint') }}</p>
            </div>

            <div class="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
              <h3 class="font-semibold text-slate-900">{{ $t('subscription.walletCreateTitle') }}</h3>
              <div class="grid sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-medium text-slate-500 mb-1.5">{{ $t('common.protocol') }}</label>
                  <select v-model="walletProtocol" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none">
                    <option v-for="p in client.protocols" :key="p" :value="p">{{ p }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-500 mb-1.5">{{ $t('subscription.walletLabel') }}</label>
                  <input
                    v-model="walletLabel"
                    type="text"
                    class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    :placeholder="$t('clients.clientNamePlaceholder')"
                  />
                </div>
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-500 mb-2">{{ $t('subscription.walletReserveGb') }}</label>
                <div class="flex flex-wrap gap-2 mb-3">
                  <span class="text-xs text-slate-400 w-full sm:w-auto">{{ $t('subscription.walletPresets') }}:</span>
                  <button
                    v-for="g in walletPresetGb"
                    :key="g"
                    type="button"
                    class="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
                    :class="Number(walletGb) === g ? 'border-indigo-600 bg-indigo-50 text-indigo-800' : 'border-slate-200 text-slate-600 hover:border-slate-300'"
                    @click="walletGb = g"
                  >
                    {{ g }} GB
                  </button>
                </div>
                <input
                  v-model.number="walletGb"
                  type="number"
                  min="0.01"
                  step="0.1"
                  class="w-full max-w-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>
              <button
                type="button"
                class="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 shadow-md shadow-indigo-200 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                :disabled="!client.walletBalanceBytes"
                @click="submitWalletConfig"
              >
                {{ $t('subscription.walletCreate') }}
              </button>
            </div>
          </div>

          <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div class="flex items-center justify-between gap-3 mb-4">
              <h3 class="font-semibold text-slate-900">{{ $t('subscription.walletConfigsTitle') }}</h3>
              <span class="text-xs font-medium text-slate-500">{{ client.walletConfigs.length }}</span>
            </div>
            <p v-if="client.walletConfigs.length === 0" class="text-sm text-slate-500 py-8 text-center border border-dashed border-slate-200 rounded-xl">
              {{ $t('subscription.walletEmpty') }}
            </p>
            <ul v-else class="space-y-3">
              <li
                v-for="entry in client.walletConfigs"
                :key="entry.id"
                class="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/80 hover:bg-slate-50 transition-colors"
              >
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-slate-900 truncate">{{ entry.label }}</p>
                  <p class="text-xs text-slate-500 mt-1">
                    <span class="uppercase font-semibold text-slate-600">{{ entry.protocol }}</span>
                    · {{ fmt.formatBytes(entry.reservedBytes) }} {{ $t('subscription.walletReservedInline') }}
                    · {{ fmt.formatDate(entry.createdAt) }}
                  </p>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    class="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                    :title="$t('common.download')"
                    @click="downloadWalletConfig(entry)"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                    :title="$t('subscription.copy')"
                    @click="copyWalletConfig(entry)"
                  >
                    <span v-if="copiedWalletId === entry.id" class="text-xs text-green-600 px-1">{{ $t('clients.copied') }}</span>
                    <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="p-2 rounded-lg bg-white border border-red-200 text-red-600 hover:bg-red-50"
                    :title="$t('common.delete')"
                    @click="removeWalletEntry(entry.id)"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </li>
            </ul>
          </div>

          <div class="bg-slate-900 rounded-2xl p-6">
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-300 mb-1">{{ $t('subscription.yourLink') }}</p>
                <p class="text-xs text-slate-500 mb-3">{{ $t('subscription.saveLink') }}</p>
                <div class="flex items-center gap-2">
                  <code class="flex-1 bg-slate-800 px-3 py-2 rounded-lg text-sm text-slate-300 font-mono break-all">
                    {{ subscriptionUrl }}
                  </code>
                  <button type="button" class="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors" @click="copySubscriptionLink">
                    {{ linkCopied ? $t('clients.copied') : $t('subscription.copy') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { VpnClient, Protocol, WalletConfigEntry } from '~/stores/vpn'

// Use standalone layout (no admin menu)
definePageMeta({
  layout: 'subscription'
})

const route = useRoute()
const fmt = useFormat()
const { isRTL, locale } = useLocale()
const { t } = useI18n()
const notif = useNotificationStore()
const { copy } = useClipboard()

// Language handling - default to Farsi for subscription page
const currentLocale = ref(locale.value || 'fa')

function changeLocale() {
  locale.value = currentLocale.value
  localStorage.setItem('vpn-locale', currentLocale.value)
}

const token = computed(() => route.params.token as string)
const loading = ref(true)
const client = ref<VpnClient | null>(null)
const linkCopied = ref(false)

const viewMode = ref<'normal' | 'wallet'>('normal')
const walletPresetGb = [1, 5, 10] as const
const walletProtocol = ref<Protocol>('openvpn')
const walletLabel = ref('')
const walletGb = ref(1)
const copiedWalletId = ref<string | null>(null)

const walletBalance = computed(() => client.value?.walletBalanceBytes ?? 0)

function ensureClientWalletFields(c: VpnClient) {
  const GB = 1024 * 1024 * 1024
  if (typeof c.walletBalanceBytes !== 'number' || !Array.isArray(c.walletConfigs)) {
    const limit = c.dataLimit
    c.walletBalanceBytes = limit != null ? Math.max(0, limit - c.dataUsed) : 50 * GB
    c.walletConfigs = []
  }
}

const subscriptionUrl = computed(() => {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}/sub/${token.value}`
})

const daysLeft = computed(() => {
  if (!client.value?.expiresAt) return '∞'
  const expires = new Date(client.value.expiresAt).getTime()
  const now = Date.now()
  const diff = Math.ceil((expires - now) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
})

const dataUsagePercent = computed(() => {
  if (!client.value) return 0
  if (!client.value.dataLimit) return 0
  return Math.min(100, Math.round((client.value.dataUsed / client.value.dataLimit) * 100))
})

onMounted(async () => {
  // Set Farsi as default language if no preference saved
  const saved = localStorage.getItem('vpn-locale')
  if (!saved) {
    currentLocale.value = 'fa'
    locale.value = 'fa'
    localStorage.setItem('vpn-locale', 'fa')
  }
  
  // In real app, this would be an API call
  await new Promise(r => setTimeout(r, 500))
  
  // Try to find client in store first
  const vpn = useVpnStore()
  if (vpn.clients.length === 0) {
    await vpn.fetchClients()
  }
  
  // Find client by token
  let found = vpn.getClientBySubscriptionToken(token.value)
  
  // DEMO MODE: If token is "demo" or no client found, use first available client for testing
  if (!found && (token.value === 'demo' || vpn.clients.length > 0)) {
    found = vpn.clients[0]
    // Assign the requested token to this client for demo
    found.subscriptionToken = token.value
  }
  
  client.value = found || null
  if (client.value) {
    ensureClientWalletFields(client.value)
    walletProtocol.value = client.value.protocols[0] ?? 'openvpn'
  }
  loading.value = false
})

function submitWalletConfig() {
  if (!client.value) return
  const gb = Number(walletGb.value)
  if (!Number.isFinite(gb) || gb <= 0) {
    notif.error(t('subscription.walletInvalidAmount'))
    return
  }
  const reservedBytes = Math.round(gb * 1024 * 1024 * 1024)
  const vpn = useVpnStore()
  const label = walletLabel.value.trim()
  const result = vpn.createWalletConfig(
    client.value.id,
    walletProtocol.value,
    reservedBytes,
    label || undefined,
  )
  if (!result.ok) {
    if (result.reason === 'insufficient') notif.error(t('subscription.walletInsufficient'))
    else notif.error(t('subscription.walletInvalidAmount'))
    return
  }
  notif.success(t('subscription.walletCreated'))
  walletLabel.value = ''
}

function downloadWalletConfig(entry: WalletConfigEntry) {
  if (!client.value) return
  const blob = new Blob([entry.config], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const ext = entry.protocol === 'wireguard' ? 'conf' : entry.protocol === 'openvpn' ? 'ovpn' : 'json'
  a.download = `${client.value.name}-${entry.label}-${entry.protocol}.${ext}`
  a.click()
  URL.revokeObjectURL(url)
}

async function copyWalletConfig(entry: WalletConfigEntry) {
  await copy(entry.config)
  copiedWalletId.value = entry.id
  setTimeout(() => { copiedWalletId.value = null }, 2000)
}

function removeWalletEntry(entryId: string) {
  if (!client.value) return
  const vpn = useVpnStore()
  if (vpn.removeWalletConfig(client.value.id, entryId)) {
    notif.success(t('subscription.walletRemoved'))
  }
}

function downloadConfig(protocol: Protocol) {
  if (!client.value?.configs?.[protocol]) return
  
  const cfg = client.value.configs[protocol]
  const blob = new Blob([cfg!], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  
  const ext = protocol === 'wireguard' ? 'conf' : protocol === 'openvpn' ? 'ovpn' : 'json'
  a.download = `${client.value.name}-${protocol}.${ext}`
  a.click()
  URL.revokeObjectURL(url)
}

async function copySubscriptionLink() {
  await copy(subscriptionUrl.value)
  linkCopied.value = true
  setTimeout(() => linkCopied.value = false, 2000)
}
</script>
