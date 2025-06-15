<template>
  <div class="w-full h-full">
    <h3 class="text-lg font-medium text-gray-900 mb-4">Weekly Zone Time Trends</h3>
    <div class="relative w-full h-[calc(100%-2rem)]">
      <Line
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
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const props = defineProps({
  summary: {
    type: Object,
    required: true
  }
})

const chartData = computed(() => {
  const weeks = Object.entries(props.summary)
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    
  const labels = weeks.map(([weekStart]) => {
    const date = new Date(weekStart)
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  })

  const datasets = [
    { label: 'Zone 1', color: 'rgb(96, 165, 250)' }, // blue-400
    { label: 'Zone 2', color: 'rgb(45, 212, 191)' }, // teal-400
    { label: 'Zone 3', color: 'rgb(74, 222, 128)' }, // green-400
    { label: 'Zone 4', color: 'rgb(251, 146, 60)' }, // orange-400
    { label: 'Zone 5', color: 'rgb(248, 113, 113)' }  // red-400
  ].map(zone => ({
    label: zone.label,
    data: weeks.map(([, weekData]) => weekData.zone_durations_hours[zone.label] || 0),
    borderColor: zone.color,
    backgroundColor: zone.color,
    tension: 0.4,
    fill: false
  }))

  return {
    labels,
    datasets
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'top',
      align: 'start',
      labels: {
        usePointStyle: true,
        boxWidth: 6,
        padding: 20
      }
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const value = context.raw
          return `${context.dataset.label}: ${value}h`
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Hours'
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
}
</script> 