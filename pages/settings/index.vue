<template>
  <div class="space-y-5 animate-fade-in">
    <div>
      <h2 class="section-title">{{ $t('settings.title') }}</h2>
      <p class="section-subtitle">{{ $t('settings.subtitle') }}</p>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit flex-wrap border border-gray-200">
      <button v-for="tab in tabs" :key="tab.key"
        @click="activeTab = tab.key"
        :class="['px-4 py-2 rounded-lg text-sm font-medium transition-all',
          activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50']">
        {{ tab.label }}
      </button>
    </div>

    <!-- General -->
    <div v-if="activeTab === 'general'" class="card space-y-5">
      <h3 class="font-semibold text-gray-900">{{ $t('settings.general') }}</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="label">{{ $t('settings.serverName') }}</label>
          <input v-model="settings.serverName" type="text" class="input" />
        </div>
        <div>
          <label class="label">{{ $t('settings.serverHost') }}</label>
          <input v-model="settings.serverHost" type="text" class="input" dir="ltr" />
        </div>
        <div>
          <label class="label">{{ $t('settings.timezone') }}</label>
          <select v-model="settings.timezone" class="input">
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York</option>
            <option value="Europe/London">Europe/London</option>
            <option value="Asia/Tehran">Asia/Tehran</option>
            <option value="Asia/Tokyo">Asia/Tokyo</option>
          </select>
        </div>
        <div>
          <label class="label">{{ $t('settings.language') }}</label>
          <select v-model="settings.language" class="input" @change="onLangChange">
            <option value="en">English</option>
            <option value="fa">فارسی</option>
          </select>
        </div>
      </div>
      <div class="divider" />
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-800">{{ $t('settings.autoRefresh') }}</p>
          <p class="text-xs text-gray-500">{{ $t('settings.autoRefreshDesc') }}</p>
        </div>
        <ToggleSwitch v-model="settings.autoRefresh" />
      </div>
      <div v-if="settings.autoRefresh" class="flex items-center gap-4">
        <label class="label mb-0 w-48">{{ $t('settings.refreshInterval') }}</label>
        <input v-model.number="settings.refreshInterval" type="number" class="input w-24" min="5" max="300" />
        <span class="text-sm text-gray-500">{{ $t('settings.seconds') }}</span>
      </div>
    </div>

    <!-- VPN Defaults -->
    <div v-if="activeTab === 'vpn'" class="card space-y-5">
      <h3 class="font-semibold text-gray-900">{{ $t('settings.vpnDefaults') }}</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="label">{{ $t('settings.defaultDataLimit') }}</label>
          <input v-model.number="settings.defaultDataLimit" type="number" class="input" placeholder="0" min="0" />
        </div>
        <div>
          <label class="label">{{ $t('settings.defaultExpireDays') }}</label>
          <input v-model.number="settings.defaultExpireDays" type="number" class="input" placeholder="0" min="0" />
        </div>
        <div>
          <label class="label">{{ $t('settings.maxClients') }}</label>
          <input v-model.number="settings.maxClients" type="number" class="input" min="1" />
        </div>
        <div>
          <label class="label">{{ $t('settings.mtu') }}</label>
          <input v-model.number="settings.mtu" type="number" class="input" min="576" max="9000" />
        </div>
        <div>
          <label class="label">{{ $t('settings.keepalive') }}</label>
          <input v-model.number="settings.keepalive" type="number" class="input" min="0" />
        </div>
        <div>
          <label class="label">{{ $t('settings.dnsServers') }}</label>
          <input v-model="settings.dnsServers" type="text" class="input" dir="ltr" placeholder="1.1.1.1, 8.8.8.8" />
        </div>
        <div class="sm:col-span-2">
          <label class="label">{{ $t('settings.allowedIPs') }}</label>
          <input v-model="settings.allowedIPs" type="text" class="input" dir="ltr" placeholder="0.0.0.0/0" />
        </div>
      </div>
    </div>

    <!-- Security -->
    <div v-if="activeTab === 'security'" class="card space-y-5">
      <h3 class="font-semibold text-gray-900">{{ $t('settings.security') }}</h3>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-800">{{ $t('settings.twoFactor') }}</p>
          <p class="text-xs text-gray-500">{{ $t('settings.twoFactorDesc') }}</p>
        </div>
        <ToggleSwitch v-model="settings.twoFactorAuth" />
      </div>
      <div class="divider" />
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label class="label">{{ $t('settings.sessionTimeout') }}</label>
          <input v-model.number="settings.sessionTimeout" type="number" class="input" min="5" />
        </div>
        <div>
          <label class="label">{{ $t('settings.maxLoginAttempts') }}</label>
          <input v-model.number="settings.loginAttempts" type="number" class="input" min="1" />
        </div>
        <div>
          <label class="label">{{ $t('settings.banDuration') }}</label>
          <input v-model.number="settings.banDuration" type="number" class="input" min="1" />
        </div>
      </div>
    </div>

    <!-- Notifications -->
    <div v-if="activeTab === 'notifications'" class="card space-y-5">
      <h3 class="font-semibold text-gray-900">{{ $t('settings.notifications') }}</h3>

      <!-- Telegram -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <div>
            <p class="text-sm font-medium text-gray-800">{{ $t('settings.telegram') }}</p>
            <p class="text-xs text-gray-500">{{ $t('settings.telegramDesc') }}</p>
          </div>
          <ToggleSwitch v-model="settings.telegramNotifications" />
        </div>
        <div v-if="settings.telegramNotifications" class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
          <div>
            <label class="label">{{ $t('settings.botToken') }}</label>
            <input v-model="settings.telegramBotToken" type="password" class="input" dir="ltr" placeholder="1234567890:ABC..." />
          </div>
          <div>
            <label class="label">{{ $t('settings.chatId') }}</label>
            <input v-model="settings.telegramChatId" type="text" class="input" dir="ltr" placeholder="-100123456789" />
          </div>
          <button @click="notif.info($t('settings.telegram'), $t('settings.telegramTest'))" class="btn-secondary btn-sm w-fit">
            {{ $t('settings.testTelegram') }}
          </button>
        </div>
      </div>

      <div class="divider" />

      <!-- Email -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <div>
            <p class="text-sm font-medium text-dark-200">{{ $t('settings.emailNotifications') }}</p>
            <p class="text-xs text-dark-500">{{ $t('settings.emailDesc') }}</p>
          </div>
          <ToggleSwitch v-model="settings.emailNotifications" />
        </div>
        <div v-if="settings.emailNotifications" class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
          <div>
            <label class="label">{{ $t('settings.smtpHost') }}</label>
            <input v-model="settings.emailSmtp" type="text" class="input" dir="ltr" placeholder="smtp.gmail.com" />
          </div>
          <div>
            <label class="label">{{ $t('settings.smtpPort') }}</label>
            <input v-model.number="settings.emailPort" type="number" class="input" />
          </div>
          <div>
            <label class="label">{{ $t('settings.emailUsername') }}</label>
            <input v-model="settings.emailUser" type="text" class="input" dir="ltr" />
          </div>
          <div>
            <label class="label">{{ $t('settings.emailPassword') }}</label>
            <input v-model="settings.emailPassword" type="password" class="input" />
          </div>
          <div class="sm:col-span-2">
            <label class="label">{{ $t('settings.fromAddress') }}</label>
            <input v-model="settings.emailFrom" type="email" class="input" dir="ltr" />
          </div>
          <button @click="notif.info($t('settings.emailNotifications'), $t('settings.emailTest'))" class="btn-secondary btn-sm w-fit">
            {{ $t('settings.testEmail') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Save -->
    <div class="flex justify-end">
      <button @click="saveSettings" class="btn-primary" :disabled="saving">
        <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        {{ saving ? $t('common.saving') : $t('common.save') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const settingsStore = useSettingsStore()
const notif = useNotificationStore()
const { t, switchLocale } = useLocale()

const activeTab = ref('general')
const saving = ref(false)

const tabs = computed(() => [
  { key: 'general',       label: t('settings.general') },
  { key: 'vpn',           label: t('settings.vpnDefaults') },
  { key: 'security',      label: t('settings.security') },
  { key: 'notifications', label: t('settings.notifications') },
])

const settings = reactive({ ...settingsStore.$state })

async function onLangChange() {
  await switchLocale(settings.language)
}

async function saveSettings() {
  saving.value = true
  await settingsStore.save(settings)
  await new Promise(r => setTimeout(r, 500))
  saving.value = false
  notif.success(t('settings.saved'), t('settings.savedDesc'))
}
</script>
