<template>
  <div class="flex items-center gap-6">
    <div class="w-36 h-36 flex-shrink-0">
      <Doughnut v-if="hasData" :data="chartData" :options="chartOptions" />
      <div v-else class="w-full h-full flex items-center justify-center text-dark-600 text-sm">No data</div>
    </div>
    <div class="flex-1 space-y-2">
      <div v-for="(item, i) in legendItems" :key="item.label" class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ background: colors[i % colors.length] }" />
          <span class="text-sm text-dark-300 capitalize">{{ item.label }}</span>
        </div>
        <span class="text-sm font-semibold text-dark-200">{{ item.value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps<{
  data: Record<string, number>
}>()

const colors = [
  '#f97316', '#10b981', '#3b82f6', '#a855f7', '#ef4444', '#eab308', '#ec4899',
]

const hasData = computed(() => Object.keys(props.data).length > 0)

const legendItems = computed(() =>
  Object.entries(props.data).map(([label, value]) => ({ label, value }))
)

const chartData = computed(() => ({
  labels: legendItems.value.map(i => i.label),
  datasets: [{
    data: legendItems.value.map(i => i.value),
    backgroundColor: colors,
    borderColor: '#0f172a',
    borderWidth: 3,
    hoverOffset: 4,
  }],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '70%',
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1e293b',
      borderColor: '#334155',
      borderWidth: 1,
      titleColor: '#94a3b8',
      bodyColor: '#e2e8f0',
    },
  },
}
</script>
