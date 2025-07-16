<template>
  <div class="w-full space-y-8">
    <!-- Regular charts in grid -->
    <div class="w-full grid gap-8" :class="gridClass" v-if="nonHeatmapCharts.length > 0">
      <template v-for="(chart, idx) in nonHeatmapCharts" :key="idx">
        <div class="bg-gray-50 rounded-2xl shadow-lg p-8 flex flex-col h-full hover:shadow-xl transition-shadow duration-200">
          <div class="flex items-center mb-6">
            <div class="w-1.5 h-7 rounded bg-blue-500 mr-3"></div>
            <h3 class="text-xl font-bold text-gray-900 tracking-tight">{{ chart.name }}</h3>
          </div>
          <component
            :is="getChartComponent(chart.chart_type)"
            v-bind="getChartProps(chart)"
            class="flex-1"
          />
        </div>
      </template>
    </div>
    
    <!-- Heatmap charts full width -->
    <template v-for="(chart, idx) in heatmapCharts" :key="`heatmap-${idx}`">
      <div class="bg-gray-50 rounded-2xl shadow-lg p-8 w-full hover:shadow-xl transition-shadow duration-200">
        <div class="flex items-center mb-6">
          <div class="w-1.5 h-7 rounded bg-green-500 mr-3"></div>
          <h3 class="text-xl font-bold text-gray-900 tracking-tight">{{ chart.name }}</h3>
        </div>
        <component
          :is="getChartComponent(chart.chart_type)"
          v-bind="getChartProps(chart)"
          class="w-full"
          :style="chart.chart_type === '3d_heatmap' ? 'min-height: 700px;' : 'min-height: 300px;'"
        />
      </div>
    </template>
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
    default: 2
  }
})

const gridClass = computed(() => `grid-cols-1 lg:grid-cols-${props.columns}`)

const nonHeatmapCharts = computed(() => {
  return props.charts.filter(chart => 
    chart.chart_type !== 'heatmap' && chart.chart_type !== '3d_heatmap'
  )
})

const heatmapCharts = computed(() => {
  return props.charts.filter(chart => 
    chart.chart_type === 'heatmap' || chart.chart_type === '3d_heatmap'
  )
})

function getChartComponent(type) {
  switch (type) {
    case 'line':
      return LineChart
    case 'bar':
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
  const data = []
  
  chart.values.forEach(item => {
    const key = Object.keys(item)[0]
    const value = Object.values(item)[0]
    labels.push(getFormattedLabel(key, chart.chart_type))
    data.push(getFormattedValue(value, chart.unit, chart.chart_type))
  })
  
  return {
    name: chart.name,
    labels,
    datasets: [{
      label: getDatasetLabel(chart.unit),
      data,
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4
    }]
  }
}

function transformBarChart(chart) {
  const labels = []
  const data = []
  
  chart.values.forEach(item => {
    const key = Object.keys(item)[0]
    const value = Object.values(item)[0]
    labels.push(getFormattedLabel(key, chart.chart_type))
    data.push(getFormattedValue(value, chart.unit, chart.chart_type))
  })
  
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
  
  return {
    name: chart.name,
    labels,
    datasets: [{
      label: getDatasetLabel(chart.unit),
      data,
      backgroundColor: labels.map(label => 
        colorMap[label.toLowerCase().replace(/\s+/g, '_')] || 'rgb(107, 114, 128)'
      )
    }]
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
  
  chart.values.forEach(item => {
    const key = Object.keys(item)[0]
    const value = Object.values(item)[0]
    
    const formattedLabel = getFormattedLabel(key, chart.chart_type)
    labels.push(formattedLabel)
    data.push(getFormattedValue(value, chart.unit, chart.chart_type))
    colors.push(colorMap[key] || 'rgb(107, 114, 128)')
  })
  
  return {
    name: chart.name,
    labels,
    data,
    colors
  }
}

function transformHeatmapChart(chart) {
  // The API already provides the correct format - pass it through directly
  return {
    name: chart.name,
    yearlyRunningData: {
      values: chart.values // This is already an array of {date: value} objects
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
    // Date format - return as is for heatmaps
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
    default:
      return 'Value'
  }
}
</script> 