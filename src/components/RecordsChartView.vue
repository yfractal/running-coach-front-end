<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import BarChart from '@/components/BarChart.vue'
import axios from 'axios'

const chartRecordsData = ref([])
const selectedName = ref('')
const isLoadingChartData = ref(false)
const chartError = ref(null)
const availableNamesList = ref([])

// Get available names for dropdown
const availableNames = computed(() => {
  return availableNamesList.value
})

// Get chart data for selected name
const chartData = computed(() => {
  if (!chartRecordsData.value || !selectedName.value) {
    return { labels: [], datasets: [] }
  }
  
  // Check if the API response has pre-processed chart data
  if (chartRecordsData.value.data && chartRecordsData.value.data['Learning Time']) {
    const learningTimeData = chartRecordsData.value.data['Learning Time']
    const labels = learningTimeData.map(item => item.week)
    const data = learningTimeData.map(item => item.value)
    
    return {
      labels,
      datasets: [{
        label: 'Learning Time (minutes)',
        data,
        backgroundColor: 'rgb(59, 130, 246)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1
      }]
    }
  }
  
  // Fallback: Process raw records data if API doesn't provide pre-processed data
  const records = chartRecordsData.value.records || chartRecordsData.value.data || chartRecordsData.value
  if (!Array.isArray(records) || records.length === 0) {
    return { labels: [], datasets: [] }
  }
  
  // Filter records for Learning Time and group by week
  const learningTimeRecords = records.filter(record => 
    record.name === selectedName.value && 
    record.record_characters && 
    record.record_characters.some(char => char.name === 'Learning Time')
  )
  
  if (learningTimeRecords.length === 0) {
    return { labels: [], datasets: [] }
  }
  
  // Group by week and sum Learning Time values
  const weekData = {}
  learningTimeRecords.forEach(record => {
    const recordDate = new Date(record.start_at || record.created_at || record.date)
    const weekStart = new Date(recordDate)
    weekStart.setDate(recordDate.getDate() - recordDate.getDay()) // Start of week (Sunday)
    const weekKey = weekStart.toISOString().split('T')[0]
    
    const learningTimeChar = record.record_characters.find(char => char.name === 'Learning Time')
    if (learningTimeChar) {
      if (!weekData[weekKey]) {
        weekData[weekKey] = 0
      }
      weekData[weekKey] += learningTimeChar.value || 0
    }
  })
  
  // Convert to chart format
  const labels = Object.keys(weekData).sort()
  const data = labels.map(week => weekData[week])
  
  return {
    labels,
    datasets: [{
      label: 'Learning Time (minutes)',
      data,
      backgroundColor: 'rgb(59, 130, 246)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 1
    }]
  }
})

// Fetch available names for dropdown
const fetchAvailableNames = async () => {
  try {
    isLoadingChartData.value = true
    chartError.value = null
    const response = await axios.get('http://localhost:3001/api/records')
    
    // Extract available names from the response
    if (response.data.meta && response.data.meta.names && response.data.meta.names.length > 0) {
      availableNamesList.value = response.data.meta.names
      selectedName.value = response.data.meta.names[0]
      // Fetch chart data for the default selected name
      await fetchChartDataForName(selectedName.value)
    } else {
      availableNamesList.value = []
    }
  } catch (err) {
    chartError.value = 'Failed to load records data for charts. Please try again later.'
    console.error('Error fetching chart records:', err)
  } finally {
    isLoadingChartData.value = false
  }
}

// Fetch chart data for a specific name
const fetchChartDataForName = async (name) => {
  try {
    isLoadingChartData.value = true
    chartError.value = null
    const response = await axios.get('http://localhost:3001/api/records', {
      params: {
        name: name
      }
    })
    chartRecordsData.value = response.data
  } catch (err) {
    chartError.value = 'Failed to load chart data for selected name. Please try again later.'
    console.error('Error fetching chart data for name:', err)
  } finally {
    isLoadingChartData.value = false
  }
}

// Watch for name selection changes
watch(selectedName, (newName) => {
  if (newName) {
    fetchChartDataForName(newName)
  }
})

onMounted(() => {
  fetchAvailableNames()
})
</script>

<template>
  <div>
    <!-- Chart Loading State -->
    <div v-if="isLoadingChartData" class="flex justify-center items-center min-h-[300px]">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
    </div>

    <!-- Chart Error State -->
    <div
      v-else-if="chartError"
      class="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-700"
    >
      {{ chartError }}
    </div>

    <!-- Chart Content -->
    <div v-else class="space-y-6">
      <!-- Name Selection Dropdown -->
      <div v-if="availableNames.length > 0" class="bg-white border border-gray-200 rounded-lg p-4">
        <label for="name-select" class="block text-sm font-medium text-gray-700 mb-2">Select Name:</label>
        <select
          id="name-select"
          v-model="selectedName"
          class="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option v-for="name in availableNames" :key="name" :value="name">
            {{ name }}
          </option>
        </select>
      </div>

      <!-- Bar Chart -->
      <div v-if="chartData.labels.length > 0" class="bg-white border border-gray-200 rounded-lg p-6">
        <BarChart
          name="Learning Time by Week"
          :labels="chartData.labels"
          :datasets="chartData.datasets"
        />
      </div>

      <!-- No Chart Data -->
      <div v-else class="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No chart data available</h3>
        <p class="mt-1 text-sm text-gray-500">
          No Learning Time data found for the selected name.
        </p>
      </div>
    </div>
  </div>
</template>

