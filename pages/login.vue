<template>
  <div class="w-full max-w-md relative z-10" :dir="isRTL ? 'rtl' : 'ltr'">
    <div class="card shadow-2xl">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 glow">
          <svg class="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-dark-100">{{ $t('auth.title') }}</h1>
        <p class="text-dark-400 text-sm mt-1">{{ $t('auth.subtitle') }}</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="label">{{ $t('auth.username') }}</label>
          <input
            v-model="form.username"
            type="text"
            class="input"
            placeholder="admin"
            autocomplete="username"
            required
          />
        </div>

        <div>
          <label class="label">{{ $t('auth.password') }}</label>
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              class="input"
              :class="isRTL ? 'ps-10' : 'pe-10'"
              placeholder="••••••••"
              autocomplete="current-password"
              required
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              :class="[
                'absolute top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300',
                isRTL ? 'left-3' : 'right-3',
              ]"
            >
              <svg v-if="!showPassword" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Error -->
        <div v-if="error" class="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <svg class="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm text-red-400">{{ error }}</p>
        </div>

        <button type="submit" class="btn-primary w-full justify-center py-2.5" :disabled="loading">
          <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>{{ loading ? $t('auth.signingIn') : $t('auth.signIn') }}</span>
        </button>
      </form>

      <!-- Footer -->
      <div class="flex items-center justify-between mt-6 pt-4 border-t border-dark-700">
        <p class="text-xs text-dark-600">
          {{ $t('auth.defaultCredentials') }}:
          <span class="text-dark-400 font-mono">admin / admin</span>
        </p>
        <LangSwitcher />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const auth = useAuthStore()
const notif = useNotificationStore()
const { t, isRTL } = useLocale()

const form = reactive({ username: '', password: '' })
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

async function handleLogin() {
  loading.value = true
  error.value = ''

  const result = await auth.login(form.username, form.password)

  if (result.success) {
    notif.success(t('auth.welcomeBack'), t('auth.loggedInAs', { name: form.username }))
    await navigateTo('/')
  } else {
    error.value = t('auth.invalidCredentials')
  }

  loading.value = false
}
</script>
