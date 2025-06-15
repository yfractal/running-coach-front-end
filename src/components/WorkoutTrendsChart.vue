<template>
  <div class="w-full h-full">
    <h3 class="text-lg font-medium text-gray-900 mb-4">Weekly Running Distance & Heart Rate</h3>
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

  return {
    labels,
    datasets: [
      {
        label: 'Running Distance (km)',
        data: weeks.map(([, weekData]) => weekData.running_distance_km || 0),
        borderColor: 'rgb(99, 102, 241)', // indigo-500
        backgroundColor: 'rgb(99, 102, 241)',
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'Avg Heart Rate (bpm)',
        data: weeks.map(([, weekData]) => weekData.avg_heart_rate || 0),
        borderColor: 'rgb(239, 68, 68)', // red-500
        backgroundColor: 'rgb(239, 68, 68)',
        tension: 0.4,
        yAxisID: 'y1',
      }
    ]
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
          const metric = context.dataset.label.includes('Distance') ? 'km' : 'bpm'
          return `${context.dataset.label}: ${Math.round(value * 10) / 10}${metric}`
        }
      }
    }
  },
  scales: {
    y: {
      type: 'linear',
      display: true,
      position: 'left',
      title: {
        display: true,
        text: 'Distance (km)'
      },
      grid: {
        drawOnChartArea: false
      }
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      title: {
        display: true,
        text: 'Heart Rate (bpm)'
      },
      grid: {
        drawOnChartArea: false
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