<template>
  <div class="relative" ref="container">
    <button
      @click="open = !open"
      class="btn-ghost btn-sm flex items-center gap-1.5 px-2.5"
      :title="$t('settings.language')"
    >
      <span class="text-base leading-none">{{ currentFlag }}</span>
      <span class="text-xs font-medium hidden sm:inline">{{ currentName }}</span>
      <svg class="w-3 h-3 text-gray-500 transition-transform duration-200"
        :class="open ? 'rotate-180' : ''"
        fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <Transition name="dropdown">
      <div v-if="open"
        class="absolute top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50 min-w-[130px]"
        :class="isRTL ? 'left-0' : 'right-0'"
      >
        <button
          v-for="loc in availableLocales"
          :key="loc.code"
          @click="select(loc.code)"
          class="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors"
          :class="locale === loc.code ? 'text-primary-600 bg-primary-50' : 'text-gray-700'"
        >
          <span class="text-base">{{ loc.code === 'fa' ? '🇮🇷' : '🇬🇧' }}</span>
          <span>{{ loc.name }}</span>
          <svg v-if="locale === loc.code" class="w-3.5 h-3.5 ms-auto text-primary-600"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const { locale, isRTL, availableLocales, switchLocale } = useLocale()
const open = ref(false)
const container = ref<HTMLElement | null>(null)

const currentFlag = computed(() => locale.value === 'fa' ? '🇮🇷' : '🇬🇧')
const currentName = computed(() =>
  availableLocales.value.find(l => l.code === locale.value)?.name ?? ''
)

async function select(code: string) {
  await switchLocale(code)
  open.value = false
}

// Close on outside click
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (container.value && !container.value.contains(e.target as Node)) {
      open.value = false
    }
  })
})
</script>

<style scoped>
.dropdown-enter-active, .dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
