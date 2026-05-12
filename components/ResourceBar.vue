<template>
  <div class="space-y-1.5">
    <div class="flex items-center justify-between text-xs">
      <span class="text-gray-500">{{ label }}</span>
      <span class="text-gray-700 font-mono">{{ display }}</span>
    </div>
    <div class="progress-bar">
      <div :class="['progress-fill', fillClass]" :style="{ width: pct + '%' }" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string
  value: number
  max: number
  display: string
  color: 'blue' | 'purple' | 'orange' | 'green' | 'red'
}>()

const pct = computed(() => Math.min(100, Math.round((props.value / props.max) * 100)))

const fillClass = computed(() => ({
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  green: 'bg-emerald-500',
  red: 'bg-red-500',
}[props.color]))
</script>
