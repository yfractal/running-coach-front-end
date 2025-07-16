<template>
  <div class="chart-container">
    <h2>{{ name }}</h2>
    <div class="chart-wrapper">
      <Bar ref="chartRef" :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
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

const chartRef = ref(null)

const chartData = {
  labels: ['HIIT', 'Running', 'Cooldown', 'Cycling', 'Strength'],
  datasets: [
    {
      label: 'Duration (minutes)',
      data: [
        (83592.40 / 60).toFixed(2),  // HIIT
        (32304.66 / 60).toFixed(2),  // Running
        (5416.09 / 60).toFixed(2),   // Cooldown
        (2939.51 / 60).toFixed(2),   // Cycling
        (1001.27 / 60).toFixed(2)    // Strength
      ],
      backgroundColor: [
        '#f97316', // HIIT
        '#3b82f6', // Running
        '#10b981', // Cooldown
        '#facc15', // Cycling
        '#a855f7'  // Strength
      ],
      borderRadius: 6,
      barThickness: 50
    }
  ]
}

const chartOptions = {
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    legend: { display: false },
    title: {
      display: true,
      text: 'Workout Duration by Activity (in minutes)'
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
        text: 'Activity Type'
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
