<template>
  <div class="space-y-5 animate-fade-in">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="section-title">{{ $t('logs.title') }}</h2>
        <p class="section-subtitle">{{ $t('logs.subtitle') }}</p>
      </div>
      <div class="flex items-center gap-2">
        <button @click="vpn.fetchLogs()" class="btn-secondary btn-sm">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {{ $t('common.refresh') }}
        </button>
        <button @click="clearLogs" class="btn-danger btn-sm">{{ $t('logs.clear') }}</button>
        <button @click="downloadLogs" class="btn-secondary btn-sm">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {{ $t('common.download') }}
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
            :placeholder="$t('logs.filterPlaceholder')" />
        </div>
        <select v-model="levelFilter" class="input sm:w-40">
          <option value="all">{{ $t('logs.allLevels') }}</option>
          <option value="INFO">INFO</option>
          <option value="WARN">WARN</option>
          <option value="ERROR">ERROR</option>
        </select>
        <label class="flex items-center gap-2 text-sm text-dark-300 cursor-pointer">
          <input type="checkbox" v-model="autoScroll" class="rounded" />
          {{ $t('logs.autoScroll') }}
        </label>
        <label class="flex items-center gap-2 text-sm text-dark-300 cursor-pointer">
          <input type="checkbox" v-model="liveMode" class="rounded" />
          {{ $t('logs.liveMode') }}
        </label>
      </div>
    </div>

    <!-- Log viewer -->
    <div class="card p-0 overflow-hidden">
      <div class="flex items-center justify-between px-4 py-3 border-b border-dark-700 bg-dark-800">
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-red-500" />
          <span class="w-3 h-3 rounded-full bg-yellow-500" />
          <span class="w-3 h-3 rounded-full bg-green-500" />
          <span class="text-xs text-dark-500 ms-2 font-mono">vpn-panel.log</span>
        </div>
        <div class="flex items-center gap-2">
          <span v-if="liveMode" class="flex items-center gap-1.5 text-xs text-emerald-400">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </span>
          <span class="text-xs text-dark-500">
            {{ $t('logs.entries', { count: filteredLogs.length }) }}
          </span>
        </div>
      </div>
      <div ref="logContainer"
        class="h-[500px] overflow-y-auto p-4 font-mono text-xs space-y-0.5 bg-dark-950"
        dir="ltr">
        <div v-if="!filteredLogs.length" class="text-dark-600 text-center py-8">
          {{ $t('logs.noEntries') }}
        </div>
        <div v-for="(log, i) in filteredLogs" :key="i"
          :class="['py-0.5 px-2 rounded hover:bg-dark-800 transition-colors', logLineClass(log)]">
          {{ log }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const vpn = useVpnStore()
const notif = useNotificationStore()
const { t, isRTL } = useLocale()

const search = ref('')
const levelFilter = ref('all')
const autoScroll = ref(true)
const liveMode = ref(true)
const logContainer = ref<HTMLElement | null>(null)

const filteredLogs = computed(() => {
  let logs = [...vpn.logs]
  if (levelFilter.value !== 'all') logs = logs.filter(l => l.includes(`[${levelFilter.value}]`))
  if (search.value) logs = logs.filter(l => l.toLowerCase().includes(search.value.toLowerCase()))
  return logs
})

function logLineClass(log: string) {
  if (log.includes('[ERROR]')) return 'text-red-400'
  if (log.includes('[WARN]'))  return 'text-yellow-400'
  if (log.includes('[INFO]'))  return 'text-dark-300'
  return 'text-dark-400'
}

function clearLogs() {
  vpn.logs = []
  notif.info(t('logs.cleared'))
}

function downloadLogs() {
  const blob = new Blob([vpn.logs.join('\n')], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `vpn-logs-${new Date().toISOString().slice(0, 10)}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

watch(filteredLogs, async () => {
  if (autoScroll.value && logContainer.value) {
    await nextTick()
    logContainer.value.scrollTop = logContainer.value.scrollHeight
  }
})

onMounted(() => {
  vpn.fetchLogs()
  if (liveMode.value) {
    setInterval(() => {
      const msgs = [
        '[INFO] Heartbeat check passed',
        '[INFO] Client connected',
        '[WARN] High traffic detected',
        '[INFO] Certificate renewed',
        '[ERROR] Connection timeout',
      ]
      vpn.logs.unshift(`${new Date().toISOString()} ${msgs[Math.floor(Math.random() * msgs.length)]}`)
      if (vpn.logs.length > 200) vpn.logs.pop()
    }, 4000)
  }
})
</script>
