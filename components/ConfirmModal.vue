<template>
  <div class="modal-overlay" @click.self="$emit('cancel')">
    <div class="modal max-w-md">
      <div class="modal-header">
        <h3 class="font-semibold text-dark-100">{{ title }}</h3>
        <button @click="$emit('cancel')" class="btn-ghost btn-sm p-1.5">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="modal-body">
        <p class="text-sm text-dark-300">{{ message }}</p>
      </div>
      <div class="modal-footer">
        <button @click="$emit('cancel')" class="btn-secondary">{{ $t('common.cancel') }}</button>
        <button @click="$emit('confirm')" :class="confirmClass || 'btn-primary'">
          {{ confirmLabel || $t('common.confirm') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  message: string
  confirmLabel?: string
  confirmClass?: string
}>()
defineEmits<{ confirm: []; cancel: [] }>()
</script>
