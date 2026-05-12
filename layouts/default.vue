<template>
  <div class="flex h-screen bg-slate-50 overflow-hidden" :dir="isRTL ? 'rtl' : 'ltr'">
    <!-- Sidebar -->
    <aside
      :class="[
        'flex flex-col bg-white border-slate-200 transition-all duration-300 z-40 shadow-sm',
        isRTL ? 'border-l' : 'border-r',
        sidebarOpen ? 'w-64' : 'w-16',
        'fixed inset-y-0 lg:relative lg:translate-x-0',
        isRTL
          ? (mobileOpen ? 'right-0 translate-x-0' : 'right-0 translate-x-full lg:translate-x-0')
          : (mobileOpen ? 'left-0 translate-x-0' : 'left-0 -translate-x-full lg:translate-x-0'),
      ]"
    >
      <!-- Logo -->
      <div class="flex items-center gap-3 px-5 py-5 border-b border-slate-100 flex-shrink-0 bg-white">
        <div class="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
          <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <transition name="fade">
          <div v-if="sidebarOpen" class="overflow-hidden">
            <p class="text-lg font-bold text-slate-900 whitespace-nowrap">{{ $t('auth.title') }}</p>
            <p class="text-xs font-medium whitespace-nowrap"
              :class="auth.isAgent ? 'text-violet-600' : 'text-slate-500'">
              {{ auth.isAgent ? $t('nav.agentConsole') : 'Management Console' }}
            </p>
          </div>
        </transition>
      </div>

      <!-- Agent wallet badge (shown when agent + sidebar open) -->
      <transition name="fade">
        <div v-if="sidebarOpen && auth.isAgent && myAgent" class="mx-3 mt-3 p-3 rounded-xl bg-violet-50 border border-violet-200">
          <p class="text-xs text-slate-500 mb-1">{{ $t('agent.walletRemaining') }}</p>
          <p class="text-base font-bold text-emerald-600">{{ walletRemaining }} GB</p>
          <div class="progress-bar mt-1.5">
            <div class="progress-fill bg-emerald-500" :style="{ width: walletPct + '%' }" />
          </div>
          <p class="text-xs text-slate-500 mt-1">{{ walletPct }}% {{ $t('agent.used') }}</p>
        </div>
      </transition>

      <!-- Nav -->
      <nav class="flex-1 overflow-y-auto py-5 px-3 space-y-1">
        <template v-for="item in navItems" :key="item.to ?? item.section">
          <p v-if="item.section && sidebarOpen"
            class="px-4 pt-4 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {{ item.section }}
          </p>
          <div v-else-if="item.section && !sidebarOpen" class="border-t border-slate-100 my-3 mx-2" />

          <NuxtLink
            v-else
            :to="item.to"
            class="nav-link group relative"
            :class="{ active: route.path === item.to || (item.to !== '/' && item.to !== '/agent' && route.path.startsWith(item.to)) || (item.to === '/agent' && route.path === '/agent') }"
            @click="mobileOpen = false"
          >
            <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
            <transition name="fade">
              <span v-if="sidebarOpen" class="whitespace-nowrap">{{ item.label }}</span>
            </transition>
            <!-- Tooltip when collapsed -->
            <div v-if="!sidebarOpen"
              :class="[
                'tooltip top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none',
                isRTL ? 'right-full mr-2' : 'left-full ml-2'
              ]">
              {{ item.label }}
            </div>
            <span v-if="item.badge && sidebarOpen"
              class="ms-auto text-xs font-semibold bg-primary-600 text-white px-2 py-0.5 rounded-full shadow-sm">
              {{ item.badge }}
            </span>
          </NuxtLink>
        </template>
      </nav>

      <!-- Bottom -->
      <div class="border-t border-slate-100 p-3 space-y-2 flex-shrink-0 bg-slate-50/50">
        <button @click="toggleSidebar"
          class="nav-link w-full justify-center lg:flex hidden py-3">
          <svg class="w-5 h-5 transition-transform duration-300"
            :class="[sidebarOpen ? '' : 'rotate-180', isRTL ? 'scale-x-[-1]' : '']"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
          <transition name="fade">
            <span v-if="sidebarOpen">{{ $t('nav.collapse') }}</span>
          </transition>
        </button>

        <NuxtLink to="/settings/profile" class="nav-link group relative py-3" @click="mobileOpen = false">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs text-white font-bold flex-shrink-0 shadow-sm"
            :class="auth.isAgent ? 'bg-violet-500' : 'bg-primary-600'">
            {{ auth.user?.username?.[0]?.toUpperCase() }}
          </div>
          <transition name="fade">
            <div v-if="sidebarOpen" class="overflow-hidden">
              <p class="text-sm font-medium text-slate-800 whitespace-nowrap">{{ auth.user?.username }}</p>
              <p class="text-xs whitespace-nowrap capitalize"
                :class="auth.isAgent ? 'text-violet-600' : 'text-slate-500'">
                {{ auth.user?.role }}
              </p>
            </div>
          </transition>
        </NuxtLink>
      </div>
    </aside>

    <!-- Mobile overlay -->
    <div v-if="mobileOpen" class="fixed inset-0 bg-black/50 z-30 lg:hidden" @click="mobileOpen = false" />

    <!-- Main content -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Topbar -->
      <header class="flex items-center gap-4 px-4 lg:px-8 py-4 bg-white border-b border-slate-200 flex-shrink-0 sticky top-0 z-30">
        <!-- Mobile menu button -->
        <button @click="mobileOpen = !mobileOpen" class="btn-ghost btn-sm lg:hidden p-2 rounded-xl">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Page title -->
        <div class="flex-1 min-w-0">
          <h1 class="text-xl font-bold text-slate-900 truncate">{{ pageTitle }}</h1>
          <p class="text-xs font-medium text-slate-500 hidden sm:block">{{ currentTime }}</p>
        </div>

        <!-- Role badge -->
        <div v-if="auth.isAgent"
          class="hidden md:flex items-center gap-2 px-3 py-1.5 bg-violet-50 border border-violet-200 rounded-xl">
          <span class="w-2 h-2 bg-violet-500 rounded-full" />
          <span class="text-xs font-semibold text-violet-700">{{ $t('nav.agentMode') }}</span>
        </div>

        <!-- Server status (admin only) -->
        <div v-else class="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl">
          <span class="w-2 h-2 bg-emerald-500 rounded-full" />
          <span class="text-xs font-semibold text-emerald-700">{{ $t('common.serverOnline') }}</span>
        </div>

        <!-- Language switcher -->
        <LangSwitcher />

        <!-- Notifications -->
        <button class="btn-ghost btn-sm p-2 relative">
          <svg class="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span v-if="notifStore.items.length"
            class="absolute top-1 end-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <!-- Logout -->
        <button @click="auth.logout()" class="btn-ghost btn-sm p-2" :title="$t('common.signOut')">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto bg-slate-50">
        <div class="p-4 lg:p-8 max-w-7xl mx-auto">
          <slot />
        </div>
      </main>
    </div>

    <AppToasts />
  </div>
</template>

<script setup lang="ts">
import {
  HomeIcon, UsersIcon, ServerIcon, ChartBarIcon,
  Cog6ToothIcon, DocumentTextIcon, KeyIcon,
  ArrowPathIcon, GlobeAltIcon, UserGroupIcon,
} from '@heroicons/vue/24/outline'

defineOptions({ middleware: 'auth' })

const route = useRoute()
const auth = useAuthStore()
const agentStore = useAgentsStore()
const notifStore = useNotificationStore()
const vpnStore = useVpnStore()
const { t, isRTL } = useLocale()

const sidebarOpen = ref(true)
const mobileOpen = ref(false)
const currentTime = ref('')

// ─── Agent wallet info ────────────────────────────────────────────────────
const myAgent = computed(() =>
  agentStore.agents.find(a => a.id === auth.user?.agentId)
)
const walletRemaining = computed(() =>
  (myAgent.value?.walletBalance ?? 0) - (myAgent.value?.walletUsed ?? 0)
)
const walletPct = computed(() => {
  if (!myAgent.value?.walletBalance) return 0
  return Math.min(100, Math.round((myAgent.value.walletUsed / myAgent.value.walletBalance) * 100))
})

// ─── Role-based nav ───────────────────────────────────────────────────────
const navItems = computed(() => {
  if (auth.isAgent) {
    return [
      { to: '/agent', label: t('agent.dashboard'), icon: HomeIcon },
      { section: t('nav.management') },
      { to: '/settings/profile', label: t('nav.settings'), icon: Cog6ToothIcon },
    ]
  }

  // Admin nav
  return [
    { to: '/', label: t('nav.dashboard'), icon: HomeIcon },
    { section: t('nav.management') },
    { to: '/clients',  label: t('nav.clients'),  icon: UsersIcon,      badge: vpnStore.onlineClients.length || undefined },
    { to: '/agents',   label: t('nav.agents'),   icon: UserGroupIcon },
    { to: '/servers',  label: t('nav.servers'),  icon: ServerIcon },
    { to: '/inbounds', label: t('nav.inbounds'), icon: GlobeAltIcon },
    { section: t('nav.monitoring') },
    { to: '/traffic',  label: t('nav.traffic'),  icon: ChartBarIcon },
    { to: '/logs',     label: t('nav.logs'),     icon: DocumentTextIcon },
    { section: t('nav.system') },
    { to: '/certificates', label: t('nav.certificates'), icon: KeyIcon },
    { to: '/backup',       label: t('nav.backup'),       icon: ArrowPathIcon },
    { to: '/settings',     label: t('nav.settings'),     icon: Cog6ToothIcon },
  ]
})

const pageTitle = computed(() => {
  const map: Record<string, string> = {
    '/':                  t('dashboard.title'),
    '/agent':             t('agent.dashboard'),
    '/clients':           t('clients.title'),
    '/agents':            t('agents.title'),
    '/servers':           t('servers.title'),
    '/inbounds':          t('inbounds.title'),
    '/traffic':           t('traffic.title'),
    '/logs':              t('logs.title'),
    '/certificates':      t('certificates.title'),
    '/backup':            t('backup.title'),
    '/settings':          t('settings.title'),
    '/settings/profile':  t('profile.title'),
  }
  return map[route.path] || t('auth.title')
})

function toggleSidebar() { sidebarOpen.value = !sidebarOpen.value }

onMounted(async () => {
  if (auth.isAgent) {
    await agentStore.fetchAgents()
    await vpnStore.fetchClients()
  } else {
    vpnStore.fetchStats()
    vpnStore.fetchClients()
    vpnStore.fetchServers()
    vpnStore.startStatsPolling()
  }

  const updateTime = () => {
    currentTime.value = new Date().toLocaleString(
      isRTL.value ? 'fa-IR' : 'en-US',
      { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }
    )
  }
  updateTime()
  setInterval(updateTime, 1000)
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
