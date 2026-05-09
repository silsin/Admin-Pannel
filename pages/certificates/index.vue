<template>
  <div class="space-y-5 animate-fade-in">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="section-title">{{ $t('certificates.title') }}</h2>
        <p class="section-subtitle">{{ $t('certificates.subtitle') }}</p>
      </div>
      <div class="flex gap-2">
        <button @click="notif.info($t('certificates.generateCA'))" class="btn-secondary btn-sm">
          {{ $t('certificates.generateCA') }}
        </button>
        <button @click="showIssue = true" class="btn-primary btn-sm">
          {{ $t('certificates.issueCert') }}
        </button>
      </div>
    </div>

    <!-- CA Info -->
    <div class="card">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 bg-primary-600/20 rounded-xl flex items-center justify-center">
          <svg class="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <h3 class="font-semibold text-dark-100">{{ $t('certificates.caTitle') }}</h3>
          <p class="text-xs text-dark-500">{{ $t('certificates.caSubtitle') }}</p>
        </div>
        <span class="ms-auto badge-green">Active</span>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <p class="text-dark-500 mb-1">{{ $t('certificates.commonName') }}</p>
          <p class="text-dark-200 font-mono">VPN Panel CA</p>
        </div>
        <div>
          <p class="text-dark-500 mb-1">{{ $t('certificates.algorithm') }}</p>
          <p class="text-dark-200">RSA 4096</p>
        </div>
        <div>
          <p class="text-dark-500 mb-1">{{ $t('certificates.issued') }}</p>
          <p class="text-dark-200">Jan 1, 2024</p>
        </div>
        <div>
          <p class="text-dark-500 mb-1">{{ $t('certificates.expires') }}</p>
          <p class="text-yellow-400">Dec 31, 2029</p>
        </div>
      </div>
      <div class="flex gap-2 mt-4 pt-4 border-t border-dark-700">
        <button @click="notif.info($t('common.download'), 'CA cert')" class="btn-secondary btn-sm">
          {{ $t('certificates.downloadCACert') }}
        </button>
        <button @click="notif.info($t('common.download'), 'CA key')" class="btn-secondary btn-sm">
          {{ $t('certificates.downloadCAKey') }}
        </button>
      </div>
    </div>

    <!-- Certs table -->
    <div class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>{{ $t('certificates.commonName') }}</th>
            <th>{{ $t('certificates.type') }}</th>
            <th>{{ $t('certificates.algorithm') }}</th>
            <th>{{ $t('certificates.issued') }}</th>
            <th>{{ $t('certificates.expires') }}</th>
            <th>{{ $t('common.status') }}</th>
            <th class="text-end">{{ $t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cert in certs" :key="cert.id">
            <td>
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <span class="font-mono text-sm">{{ cert.cn }}</span>
              </div>
            </td>
            <td><span class="badge-blue">{{ cert.type }}</span></td>
            <td class="text-dark-400 text-xs">{{ cert.algorithm }}</td>
            <td class="text-dark-400 text-xs">{{ cert.issued }}</td>
            <td>
              <span :class="isExpiringSoon(cert.expires) ? 'text-yellow-400' : 'text-dark-400'" class="text-xs">
                {{ cert.expires }}
              </span>
            </td>
            <td>
              <span :class="cert.revoked ? 'badge-red' : 'badge-green'">
                {{ cert.revoked ? $t('certificates.revoked') : $t('certificates.valid') }}
              </span>
            </td>
            <td>
              <div class="flex items-center justify-end gap-1">
                <button @click="notif.info($t('common.download'), cert.cn)" class="btn-ghost btn-sm p-1.5">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
                <button v-if="!cert.revoked" @click="revokeCert(cert.id)"
                  class="btn-ghost btn-sm p-1.5 text-red-400" :title="$t('certificates.revoke')">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Issue Modal -->
    <div v-if="showIssue" class="modal-overlay" @click.self="showIssue = false">
      <div class="modal">
        <div class="modal-header">
          <h3 class="font-semibold text-dark-100">{{ $t('certificates.issueCert') }}</h3>
          <button @click="showIssue = false" class="btn-ghost btn-sm p-1.5">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="modal-body space-y-4">
          <div>
            <label class="label">{{ $t('certificates.commonName') }}</label>
            <input v-model="newCert.cn" type="text" class="input" placeholder="client-name" dir="ltr" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">{{ $t('certificates.algorithm') }}</label>
              <select v-model="newCert.algorithm" class="input">
                <option value="RSA 2048">RSA 2048</option>
                <option value="RSA 4096">RSA 4096</option>
                <option value="ECDSA P-256">ECDSA P-256</option>
              </select>
            </div>
            <div>
              <label class="label">{{ $t('certificates.validity') }}</label>
              <input v-model.number="newCert.days" type="number" class="input" placeholder="365" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showIssue = false" class="btn-secondary">{{ $t('common.cancel') }}</button>
          <button @click="issueCert" class="btn-primary">{{ $t('certificates.issue') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const notif = useNotificationStore()
const { t } = useLocale()
const showIssue = ref(false)
const newCert = reactive({ cn: '', algorithm: 'RSA 2048', days: 365 })

const certs = ref([
  { id: '1', cn: 'server',  type: 'Server', algorithm: 'RSA 4096',   issued: 'Jan 1, 2024',  expires: 'Jan 1, 2026',  revoked: false },
  { id: '2', cn: 'Alice',   type: 'Client', algorithm: 'RSA 2048',   issued: 'Feb 1, 2024',  expires: 'Feb 1, 2025',  revoked: false },
  { id: '3', cn: 'Bob',     type: 'Client', algorithm: 'RSA 2048',   issued: 'Mar 1, 2024',  expires: 'Mar 1, 2025',  revoked: false },
  { id: '4', cn: 'Charlie', type: 'Client', algorithm: 'ECDSA P-256',issued: 'Apr 1, 2024',  expires: 'Apr 1, 2025',  revoked: true },
])

function isExpiringSoon(dateStr: string) {
  return new Date(dateStr).getTime() - Date.now() < 30 * 86400000
}

function issueCert() {
  const expires = new Date(Date.now() + newCert.days * 86400000)
  certs.value.push({
    id: crypto.randomUUID(),
    cn: newCert.cn,
    type: 'Client',
    algorithm: newCert.algorithm,
    issued: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    expires: expires.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    revoked: false,
  })
  showIssue.value = false
  notif.success(t('certificates.issueCert'), t('certificates.certIssued', { name: newCert.cn }))
  newCert.cn = ''
}

function revokeCert(id: string) {
  const cert = certs.value.find(c => c.id === id)
  if (cert) {
    cert.revoked = true
    notif.warning(t('certificates.certRevoked'), cert.cn)
  }
}
</script>
