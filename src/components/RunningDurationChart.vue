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
    type: Object,
    required: true
  }
})

const chartLabels = computed(() => {
  if (!props.runningDurations || !props.runningDurations.values || props.runningDurations.values.length === 0) {
    return []
  }
  // Extract week numbers and sort them
  const weeks = props.runningDurations.values
    .map(item => parseInt(Object.keys(item)[0]))
    .sort((a, b) => a - b)
  return weeks.map(week => `Week ${week}`)
})

const chartDatasets = computed(() => {
  if (!props.runningDurations || !props.runningDurations.values || props.runningDurations.values.length === 0) {
    return []
  }
  // Create a map of week -> duration for easy lookup
  const weekDurations = {}
  props.runningDurations.values.forEach(item => {
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