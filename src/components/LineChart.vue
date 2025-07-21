<template>
  <div class="w-full h-full">
    <h3 class="text-lg font-medium text-gray-900 mb-4">{{ name }}</h3>
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
  name: {
    type: String,
    required: true
  },
  labels: {
    type: Array,
    required: true
  },
  datasets: {
    type: Array,
    required: true
  },
  yAxisLabel: {
    type: String,
    default: 'Value'
  },
  yAxisFormatter: {
    type: Function,
    default: (value) => value
  },
  tooltipFormatter: {
    type: Function,
    default: (context) => `${context.dataset.label}: ${context.raw}`
  }
})

const chartRef = ref(null)

const resetZoom = () => {
  if (chartRef.value) {
    chartRef.value.chart.resetZoom()
  }
}

const chartData = computed(() => ({
  labels: props.labels,
  datasets: props.datasets
}))

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
        label: props.tooltipFormatter
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
      beginAtZero: false,
      title: {
        display: true,
        text: props.yAxisLabel
      },
      ticks: {
        callback: props.yAxisFormatter
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