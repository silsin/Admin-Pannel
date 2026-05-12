<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal w-full max-w-lg">
      <div class="modal-header">
        <h3 class="font-semibold text-gray-900">{{ $t('clients.editClient') }} — {{ client.name }}</h3>
        <button @click="$emit('close')" class="btn-ghost btn-sm p-1.5">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="modal-body space-y-4 max-h-[70vh] overflow-y-auto">
        <div>
          <label class="label">{{ $t('clients.clientName') }}</label>
          <input v-model="form.name" type="text" class="input" />
        </div>
        <div>
          <label class="label">{{ $t('common.email') }}</label>
          <input v-model="form.email" type="email" class="input" dir="ltr" />
        </div>
        <div>
          <label class="label">{{ $t('common.status') }}</label>
          <select v-model="form.status" class="input">
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label class="label">{{ $t('clients.dataLimit') }} (GB, 0 = {{ $t('common.unlimited') }})</label>
          <input v-model.number="dataLimitGB" type="number" class="input" min="0" />
        </div>
        <div>
          <label class="label">{{ $t('clients.expiryDate') }}</label>
          <input v-model="form.expiresAt" type="date" class="input" dir="ltr" />
        </div>
        <div>
          <label class="label">{{ $t('common.note') }}</label>
          <textarea v-model="form.note" class="input resize-none" rows="2" />
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="btn-secondary">{{ $t('common.cancel') }}</button>
        <button @click="save" class="btn-primary" :disabled="saving">
          {{ saving ? $t('common.saving') : $t('clients.saveChanges') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VpnClient } from '~/stores/vpn'

const props = defineProps<{ client: VpnClient }>()
const emit = defineEmits<{ close: []; saved: [] }>()
const vpn = useVpnStore()
const saving = ref(false)

const form = reactive({
  name: props.client.name,
  email: props.client.email || '',
  status: props.client.status,
  expiresAt: props.client.expiresAt ? props.client.expiresAt.slice(0, 10) : '',
  note: props.client.note || '',
})

const dataLimitGB = ref(props.client.dataLimit ? props.client.dataLimit / 1024 / 1024 / 1024 : 0)

async function save() {
  saving.value = true
  await vpn.updateClient(props.client.id, {
    ...form,
    dataLimit: dataLimitGB.value > 0 ? dataLimitGB.value * 1024 * 1024 * 1024 : null,
    expiresAt: form.expiresAt || null,
  })
  saving.value = false
  emit('saved')
}
</script>
