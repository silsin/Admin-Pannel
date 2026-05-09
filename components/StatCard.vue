<template>
  <div class="stat-card">
    <div :class="['stat-icon', bgClass]">
      <!-- Users -->
      <svg v-if="icon === 'users'" class="w-6 h-6" :class="iconColor" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <!-- Server -->
      <svg v-else-if="icon === 'server'" class="w-6 h-6" :class="iconColor" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
      </svg>
      <!-- Download -->
      <svg v-else-if="icon === 'download'" class="w-6 h-6" :class="iconColor" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      <!-- Upload -->
      <svg v-else-if="icon === 'upload'" class="w-6 h-6" :class="iconColor" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" />
      </svg>
    </div>
    <div class="min-w-0">
      <p class="text-xs text-dark-500 mb-1">{{ title }}</p>
      <p class="text-xl font-bold text-dark-100 truncate">{{ value }}</p>
      <p v-if="sub" class="text-xs text-dark-500 mt-0.5">{{ sub }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  value: string | number
  sub?: string
  icon: 'users' | 'server' | 'download' | 'upload'
  color: 'green' | 'blue' | 'purple' | 'orange' | 'red'
}>()

const bgClass = computed(() => ({
  green: 'bg-emerald-500/20',
  blue: 'bg-blue-500/20',
  purple: 'bg-purple-500/20',
  orange: 'bg-orange-500/20',
  red: 'bg-red-500/20',
}[props.color]))

const iconColor = computed(() => ({
  green: 'text-emerald-400',
  blue: 'text-blue-400',
  purple: 'text-purple-400',
  orange: 'text-orange-400',
  red: 'text-red-400',
}[props.color]))
</script>
