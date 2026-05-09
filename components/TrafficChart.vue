<template>
  <div :style="{ height: height + 'px' }">
    <Line v-if="chartData" :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const props = defineProps<{
  data: Array<{ time: string; in: number; out: number }>
  height?: number
}>()

const height = computed(() => props.height || 200)

const chartData = computed(() => ({
  labels: props.data.map(d => d.time),
  datasets: [
    {
      label: 'Download',
      data: props.data.map(d => d.in / 1024 / 1024),
      borderColor: 'rgb(52, 211, 153)',
      backgroundColor: 'rgba(52, 211, 153, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      borderWidth: 2,
    },
    {
      label: 'Upload',
      data: props.data.map(d => d.out / 1024 / 1024),
      borderColor: 'rgb(96, 165, 250)',
      backgroundColor: 'rgba(96, 165, 250, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      borderWidth: 2,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 300 },
  interaction: { intersect: false, mode: 'index' as const },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1e293b',
      borderColor: '#334155',
      borderWidth: 1,
      titleColor: '#94a3b8',
      bodyColor: '#e2e8f0',
      callbacks: {
        label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)} MB/s`,
      },
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(51,65,85,0.5)', drawBorder: false },
      ticks: { color: '#475569', maxTicksLimit: 6, font: { size: 10 } },
    },
    y: {
      grid: { color: 'rgba(51,65,85,0.5)', drawBorder: false },
      ticks: {
        color: '#475569',
        font: { size: 10 },
        callback: (v: any) => v.toFixed(1) + ' MB/s',
      },
    },
  },
}
</script>
