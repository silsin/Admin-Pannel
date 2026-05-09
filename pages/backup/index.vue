<template>
  <div class="space-y-5 animate-fade-in">
    <div>
      <h2 class="section-title">{{ $t('backup.title') }}</h2>
      <p class="section-subtitle">{{ $t('backup.subtitle') }}</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Create backup -->
      <div class="card">
        <h3 class="font-semibold text-dark-100 mb-4">{{ $t('backup.createBackup') }}</h3>
        <div class="space-y-3 mb-4">
          <label v-for="opt in backupOptions" :key="opt.key" class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" v-model="opt.selected" class="rounded" />
            <div>
              <p class="text-sm text-dark-200">{{ opt.label }}</p>
              <p class="text-xs text-dark-500">{{ opt.desc }}</p>
            </div>
          </label>
        </div>
        <button @click="createBackup" class="btn-primary w-full justify-center" :disabled="creating">
          <svg v-if="creating" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ creating ? $t('backup.creating') : $t('backup.createBackup') }}
        </button>
      </div>

      <!-- Restore -->
      <div class="card">
        <h3 class="font-semibold text-dark-100 mb-4">{{ $t('backup.restoreFromFile') }}</h3>
        <div class="border-2 border-dashed border-dark-600 rounded-xl p-8 text-center mb-4 hover:border-primary-500 transition-colors cursor-pointer"
          @click="triggerFileInput" @dragover.prevent @drop.prevent="handleDrop">
          <svg class="w-10 h-10 text-dark-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p class="text-sm text-dark-400">{{ $t('backup.dropFile') }}</p>
          <p class="text-xs text-dark-600 mt-1">{{ $t('backup.supportedFormats') }}</p>
          <input ref="fileInput" type="file" class="hidden" accept=".json,.tar.gz,.gz" @change="handleFileSelect" />
        </div>
        <div v-if="selectedFile" class="flex items-center gap-2 p-3 bg-dark-800 rounded-lg mb-4">
          <svg class="w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span class="text-sm text-dark-200 flex-1 truncate">{{ selectedFile.name }}</span>
          <button @click="selectedFile = null" class="text-dark-500 hover:text-dark-300">×</button>
        </div>
        <button @click="restoreBackup" class="btn-success w-full justify-center" :disabled="!selectedFile || restoring">
          {{ restoring ? $t('backup.restoring') : $t('backup.restore') }}
        </button>
      </div>
    </div>

    <!-- History -->
    <div class="card">
      <h3 class="font-semibold text-dark-100 mb-4">{{ $t('backup.history') }}</h3>
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>{{ $t('backup.filename') }}</th>
              <th>{{ $t('backup.size') }}</th>
              <th>{{ $t('backup.contents') }}</th>
              <th>{{ $t('backup.created') }}</th>
              <th class="text-end">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="backup in backups" :key="backup.id">
              <td class="font-mono text-xs" dir="ltr">{{ backup.filename }}</td>
              <td class="text-dark-400 text-xs">{{ backup.size }}</td>
              <td>
                <div class="flex flex-wrap gap-1">
                  <span v-for="tag in backup.contents" :key="tag" class="badge-blue text-xs">{{ tag }}</span>
                </div>
              </td>
              <td class="text-dark-400 text-xs">{{ backup.created }}</td>
              <td>
                <div class="flex items-center justify-end gap-1">
                  <button @click="notif.info($t('common.download'), backup.filename)" class="btn-ghost btn-sm p-1.5">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                  <button @click="deleteBackup(backup.id)" class="btn-ghost btn-sm p-1.5 text-red-400">
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
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const notif = useNotificationStore()
const { t } = useLocale()

const creating = ref(false)
const restoring = ref(false)
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const backupOptions = computed(() => [
  { key: 'clients', label: t('backup.clientConfigs'),  desc: t('backup.clientConfigsDesc'),  selected: true },
  { key: 'servers', label: t('backup.serverSettings'), desc: t('backup.serverSettingsDesc'), selected: true },
  { key: 'certs',   label: t('backup.certsKeys'),      desc: t('backup.certsKeysDesc'),      selected: true },
  { key: 'settings',label: t('backup.appSettings'),    desc: t('backup.appSettingsDesc'),    selected: false },
].map(o => reactive(o)))

const backups = ref([
  { id: '1', filename: 'backup-2026-05-01.json', size: '2.4 MB', contents: ['clients', 'servers', 'certs'], created: 'May 1, 2026 03:00' },
  { id: '2', filename: 'backup-2026-04-24.json', size: '2.3 MB', contents: ['clients', 'servers'],          created: 'Apr 24, 2026 03:00' },
  { id: '3', filename: 'backup-2026-04-17.json', size: '2.1 MB', contents: ['clients', 'servers', 'certs', 'settings'], created: 'Apr 17, 2026 03:00' },
])

async function createBackup() {
  creating.value = true
  await new Promise(r => setTimeout(r, 1500))
  const filename = `backup-${new Date().toISOString().slice(0, 10)}.json`
  backups.value.unshift({
    id: crypto.randomUUID(),
    filename,
    size: '2.5 MB',
    contents: backupOptions.value.filter(o => o.selected).map(o => o.key),
    created: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
  })
  creating.value = false
  notif.success(t('backup.created_notif'), filename)
}

function triggerFileInput() { fileInput.value?.click() }
function handleFileSelect(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files?.[0]) selectedFile.value = files[0]
}
function handleDrop(e: DragEvent) {
  const files = e.dataTransfer?.files
  if (files?.[0]) selectedFile.value = files[0]
}

async function restoreBackup() {
  if (!selectedFile.value) return
  restoring.value = true
  await new Promise(r => setTimeout(r, 2000))
  restoring.value = false
  selectedFile.value = null
  notif.success(t('backup.restored'), t('backup.restoredDesc'))
}

function deleteBackup(id: string) {
  backups.value = backups.value.filter(b => b.id !== id)
  notif.success(t('backup.deleted'))
}
</script>
