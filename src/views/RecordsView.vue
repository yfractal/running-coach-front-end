<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { recordService } from '@/services/recordService'

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
    
    // Assuming the API returns { records: [], pagination: { total_pages, total_count } }
    records.value = response.records || response.data || response
    totalPages.value = response.pagination?.total_pages || 1
    totalRecords.value = response.pagination?.total_count || response.total || records.value.length
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

// Watch for date changes
watch([startDate, endDate], () => {
  if (startDate.value || endDate.value) {
    applyDateFilters()
  }
})

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
    <div v-if="isLoading" class="flex justify-center items-center min-h-[300px]">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-700"
    >
      {{ error }}
    </div>

    <!-- Records Table -->
    <div v-else class="bg-white shadow overflow-hidden sm:rounded-md">
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
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distance</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="record in records" :key="record.id || record._id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(record.date || record.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ record.type || record.workout_type || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDuration(record.duration) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ record.distance ? `${record.distance} km` : 'N/A' }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                {{ record.notes || record.description || 'N/A' }}
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
    <div v-if="totalPages > 1" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6">
      <div class="flex-1 flex justify-between sm:hidden">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage <= 1"
          class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage >= totalPages"
          class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">
            {{ paginationInfo }}
          </p>
        </div>
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage <= 1"
              class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="sr-only">Previous</span>
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </button>
            
            <template v-for="page in Math.min(5, totalPages)" :key="page">
              <button
                v-if="page <= totalPages"
                @click="goToPage(page)"
                :class="[
                  page === currentPage
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
                ]"
              >
                {{ page }}
              </button>
            </template>
            
            <button
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage >= totalPages"
              class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="sr-only">Next</span>
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>
