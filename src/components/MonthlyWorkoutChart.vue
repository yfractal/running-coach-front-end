<template>
  <BarChart
    name="Daily Workout Distribution"
    :labels="chartLabels"
    :datasets="chartDatasets"
    :stacked="true"
    y-axis-label="Duration (minutes)"
    :y-axis-formatter="(value) => `${Math.round(value)}m`"
    :tooltip-formatter="tooltipFormatter"
  />
</template>

<script setup>
import { computed } from 'vue'
import BarChart from './BarChart.vue'

const props = defineProps({
  currentMonthWorkouts: {
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

const secondsToMinutes = (seconds) => {
  return Math.round(seconds / 60)
}

const chartLabels = computed(() => {
  if (!props.currentMonthWorkouts || !props.currentMonthWorkouts.values || props.currentMonthWorkouts.values.length === 0) {
    return []
  }
  // Just show the types as labels for this aggregate
  return props.currentMonthWorkouts.values.map(item => {
    const workoutType = Object.keys(item)[0]
    return formatWorkoutType(workoutType)
  })
})

const chartDatasets = computed(() => {
  if (!props.currentMonthWorkouts || !props.currentMonthWorkouts.values || props.currentMonthWorkouts.values.length === 0) {
    return []
  }
  // Only one dataset for this aggregate
  return [{
    label: 'Duration',
    data: props.currentMonthWorkouts.values.map(item => secondsToMinutes(Object.values(item)[0])),
    backgroundColor: 'rgb(59, 130, 246)',
    borderColor: 'rgb(59, 130, 246)',
    borderWidth: 1
  }]
})

const tooltipFormatter = (context) => {
  const minutes = context.raw
  const label = context.label
  if (minutes === 0) {
    return null
  }
  if (minutes < 60) {
    return `${label}: ${minutes}m`
  } else {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes === 0 
      ? `${label}: ${hours}h` 
      : `${label}: ${hours}h ${remainingMinutes}m`
  }
}
</script> 