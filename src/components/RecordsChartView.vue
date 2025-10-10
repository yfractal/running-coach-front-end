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
  console.log("chartData computed")
  if (!chartRecordsData.value || !selectedName.value) {
    return { labels: [], datasets: [] }
  }
  
  console.log("chartData 2")

  // Check if the API response has pre-processed chart data
  if (chartRecordsData.value.records.length != 0) {
    const label = chartRecordsData.value.records[0].name
    const labels = chartRecordsData.value.records.map(record => record.date)
    const data = chartRecordsData.value.records.map(record =>record.record_characters[0].value)

    return {
      labels,
      datasets: [{
        label: label,
        data,
        backgroundColor: 'rgb(59, 130, 246)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1
      }]
    }
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
  console.log('Fetching chart data for name:', name)
  try {
    isLoadingChartData.value = true
    chartError.value = null
    const response = await axios.get('http://localhost:3001/api/records', {
      params: {
        name: name
      }
    })
    chartRecordsData.value = response.data
    console.log('Chart data records count:', chartRecordsData.value.records.length)
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

