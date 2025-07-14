<template>
  <LineChart
    name="Weekly Zone Time Trends"
    :labels="chartLabels"
    :datasets="chartDatasets"
    y-axis-label="Hours"
    :y-axis-formatter="(value) => `${value}h`"
    :tooltip-formatter="(context) => `${context.dataset.label}: ${context.raw}h`"
  />
</template>

<script setup>
import { computed } from 'vue'
import LineChart from './LineChart.vue'

const props = defineProps({
  summary: {
    type: Object,
    required: true
  }
})

const chartLabels = computed(() => {
  if (!props.summary || Object.keys(props.summary).length === 0) {
    return []
  }

  const weeks = Object.entries(props.summary)
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    
  return weeks.map(([weekStart]) => {
    const date = new Date(weekStart)
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  })
})

const chartDatasets = computed(() => {
  if (!props.summary || Object.keys(props.summary).length === 0) {
    return []
  }

  const weeks = Object.entries(props.summary)
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))

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

  return datasets
})
</script> 