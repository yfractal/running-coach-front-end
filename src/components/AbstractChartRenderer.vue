<template>
  <div class="w-full space-y-8">
    <!-- All charts in single column grid -->
    <div class="w-full grid gap-8 grid-cols-1" v-if="charts.length > 0">
      <template v-for="(chart, idx) in charts" :key="idx">
        <div class="bg-gray-50 rounded-2xl shadow-lg p-8 flex flex-col h-full hover:shadow-xl transition-shadow duration-200">
          <div class="flex items-center mb-6">
            <div class="w-1.5 h-7 rounded mr-3" :class="{
              'bg-blue-500': chart.chart_type !== 'heatmap' && chart.chart_type !== '3d_heatmap',
              'bg-green-500': chart.chart_type === 'heatmap' || chart.chart_type === '3d_heatmap'
            }"></div>
            <h3 class="text-xl font-bold text-gray-900 tracking-tight">{{ chart.name }}</h3>
          </div>
          <component
            :is="getChartComponent(chart.chart_type)"
            v-bind="getChartProps(chart)"
            class="flex-1"
            :style="chart.chart_type === '3d_heatmap' ? 'min-height: 700px;' : 'min-height: 300px;'"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import LineChart from './LineChart.vue'
import BarChart from './BarChart.vue'
import PieChart from './PieChart.vue'
import RunningHeatmapChart from './RunningHeatmapChart.vue'
import RunningHeatmap3DChart from './RunningHeatmap3DChart.vue'

const props = defineProps({
  charts: {
    type: Array,
    required: true
  },
  columns: {
    type: Number,
    default: 1
  }
})

// Remove gridClass, nonHeatmapCharts, and heatmapCharts computed properties since we're using single column layout

function getChartComponent(type) {
  switch (type) {
    case 'line':
      return LineChart
    case 'bar':
      return BarChart
    case 'stacked_bar':
      return BarChart
    case 'pie':
      return PieChart
    case 'heatmap':
      return RunningHeatmapChart
    case '3d_heatmap':
      return RunningHeatmap3DChart
    default:
      return LineChart // fallback
  }
}

function getChartProps(chart) {
  // Handle the new API format where chart.values is an array of objects
  switch (chart.chart_type) {
    case 'line':
      return transformLineChart(chart)
    case 'bar':
      return transformBarChart(chart)
    case 'stacked_bar':
      return transformStackedBarChart(chart)
    case 'pie':
      return transformPieChart(chart)
    case 'heatmap':
      return transformHeatmapChart(chart)
    case '3d_heatmap':
      return transformHeatmapChart(chart) // Same data format as heatmap
    default:
      return transformLineChart(chart) // fallback
  }
}

function transformLineChart(chart) {
  const labels = []
  const datasets = []
  
  // Handle different data formats
  if (Array.isArray(chart.values)) {
    // Old format: array of objects
    const data = []
    chart.values.forEach(item => {
      const key = Object.keys(item)[0]
      const value = Object.values(item)[0]
      labels.push(getFormattedLabel(key, chart.chart_type))
      data.push(getFormattedValue(value, chart.unit, chart.chart_type))
    })
    
    datasets.push({
      label: getDatasetLabel(chart.unit),
      data,
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4
    })
  } else {
    // Check if this is a nested structure with activity types
    const firstKey = Object.keys(chart.values)[0]
    const firstValue = chart.values[firstKey]
    
    if (typeof firstValue === 'object' && firstValue !== null && !Array.isArray(firstValue)) {
      // Nested format: { activityType: { date: value, ... } }
      const activityTypes = Object.keys(chart.values)
      const allDates = new Set()
      
      // Collect all unique dates
      activityTypes.forEach(activityType => {
        Object.keys(chart.values[activityType]).forEach(date => {
          allDates.add(date)
        })
      })
      
      // Sort dates
      const sortedDates = Array.from(allDates).sort()
      labels.push(...sortedDates.map(date => getFormattedLabel(date, chart.chart_type)))
      
      // Create dataset for each activity type
      activityTypes.forEach((activityType, index) => {
        const data = sortedDates.map(date => {
          const value = chart.values[activityType][date] || 0
          return getFormattedValue(value, chart.unit, chart.chart_type)
        })
        
        const colorPalette = [
          'rgb(59, 130, 246)',   // blue
          'rgb(16, 185, 129)',   // green
          'rgb(245, 158, 11)',   // amber
          'rgb(239, 68, 68)',    // red
          'rgb(139, 92, 246)',   // violet
          'rgb(236, 72, 153)',   // pink
          'rgb(14, 165, 233)',   // sky
          'rgb(34, 197, 94)',    // emerald
          'rgb(251, 146, 60)',   // orange
          'rgb(168, 85, 247)'    // purple
        ]
        
        datasets.push({
          label: getFormattedLabel(activityType, chart.chart_type),
          data,
          borderColor: colorPalette[index % colorPalette.length],
          backgroundColor: colorPalette[index % colorPalette.length].replace('rgb', 'rgba').replace(')', ', 0.1)'),
          tension: 0.4
        })
      })
    } else {
      // Simple format: object with key-value pairs
      const data = []
      Object.entries(chart.values).forEach(([key, value]) => {
        labels.push(getFormattedLabel(key, chart.chart_type))
        data.push(getFormattedValue(value, chart.unit, chart.chart_type))
      })
      
      datasets.push({
        label: getDatasetLabel(chart.unit),
        data,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      })
    }
  }
  
  return {
    name: chart.name,
    labels,
    datasets
  }
}

function transformBarChart(chart) {
  const labels = []
  const data = []
  
  // Handle both array format and object format
  if (Array.isArray(chart.values)) {
    // Original format: array of objects
    chart.values.forEach(item => {
      const key = Object.keys(item)[0]
      const value = Object.values(item)[0]
      labels.push(getFormattedLabel(key, chart.chart_type))
      data.push(getFormattedValue(value, chart.unit, chart.chart_type))
    })
  } else {
    // New format: object with key-value pairs
    Object.entries(chart.values).forEach(([key, value]) => {
      labels.push(getFormattedLabel(key, chart.chart_type))
      data.push(getFormattedValue(value, chart.unit, chart.chart_type))
    })
  }
  
  // Use a color palette for week-based data instead of activity type mapping
  const colorPalette = [
    'rgb(59, 130, 246)',   // blue
    'rgb(16, 185, 129)',   // green
    'rgb(245, 158, 11)',   // amber
    'rgb(239, 68, 68)',    // red
    'rgb(139, 92, 246)',   // violet
    'rgb(236, 72, 153)',   // pink
    'rgb(14, 165, 233)',   // sky
    'rgb(34, 197, 94)',    // emerald
    'rgb(251, 146, 60)',   // orange
    'rgb(168, 85, 247)'    // purple
  ]
  
  return {
    name: chart.name,
    labels,
    datasets: [{
      label: getDatasetLabel(chart.unit),
      data,
      backgroundColor: labels.map((_, i) => colorPalette[i % colorPalette.length])
    }]
  }
}

function transformStackedBarChart(chart) {
  // Extract all unique activity types and weeks from the data
  const activityTypes = new Set()
  const weeks = new Set()
  
  // Handle both array format and object format
  if (Array.isArray(chart.values)) {
    // Original format: array of [week, activities] pairs
    chart.values.forEach(([week, activities]) => {
      weeks.add(week)
      Object.keys(activities).forEach(activity => {
        activityTypes.add(activity)
      })
    })
  } else {
    // New format: object with activity type keys, each containing week-value pairs
    Object.keys(chart.values).forEach(activityType => {
      activityTypes.add(activityType)
      Object.keys(chart.values[activityType]).forEach(week => {
        weeks.add(week)
      })
    })
  }
  
  // Sort activity types for consistent ordering
  const sortedActivityTypes = Array.from(activityTypes).sort()
  const sortedWeeks = Array.from(weeks).sort()
  
  // Create labels (formatted week dates)
  const labels = sortedWeeks.map(week => {
    // Format week dates (e.g., "2025-06-30" -> "Jun 30")
    if (/^\d{4}-\d{2}-\d{2}$/.test(week)) {
      const date = new Date(week)
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }
    return `Week ${week}`
  })
  
  // Create datasets for each activity type
  const datasets = sortedActivityTypes.map(activityType => {
    let data
    if (Array.isArray(chart.values)) {
      // Original format
      data = sortedWeeks.map(week => {
        const weekData = chart.values.find(([w]) => w === week)
        const value = weekData ? (weekData[1][activityType] || 0) : 0
        return getFormattedValue(value, chart.unit, 'stacked_bar')
      })
    } else {
      // New format: chart.values[activityType] contains week-value pairs
      data = sortedWeeks.map(week => {
        const value = chart.values[activityType] ? (chart.values[activityType][week] || 0) : 0
        return getFormattedValue(value, chart.unit, 'stacked_bar')
      })
    }
    
    return {
      label: getFormattedLabel(activityType, 'stacked_bar'),
      data,
      backgroundColor: getActivityTypeColor(activityType),
      stack: 'Stack 0'
    }
  })
  
  return {
    name: chart.name,
    labels,
    datasets,
    stacked: true
  }
}

function transformPieChart(chart) {
  const labels = []
  const data = []
  const colors = []
  
  const colorMap = {
    'running': 'rgb(59, 130, 246)',
    'cycling': 'rgb(16, 185, 129)',
    'high_intensity_interval_training': 'rgb(239, 68, 68)',
    'traditional_strength_training': 'rgb(245, 158, 11)',
    'functional_strength_training': 'rgb(139, 92, 246)',
    'cooldown': 'rgb(14, 165, 233)',
    'walking': 'rgb(34, 197, 94)',
    'yoga': 'rgb(236, 72, 153)',
    'swimming': 'rgb(251, 146, 60)'
  }
  
  // Handle both array format and object format
  if (Array.isArray(chart.values)) {
    // Original format: array of objects
    chart.values.forEach(item => {
      const key = Object.keys(item)[0]
      const value = Object.values(item)[0]
      
      const formattedLabel = getFormattedLabel(key, chart.chart_type)
      labels.push(formattedLabel)
      data.push(getFormattedValue(value, chart.unit, chart.chart_type))
      colors.push(colorMap[key] || 'rgb(107, 114, 128)')
    })
  } else {
    // New format: object with key-value pairs
    Object.entries(chart.values).forEach(([key, value]) => {
      const formattedLabel = getFormattedLabel(key, chart.chart_type)
      labels.push(formattedLabel)
      data.push(getFormattedValue(value, chart.unit, chart.chart_type))
      colors.push(colorMap[key] || 'rgb(107, 114, 128)')
    })
  }
  
  return {
    name: chart.name,
    labels,
    data,
    colors
  }
}

function transformHeatmapChart(chart) {
  // New format only: object with date-value pairs
  const values = Object.entries(chart.values).map(([date, value]) => ({
    [date]: value
  }))
  
  return {
    name: chart.name,
    yearlyRunningData: {
      values
    }
  }
}

function getFormattedLabel(key, chartType) {
  // Format labels based on the key and chart type
  if (chartType === 'line' && /^\d+$/.test(key)) {
    // Week numbers for line charts
    return `Week ${key}`
  } else if (key.includes('_')) {
    // Activity types - convert underscores to spaces and capitalize
    return key.replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(key)) {
    // Date format - format for line charts and other charts
    if (chartType === 'line' || chartType === 'bar') {
      const date = new Date(key)
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }
    return key
  }
  return key
}

function getFormattedValue(value, unit, chartType) {
  // Convert values based on unit
  switch (unit) {
    case 'second':
      // Convert seconds to minutes for line/bar charts, hours for pie charts
      if (chartType === 'pie') {
        return Math.round((value / 3600) * 10) / 10 // hours with 1 decimal
      }
      return Math.round(value / 60) // minutes
    case 'meter':
      return Math.round(value) // keep meters as is
    default:
      return value
  }
}

function getDatasetLabel(unit) {
  switch (unit) {
    case 'second':
      return 'Duration (minutes)'
    case 'meter':
      return 'Distance (meters)'
    case 'bpm':
      return 'Heart Rate (bpm)'
    default:
      return 'Value'
  }
}

function getActivityTypeColor(activityType) {
  const colorMap = {
    // Activity types
    'running': 'rgb(59, 130, 246)', // blue
    'cycling': 'rgb(16, 185, 129)', // green
    'high_intensity_interval_training': 'rgb(239, 68, 68)', // red
    'traditional_strength_training': 'rgb(245, 158, 11)', // amber
    'functional_strength_training': 'rgb(139, 92, 246)', // violet
    'cooldown': 'rgb(14, 165, 233)', // sky
    'walking': 'rgb(34, 197, 94)', // emerald
    'yoga': 'rgb(236, 72, 153)', // pink
    'swimming': 'rgb(251, 146, 60)', // orange
    'other': 'rgb(168, 85, 247)', // purple
    
    // Heart rate zones
    'Zone 1': 'rgb(96, 165, 250)', // blue-400
    'Zone 2': 'rgb(45, 212, 191)', // teal-400
    'Zone 3': 'rgb(74, 222, 128)', // green-400
    'Zone 4': 'rgb(251, 146, 60)', // orange-400
    'Zone 5': 'rgb(248, 113, 113)' // red-400
  }
  
  return colorMap[activityType] || 'rgb(107, 114, 128)' // gray fallback
}
</script> 