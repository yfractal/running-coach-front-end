<template>
  <div class="w-full h-full">
    <h3 class="text-lg font-medium text-gray-900 mb-4">{{ name }}</h3>
    <div class="relative w-full h-[calc(100%-2rem)] flex items-center justify-center">
      <Doughnut
        :data="chartData"
        :options="chartOptions"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import { Doughnut } from 'vue-chartjs'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
)

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  labels: {
    type: Array,
    required: true
  },
  data: {
    type: Array,
    required: true
  },
  colors: {
    type: Array,
    default: () => [
      'rgb(59, 130, 246)',   // blue-500
      'rgb(16, 185, 129)',   // emerald-500
      'rgb(245, 158, 11)',   // amber-500
      'rgb(239, 68, 68)',    // red-500
      'rgb(139, 92, 246)',   // violet-500
      'rgb(236, 72, 153)',   // pink-500
      'rgb(14, 165, 233)',   // sky-500
      'rgb(34, 197, 94)',    // green-500
      'rgb(251, 146, 60)',   // orange-500
      'rgb(168, 85, 247)'    // purple-500
    ]
  },
  tooltipFormatter: {
    type: Function,
    default: (context) => `${context.label}: ${context.raw}`
  }
})

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [{
    data: props.data,
    backgroundColor: props.colors.slice(0, props.labels.length),
    borderColor: props.colors.slice(0, props.labels.length).map(color => color.replace('rgb', 'rgba').replace(')', ', 0.8)')),
    borderWidth: 2,
    hoverOffset: 4
  }]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12
        }
      }
    },
    tooltip: {
      callbacks: {
        label: props.tooltipFormatter
      }
    }
  },
  cutout: '50%', // Makes it a doughnut chart instead of pie
  layout: {
    padding: 10
  }
}
</script> 