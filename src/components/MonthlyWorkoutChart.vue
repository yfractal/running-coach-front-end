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

// Format workout type names
const formatWorkoutType = (type) => {
  return type
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Convert seconds to minutes
const secondsToMinutes = (seconds) => {
  return Math.round(seconds / 60)
}

// Format date for display
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric' 
  })
}

const chartLabels = computed(() => {
  if (!props.currentMonthWorkouts || Object.keys(props.currentMonthWorkouts).length === 0) {
    return []
  }

  // Sort dates chronologically
  const sortedDates = Object.keys(props.currentMonthWorkouts).sort()
  return sortedDates.map(date => formatDate(date))
})

const chartDatasets = computed(() => {
  if (!props.currentMonthWorkouts || Object.keys(props.currentMonthWorkouts).length === 0) {
    return []
  }

  const sortedDates = Object.keys(props.currentMonthWorkouts).sort()
  
  // Get all unique workout types
  const workoutTypes = new Set()
  Object.values(props.currentMonthWorkouts).forEach(dayData => {
    Object.keys(dayData).forEach(workoutType => {
      workoutTypes.add(workoutType)
    })
  })

  // Define colors for different workout types
  const colorMap = {
    'running': 'rgb(59, 130, 246)',                    // blue-500
    'cycling': 'rgb(16, 185, 129)',                    // emerald-500
    'high_intensity_interval_training': 'rgb(239, 68, 68)', // red-500
    'traditional_strength_training': 'rgb(245, 158, 11)',   // amber-500
    'functional_strength_training': 'rgb(139, 92, 246)',    // violet-500
    'cooldown': 'rgb(14, 165, 233)',                   // sky-500
    'walking': 'rgb(34, 197, 94)',                     // green-500
    'yoga': 'rgb(236, 72, 153)',                       // pink-500
    'swimming': 'rgb(251, 146, 60)',                   // orange-500
    'other': 'rgb(107, 114, 128)'                      // gray-500
  }

  // Create datasets for each workout type
  const datasets = Array.from(workoutTypes).map(workoutType => {
    const data = sortedDates.map(date => {
      const dayData = props.currentMonthWorkouts[date]
      const workoutData = dayData[workoutType]
      return workoutData ? secondsToMinutes(workoutData.value) : 0
    })

    return {
      label: formatWorkoutType(workoutType),
      data: data,
      backgroundColor: colorMap[workoutType] || colorMap['other'],
      borderColor: colorMap[workoutType] || colorMap['other'],
      borderWidth: 1
    }
  })

  // Sort datasets by total duration (descending) for better visual hierarchy
  datasets.sort((a, b) => {
    const totalA = a.data.reduce((sum, val) => sum + val, 0)
    const totalB = b.data.reduce((sum, val) => sum + val, 0)
    return totalB - totalA
  })

  return datasets
})

const tooltipFormatter = (context) => {
  const minutes = context.raw
  const label = context.dataset.label
  
  if (minutes === 0) {
    return null // Don't show tooltip for zero values
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