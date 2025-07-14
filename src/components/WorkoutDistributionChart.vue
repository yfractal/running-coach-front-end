<template>
  <PieChart
    name="Workout Type Distribution"
    :labels="chartLabels"
    :data="chartData"
    :colors="chartColors"
    :tooltip-formatter="tooltipFormatter"
  />
</template>

<script setup>
import { computed } from 'vue'
import PieChart from './PieChart.vue'

const props = defineProps({
  workoutDistribution: {
    type: Array,
    required: true
  }
})

// Format workout type names
const formatWorkoutType = (type) => {
  return type
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Convert seconds to hours for better readability
const secondsToHours = (seconds) => {
  return Math.round((seconds / 3600) * 10) / 10 // Round to 1 decimal place
}

const chartLabels = computed(() => {
  if (!props.workoutDistribution || props.workoutDistribution.length === 0) {
    return []
  }

  const data = props.workoutDistribution[0]
  if (!data || !data.values) {
    return []
  }

  return data.values.map(item => {
    const workoutType = Object.keys(item)[0]
    return formatWorkoutType(workoutType)
  })
})

const chartData = computed(() => {
  if (!props.workoutDistribution || props.workoutDistribution.length === 0) {
    return []
  }

  const data = props.workoutDistribution[0]
  if (!data || !data.values) {
    return []
  }

  return data.values.map(item => {
    const duration = Object.values(item)[0]
    return secondsToHours(duration)
  })
})

const chartColors = computed(() => {
  const colorMap = {
    'Running': 'rgb(59, 130, 246)',                    // blue-500
    'Cycling': 'rgb(16, 185, 129)',                    // emerald-500
    'High Intensity Interval Training': 'rgb(239, 68, 68)', // red-500
    'Traditional Strength Training': 'rgb(245, 158, 11)',   // amber-500
    'Functional Strength Training': 'rgb(139, 92, 246)',    // violet-500
    'Cooldown': 'rgb(14, 165, 233)',                   // sky-500
    'Walking': 'rgb(34, 197, 94)',                     // green-500
    'Yoga': 'rgb(236, 72, 153)',                       // pink-500
    'Swimming': 'rgb(251, 146, 60)',                   // orange-500
    'Other': 'rgb(168, 85, 247)'                       // purple-500
  }

  return chartLabels.value.map(label => {
    return colorMap[label] || 'rgb(107, 114, 128)' // gray-500 as fallback
  })
})

const tooltipFormatter = (context) => {
  const hours = context.raw
  const label = context.label
  
  if (hours < 1) {
    const minutes = Math.round(hours * 60)
    return `${label}: ${minutes}m`
  } else {
    return `${label}: ${hours}h`
  }
}
</script> 