<template>
  <div class="card card-hover flex items-center gap-5">
    <div :class="['w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm', bgClass]">
      <!-- Users -->
      <svg v-if="icon === 'users'" class="w-7 h-7" :class="iconColor" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <!-- Server -->
      <svg v-else-if="icon === 'server'" class="w-7 h-7" :class="iconColor" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
      </svg>
      <!-- Download -->
      <svg v-else-if="icon === 'download'" class="w-7 h-7" :class="iconColor" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      <!-- Upload -->
      <svg v-else-if="icon === 'upload'" class="w-7 h-7" :class="iconColor" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" />
      </svg>
    </div>
    <div class="min-w-0 flex-1">
      <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{{ title }}</p>
      <p class="text-2xl font-bold text-gray-900 tracking-tight truncate">{{ value }}</p>
      <p v-if="sub" class="text-xs font-medium text-gray-400 mt-1">{{ sub }}</p>
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
  green: 'bg-gradient-to-br from-emerald-100 to-emerald-50',
  blue: 'bg-gradient-to-br from-blue-100 to-blue-50',
  purple: 'bg-gradient-to-br from-purple-100 to-purple-50',
  orange: 'bg-gradient-to-br from-orange-100 to-orange-50',
  red: 'bg-gradient-to-br from-red-100 to-red-50',
}[props.color]))

const iconColor = computed(() => ({
  green: 'text-emerald-600',
  blue: 'text-blue-600',
  purple: 'text-purple-600',
  orange: 'text-orange-600',
  red: 'text-red-600',
}[props.color]))
</script>
