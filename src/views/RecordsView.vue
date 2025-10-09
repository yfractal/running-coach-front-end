<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { recordService } from '@/services/recordService'
import BarChart from '@/components/BarChart.vue'
import axios from 'axios'

const records = ref([])
const isLoading = ref(true)
const error = ref(null)
const currentPage = ref(1)
const perPage = ref(10)
const totalPages = ref(1)
const totalRecords = ref(0)
const startDate = ref('')
const endDate = ref('')
const showDatePicker = ref(false)
const pageInput = ref('')

// Chart view states
const viewMode = ref('cards') // 'cards' or 'charts'
const chartRecordsData = ref([])
const selectedName = ref('')
const isLoadingChartData = ref(false)
const chartError = ref(null)

// Computed properties
const hasFilters = computed(() => startDate.value || endDate.value)
const paginationInfo = computed(() => {
  const start = (currentPage.value - 1) * perPage.value + 1
  const end = Math.min(currentPage.value * perPage.value, totalRecords.value)
  return `Showing ${start}-${end} of ${totalRecords.value} records`
})

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Format duration for display
const formatDuration = (minutes) => {
  if (!minutes) return '0m'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }
  return `${mins}m`
}

// Format record characters for display
const formatRecordCharacters = (recordCharacters) => {
  if (!recordCharacters || !Array.isArray(recordCharacters)) return 'N/A'
  return recordCharacters.map(char => `${char.value} ${char.unit}`).join(', ')
}

// Format date and time for display
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Calculate duration from start_at and end_at
const calculateDuration = (record) => {
  if (record.duration) {
    return formatDuration(record.duration)
  }
  if (record.start_at && record.end_at) {
    const start = new Date(record.start_at)
    const end = new Date(record.end_at)
    const diffMinutes = Math.round((end - start) / (1000 * 60))
    return formatDuration(diffMinutes)
  }
  return 'N/A'
}

// Get visible page numbers for pagination
const getVisiblePages = () => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
}

// Fetch records
const fetchRecords = async () => {
  try {
    isLoading.value = true
    error.value = null
    
    const filters = {
      page: currentPage.value,
      per_page: perPage.value
    }
    
    if (startDate.value) {
      filters.start_date = startDate.value
    }
    if (endDate.value) {
      filters.end_date = endDate.value
    }
    
    const response = await recordService.getRecords(filters)
    
    // Handle different API response formats
    records.value = response.records || response.data || response
    totalPages.value = response.meta?.total_pages || 1
    totalRecords.value = response.meta?.total
    
    // Debug logging
    console.log('API Response:', response)
    console.log('Records:', records.value)
    console.log('Meta:', response.meta)
    console.log('Total Pages:', totalPages.value)
    console.log('Total Records:', totalRecords.value)
  } catch (err) {
    error.value = 'Failed to load records. Please try again later.'
    console.error('Error fetching records:', err)
  } finally {
    isLoading.value = false
  }
}

// Handle page change
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Handle per page change
const handlePerPageChange = () => {
  currentPage.value = 1
  fetchRecords()
}

// Handle direct page navigation
const goToPageDirect = () => {
  const page = parseInt(pageInput.value)
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    pageInput.value = ''
  }
}

// Handle page input keypress
const handlePageInputKeypress = (event) => {
  if (event.key === 'Enter') {
    goToPageDirect()
  }
}

// Clear date filters
const clearDateFilters = () => {
  startDate.value = ''
  endDate.value = ''
  currentPage.value = 1
  fetchRecords()
}

// Apply date filters
const applyDateFilters = () => {
  currentPage.value = 1
  fetchRecords()
  showDatePicker.value = false
}

// Watch for page changes
watch(currentPage, () => {
  fetchRecords()
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
      // Fetch records for the default selected name
      await fetchRecordsForName(selectedName.value)
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

// Fetch records data for a specific name
const fetchRecordsForName = async (name) => {
  try {
    isLoadingChartData.value = true
    chartError.value = null
    const response = await recordService.getRecords({ name: name })
    chartRecordsData.value = response
  } catch (err) {
    chartError.value = 'Failed to load records for selected name. Please try again later.'
    console.error('Error fetching records for name:', err)
  } finally {
    isLoadingChartData.value = false
  }
}

// Store available names separately
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
  
  // Process records data to extract Learning Time data
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

// Watch for view mode changes
watch(viewMode, (newMode) => {
  if (newMode === 'charts') {
    fetchAvailableNames()
  }
})

// Watch for name selection changes
watch(selectedName, (newName) => {
  if (newName && viewMode.value === 'charts') {
    fetchRecordsForName(newName)
  }
})

// Watch for date changes
watch([startDate, endDate], () => {
  if (startDate.value || endDate.value) {
    applyDateFilters()
  }
}, { deep: true })

onMounted(() => {
  fetchRecords()
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex justify-between items-start mb-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Records</h1>
          <p class="mt-2 text-sm text-gray-600">
            View and manage your workout records.
          </p>
        </div>
        
        <!-- View Toggle -->
        <div class="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            @click="viewMode = 'cards'"
            :class="[
              'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
              viewMode === 'cards' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            <svg 
              class="w-4 h-4 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Cards
          </button>
          <button
            @click="viewMode = 'charts'"
            :class="[
              'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
              viewMode === 'charts' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            <svg 
              class="w-4 h-4 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Charts
          </button>
        </div>
        <div class="flex space-x-3">
          <button
            @click="showDatePicker = !showDatePicker"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Filter by Date
          </button>
        </div>
      </div>

      <!-- Date Filter Panel -->
      <div v-if="showDatePicker" class="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label for="start-date" class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              id="start-date"
              v-model="startDate"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label for="end-date" class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              id="end-date"
              v-model="endDate"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div class="flex space-x-2">
            <button
              @click="applyDateFilters"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Apply
            </button>
            <button
              @click="clearDateFilters"
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <!-- Active Filters -->
      <div v-if="hasFilters" class="flex items-center space-x-2 mb-4">
        <span class="text-sm text-gray-600">Active filters:</span>
        <span v-if="startDate" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          From: {{ formatDate(startDate) }}
        </span>
        <span v-if="endDate" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          To: {{ formatDate(endDate) }}
        </span>
        <button
          @click="clearDateFilters"
          class="text-sm text-gray-500 hover:text-gray-700"
        >
          Clear all
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && viewMode === 'cards'" class="flex justify-center items-center min-h-[300px]">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error && viewMode === 'cards'"
      class="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-700"
    >
      {{ error }}
    </div>

    <!-- Chart View -->
    <div v-if="viewMode === 'charts'">
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

    <!-- Records Table -->
    <div v-else-if="viewMode === 'cards'" class="bg-white shadow overflow-hidden sm:rounded-md">
      <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Records</h3>
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <label for="per-page" class="text-sm text-gray-600">Per page:</label>
              <select
                id="per-page"
                v-model="perPage"
                @change="handlePerPageChange"
                class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
            <span class="text-sm text-gray-600">{{ paginationInfo }}</span>
          </div>
        </div>
      </div>

      <div v-if="records.length > 0" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Values</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="record in records" :key="record.id || record._id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ record.name || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ calculateDuration(record) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatRecordCharacters(record.record_characters) }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                {{ record.note || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(record.start_at || record.created_at || record.date) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No records found</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ hasFilters ? 'Try adjusting your date filters.' : 'Get started by creating your first workout record.' }}
        </p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages >= 1 && viewMode === 'cards'" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6">
      <div class="flex-1 flex justify-between sm:hidden">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage <= 1"
          class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          < 上一页
        </button>
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage >= totalPages"
          class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          下一页 >
        </button>
      </div>
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">
            {{ paginationInfo }}
          </p>
          <p class="text-sm font-medium text-blue-600 mt-1">
            Page {{ currentPage }} of {{ totalPages }}
          </p>
          <div class="mt-2 flex items-center space-x-2">
            <span class="text-sm text-gray-600">Go to page:</span>
            <input
              v-model="pageInput"
              @keypress="handlePageInputKeypress"
              type="number"
              :min="1"
              :max="totalPages"
              placeholder="Page"
              class="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              @click="goToPageDirect"
              class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Go
            </button>
          </div>
        </div>
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage <= 1"
              class="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              < 上一页
            </button>
            
            <!-- First page -->
            <button
              v-if="currentPage > 3"
              @click="goToPage(1)"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-l-md"
            >
              1
            </button>
            <span v-if="currentPage > 4" class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
              ...
            </span>
            
            <!-- Page numbers around current page -->
            <template v-for="page in getVisiblePages()" :key="page">
              <button
                @click="goToPage(page)"
                :class="[
                  page === currentPage
                    ? 'z-10 bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
                ]"
              >
                {{ page }}
              </button>
            </template>
            
            <!-- Last page -->
            <span v-if="currentPage < totalPages - 3" class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
              ...
            </span>
            <button
              v-if="currentPage < totalPages - 2"
              @click="goToPage(totalPages)"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              {{ totalPages }}
            </button>
            
            <button
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage >= totalPages"
              class="relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页 >
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>
