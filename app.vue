<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const { restoreLocale } = useLocale()

onMounted(() => {
  restoreLocale()
})
</script>
