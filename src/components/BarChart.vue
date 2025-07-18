<template>
  <div class="chart-container">
    <h2>{{ name }}</h2>
    <div class="chart-wrapper">
      <Bar ref="chartRef" :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Bar } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const defaultPalette = [
  '#f97316', // orange
  '#3b82f6', // blue
  '#10b981', // green
  '#facc15', // yellow
  '#a855f7', // purple
  '#ef4444', // red
  '#14b8a6', // teal
  '#6366f1', // indigo
  '#eab308', // amber
  '#22d3ee'  // cyan
]

const props = defineProps({
  name: {
    type: String,
    default: '⏱ Workout Duration by Week'
  },
  labels: {
    type: Array,
    default: () => []
  },
  datasets: {
    type: Array,
    default: () => []
  }
})

const chartRef = ref(null)

const chartData = computed(() => {
  // If the dataset does not provide backgroundColor, assign a palette
  if (props.datasets.length > 0) {
    const ds = { ...props.datasets[0] }
    if (!ds.backgroundColor) {
      ds.backgroundColor = props.labels.map((_, i) => defaultPalette[i % defaultPalette.length])
    }
    return {
      labels: props.labels,
      datasets: [ds]
    }
  }
  return {
    labels: [],
    datasets: []
  }
})

const chartOptions = {
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    legend: { display: false },
    title: {
      display: true,
      text: props.name
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Minutes'
      }
    },
    x: {
      title: {
        display: true,
        text: 'Week'
      }
    }
  }
}
</script>

<style scoped>
.chart-container {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  width: 100%;
  height: 100%;
  box-shadow: 0 4px 8px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
}
h2 {
  text-align: center;
  margin-bottom: 1rem;
  flex-shrink: 0;
}
.chart-wrapper {
  position: relative;
  height: 400px;
}
body {
  font-family: sans-serif;
  background: #f9fafb;
  padding: 2rem;
}
</style> 
