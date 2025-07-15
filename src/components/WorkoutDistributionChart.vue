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
    type: Object,
    required: true
  }
})

const formatWorkoutType = (type) => {
  return type
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const secondsToHours = (seconds) => {
  return Math.round((seconds / 3600) * 10) / 10
}

const chartLabels = computed(() => {
  if (!props.workoutDistribution || !props.workoutDistribution.values || props.workoutDistribution.values.length === 0) {
    return []
  }
  return props.workoutDistribution.values.map(item => {
    const workoutType = Object.keys(item)[0]
    return formatWorkoutType(workoutType)
  })
})

const chartData = computed(() => {
  if (!props.workoutDistribution || !props.workoutDistribution.values || props.workoutDistribution.values.length === 0) {
    return []
  }
  return props.workoutDistribution.values.map(item => {
    const duration = Object.values(item)[0]
    return secondsToHours(duration)
  })
})

const chartColors = computed(() => {
  const colorMap = {
    'Running': 'rgb(59, 130, 246)',
    'Cycling': 'rgb(16, 185, 129)',
    'High Intensity Interval Training': 'rgb(239, 68, 68)',
    'Traditional Strength Training': 'rgb(245, 158, 11)',
    'Functional Strength Training': 'rgb(139, 92, 246)',
    'Cooldown': 'rgb(14, 165, 233)',
    'Walking': 'rgb(34, 197, 94)',
    'Yoga': 'rgb(236, 72, 153)',
    'Swimming': 'rgb(251, 146, 60)',
    'Other': 'rgb(168, 85, 247)'
  }
  return chartLabels.value.map(label => {
    return colorMap[label] || 'rgb(107, 114, 128)'
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