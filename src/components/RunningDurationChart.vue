<template>
  <LineChart
    name="Running Duration Trends"
    :labels="chartLabels"
    :datasets="chartDatasets"
    y-axis-label="Duration (minutes)"
    :y-axis-formatter="(value) => `${Math.round(value)}m`"
    :tooltip-formatter="(context) => `${context.dataset.label}: ${Math.round(context.raw)}m`"
  />
</template>

<script setup>
import { computed } from 'vue'
import LineChart from './LineChart.vue'

const props = defineProps({
  runningDurations: {
    type: Array,
    required: true
  }
})

const chartLabels = computed(() => {
  if (!props.runningDurations || props.runningDurations.length === 0) {
    return []
  }

  const data = props.runningDurations[0]
  if (!data || !data.values) {
    return []
  }

  // Extract week numbers and sort them
  const weeks = data.values
    .map(item => Object.keys(item)[0])
    .map(week => parseInt(week))
    .sort((a, b) => a - b)

  return weeks.map(week => `Week ${week}`)
})

const chartDatasets = computed(() => {
  if (!props.runningDurations || props.runningDurations.length === 0) {
    return []
  }

  const data = props.runningDurations[0]
  if (!data || !data.values) {
    return []
  }

  // Create a map of week -> duration for easy lookup
  const weekDurations = {}
  data.values.forEach(item => {
    const week = Object.keys(item)[0]
    const duration = Object.values(item)[0]
    weekDurations[parseInt(week)] = duration
  })

  // Sort weeks and get duration values in minutes
  const weeks = Object.keys(weekDurations)
    .map(week => parseInt(week))
    .sort((a, b) => a - b)

  const durationValues = weeks.map(week => {
    const seconds = weekDurations[week]
    return seconds / 60 // Convert seconds to minutes
  })

  return [{
    label: 'Running Duration',
    data: durationValues,
    borderColor: 'rgb(59, 130, 246)', // blue-500
    backgroundColor: 'rgb(59, 130, 246)',
    tension: 0.4,
    fill: false,
    borderWidth: 2
  }]
})
</script> 