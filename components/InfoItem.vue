<template>
  <div>
    <p class="text-xs text-dark-500 mb-0.5">{{ label }}</p>
    <p :class="['text-sm text-dark-200', mono ? 'font-mono' : '']">{{ value }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string; value: string; mono?: boolean }>()
</script>
