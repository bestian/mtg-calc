<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const COLORS = [
  'rgba(99,102,241,0.75)',
  'rgba(34,197,94,0.75)',
  'rgba(251,146,60,0.75)',
  'rgba(236,72,153,0.75)',
  'rgba(20,184,166,0.75)',
]
const ROUND_LABELS = ['7張', '8張', '9張', '10張', '11張']

const props = defineProps({
  matrix: { type: Array, required: true },
  labels: { type: Array, required: true },
  title: { type: String, default: '' },
})

const chartData = computed(() => ({
  labels: props.labels,
  datasets: props.matrix.map((row, i) => ({
    label: ROUND_LABELS[i],
    data: row.map(p => +(p * 100).toFixed(2)),
    backgroundColor: COLORS[i],
  })),
}))

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'top' },
    title: { display: false },
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      ticks: { callback: v => v + '%' },
    },
  },
}
</script>

<template>
  <Bar :data="chartData" :options="chartOptions" />
</template>
