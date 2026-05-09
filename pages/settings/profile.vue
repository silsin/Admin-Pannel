<template>
  <div class="space-y-5 animate-fade-in max-w-2xl">
    <div>
      <h2 class="section-title">{{ $t('profile.title') }}</h2>
      <p class="section-subtitle">{{ $t('profile.subtitle') }}</p>
    </div>

    <!-- Avatar & info -->
    <div class="card flex items-center gap-5">
      <div class="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
        {{ auth.user?.username?.[0]?.toUpperCase() }}
      </div>
      <div>
        <p class="text-lg font-semibold text-dark-100">{{ auth.user?.username }}</p>
        <p class="text-sm text-dark-400">{{ auth.user?.email }}</p>
        <span class="badge-blue mt-1">{{ auth.user?.role }}</span>
      </div>
    </div>

    <!-- Change password -->
    <div class="card space-y-4">
      <h3 class="font-semibold text-dark-100">{{ $t('profile.changePassword') }}</h3>
      <div>
        <label class="label">{{ $t('profile.currentPassword') }}</label>
        <input v-model="pwForm.current" type="password" class="input" />
      </div>
      <div>
        <label class="label">{{ $t('profile.newPassword') }}</label>
        <input v-model="pwForm.newPw" type="password" class="input" />
      </div>
      <div>
        <label class="label">{{ $t('profile.confirmPassword') }}</label>
        <input v-model="pwForm.confirm" type="password" class="input" />
      </div>
      <div v-if="pwError" class="text-sm text-red-400">{{ pwError }}</div>
      <button @click="changePassword" class="btn-primary" :disabled="pwSaving">
        {{ pwSaving ? $t('profile.updating') : $t('profile.updatePassword') }}
      </button>
    </div>

    <!-- Danger zone -->
    <div class="card border-red-500/30">
      <h3 class="font-semibold text-red-400 mb-3">{{ $t('profile.dangerZone') }}</h3>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-dark-200">{{ $t('profile.signOutAll') }}</p>
          <p class="text-xs text-dark-500">{{ $t('profile.signOutAllDesc') }}</p>
        </div>
        <button @click="auth.logout()" class="btn-danger btn-sm">{{ $t('common.signOut') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const auth = useAuthStore()
const notif = useNotificationStore()
const { t } = useLocale()

const pwForm = reactive({ current: '', newPw: '', confirm: '' })
const pwError = ref('')
const pwSaving = ref(false)

async function changePassword() {
  pwError.value = ''
  if (pwForm.newPw !== pwForm.confirm) { pwError.value = t('profile.passwordMismatch'); return }
  if (pwForm.newPw.length < 6)         { pwError.value = t('profile.passwordTooShort'); return }
  pwSaving.value = true
  const result = await auth.changePassword(pwForm.current, pwForm.newPw)
  pwSaving.value = false
  if (result.success) {
    notif.success(t('profile.passwordUpdated'))
    pwForm.current = ''; pwForm.newPw = ''; pwForm.confirm = ''
  } else {
    pwError.value = result.message || t('profile.passwordMismatch')
  }
}
</script>
