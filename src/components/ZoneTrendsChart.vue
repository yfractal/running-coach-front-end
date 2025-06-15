<template>
  <div class="w-full h-full">
    <h3 class="text-lg font-medium text-gray-900 mb-4">Weekly Zone Time Trends</h3>
    <div class="flex items-center justify-end gap-2 mb-2">
      <button 
        @click="resetZoom"
        class="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Reset Zoom
      </button>
    </div>
    <div class="relative w-full h-[calc(100%-4rem)]">
      <Line
        ref="chartRef"
        :data="chartData"
        :options="chartOptions"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
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
import zoomPlugin from 'chartjs-plugin-zoom'
import { Line } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
)

const props = defineProps({
  summary: {
    type: Object,
    required: true
  }
})

const chartRef = ref(null)

const resetZoom = () => {
  if (chartRef.value) {
    chartRef.value.chart.resetZoom()
  }
}

const chartData = computed(() => {
  if (!props.summary || Object.keys(props.summary).length === 0) {
    return {
      labels: [],
      datasets: []
    }
  }

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

  // Add intensive training dataset
  const intensiveData = weeks.map(([, weekData]) => {
    const zones = weekData.zone_durations_hours
    return (zones['Zone 2'] || 0) + 
           (zones['Zone 3'] || 0) + 
           (zones['Zone 4'] || 0) + 
           (zones['Zone 5'] || 0)
  })

  datasets.push({
    label: 'Intensive Training (Z2-Z5)',
    data: intensiveData,
    borderColor: 'rgb(79, 70, 229)', // indigo-600
    backgroundColor: 'rgb(79, 70, 229)',
    borderWidth: 2,
    borderDash: [5, 5],
    tension: 0.4,
    fill: false
  })

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
    },
    zoom: {
      pan: {
        enabled: true,
        mode: 'x',
        modifierKey: 'ctrl',
      },
      zoom: {
        wheel: {
          enabled: true,
          modifierKey: 'ctrl',
        },
        drag: {
          enabled: true,
          backgroundColor: 'rgba(79, 70, 229, 0.1)', // indigo-600 with opacity
          borderColor: 'rgb(79, 70, 229)', // indigo-600
          borderWidth: 1,
        },
        mode: 'x',
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Hours'
      },
      ticks: {
        callback: (value) => `${value}h`
      }
    },
    x: {
      grid: {
        display: false
      },
      ticks: {
        maxRotation: 45,
        minRotation: 45
      }
    }
  }
}
</script> 