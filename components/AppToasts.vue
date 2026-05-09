<template>
  <ClientOnly>
    <Teleport to="body">
      <div class="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80 pointer-events-none">
        <TransitionGroup name="toast">
          <div
            v-for="notif in store.items"
            :key="notif.id"
            :class="['pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-sm', toastClass(notif.type)]"
          >
            <div :class="['w-5 h-5 flex-shrink-0 mt-0.5', iconClass(notif.type)]">
              <svg v-if="notif.type === 'success'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <svg v-else-if="notif.type === 'error'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <svg v-else-if="notif.type === 'warning'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <svg v-else fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-dark-100">{{ notif.title }}</p>
              <p v-if="notif.message" class="text-xs text-dark-400 mt-0.5">{{ notif.message }}</p>
            </div>
            <button @click="store.remove(notif.id)" class="text-dark-500 hover:text-dark-300 flex-shrink-0">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </TransitionGroup>
      </div>
    </Teleport>
  </ClientOnly>
</template>

<script setup lang="ts">
const store = useNotificationStore()

function toastClass(type: string) {
  const map: Record<string, string> = {
    success: 'bg-dark-900/95 border-emerald-500/30',
    error:   'bg-dark-900/95 border-red-500/30',
    warning: 'bg-dark-900/95 border-yellow-500/30',
    info:    'bg-dark-900/95 border-blue-500/30',
  }
  return map[type] || map.info
}

function iconClass(type: string) {
  const map: Record<string, string> = {
    success: 'text-emerald-400',
    error:   'text-red-400',
    warning: 'text-yellow-400',
    info:    'text-blue-400',
  }
  return map[type] || map.info
}
</script>

<style scoped>
.toast-enter-active { transition: all 0.3s ease; }
.toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from   { opacity: 0; transform: translateX(100%); }
.toast-leave-to     { opacity: 0; transform: translateX(100%); }
.toast-move         { transition: transform 0.3s ease; }
</style>
