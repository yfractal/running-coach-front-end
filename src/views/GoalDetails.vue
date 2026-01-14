<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { goalService } from '@/services/goalService'
import ProgressRecordList from '@/components/ProgressRecordList.vue'
import ProgressRecordForm from '@/components/ProgressRecordForm.vue'
import GoalProgressChart from '@/components/GoalProgressChart.vue'
import GoalForm from '@/components/GoalForm.vue'

const route = useRoute()
const router = useRouter()

// State
const goal = ref(null)
const progressRecords = ref([])
const events = ref([])
const eventsMetadata = ref(null)
const isLoading = ref(true)
const error = ref(null)
const timeRangeFilter = ref('')
const customStartDate = ref('')
const customEndDate = ref('')
const showCustomDatePicker = ref(false)
const currentPage = ref(1)
const perPage = ref(20)

// Modals
const showAddModal = ref(false)
const showEditModal = ref(false)
const editingRecord = ref(null)
const showEditGoalModal = ref(false)

// Computed
const goalId = computed(() => route.params.id)

// Format date for display
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

// Format date and time for display
const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString()
}

// Format date with day of the week
const formatDateTimeWithDay = (dateString) => {
  const date = new Date(dateString)
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' })
  const dateTime = date.toLocaleString()
  return `${dayOfWeek}, ${dateTime}`
}

// Get status color
const getStatusColor = (status) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'completed':
      return 'bg-blue-100 text-blue-800'
    case 'paused':
      return 'bg-yellow-100 text-yellow-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    case 'archived':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Get category color
const getCategoryColor = (category) => {
  switch (category.toLowerCase()) {
    case 'training':
      return 'bg-purple-100 text-purple-800'
    case 'learning':
      return 'bg-indigo-100 text-indigo-800'
    case 'character':
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Calculate days until target
const getDaysUntilTarget = (targetDate) => {
  const target = new Date(targetDate)
  const today = new Date()
  const diffTime = target - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// Fetch goal and progress records
const fetchGoalData = async () => {
  try {
    isLoading.value = true
    error.value = null
    
    const [goalResponse, progressResponse] = await Promise.all([
      goalService.getGoal(goalId.value),
      goalService.getProgressRecords(goalId.value)
    ])
    
    goal.value = goalResponse.goal
    progressRecords.value = progressResponse.progress_records || []
    
    // Add progress_records to goal for the chart component
    goal.value.progress_records = progressRecords.value
    
    // Fetch events
    await fetchEvents()
  } catch (err) {
    error.value = 'Failed to load goal data. Please try again later.'
    console.error('Error fetching goal data:', err)
  } finally {
    isLoading.value = false
  }
}

// Fetch events with time range filter and pagination
const fetchEvents = async () => {
  try {
    const filters = {
      page: currentPage.value,
      per_page: perPage.value
    }
    
    if (timeRangeFilter.value === 'custom') {
      if (customStartDate.value) {
        filters.start_date = customStartDate.value
      }
      if (customEndDate.value) {
        filters.end_date = customEndDate.value
      }
    } else if (timeRangeFilter.value) {
      filters.time_range = timeRangeFilter.value
    }
    
    const response = await goalService.getEvents(goalId.value, filters)
    events.value = response.events || []
    eventsMetadata.value = response.meta || null
  } catch (err) {
    console.error('Error fetching events:', err)
    events.value = []
    eventsMetadata.value = null
  }
}

// Handle time range filter change
const handleTimeRangeChange = () => {
  if (timeRangeFilter.value === 'custom') {
    showCustomDatePicker.value = true
  } else {
    showCustomDatePicker.value = false
    currentPage.value = 1 // Reset to first page
    fetchEvents()
  }
}

// Handle custom date range apply
const applyCustomDateRange = () => {
  if (customStartDate.value && customEndDate.value) {
    currentPage.value = 1 // Reset to first page
    fetchEvents()
  }
}

// Handle pagination
const goToPage = (page) => {
  currentPage.value = page
  fetchEvents()
}

const nextPage = () => {
  if (eventsMetadata.value && currentPage.value < eventsMetadata.value.total_pages) {
    currentPage.value++
    fetchEvents()
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchEvents()
  }
}

// Handle add progress record
const handleAddRecord = async (recordData) => {
  try {
    await goalService.createProgressRecord(goalId.value, recordData)
    showAddModal.value = false
    await fetchGoalData()
  } catch (err) {
    console.error('Error creating progress record:', err)
    error.value = 'Failed to create progress record. Please try again.'
  }
}

// Handle edit progress record
const handleEditRecord = (record) => {
  editingRecord.value = record
  showEditModal.value = true
}

// Handle update progress record
const handleUpdateRecord = async (recordData) => {
  try {
    await goalService.updateProgressRecord(editingRecord.value.id, recordData)
    showEditModal.value = false
    editingRecord.value = null
    await fetchGoalData()
  } catch (err) {
    console.error('Error updating progress record:', err)
    error.value = 'Failed to update progress record. Please try again.'
  }
}

// Handle delete progress record
const handleDeleteRecord = async (recordId) => {
  try {
    await goalService.deleteProgressRecord(recordId)
    await fetchGoalData()
  } catch (err) {
    console.error('Error deleting progress record:', err)
    error.value = 'Failed to delete progress record. Please try again.'
  }
}

// Handle edit goal
const handleEditGoal = () => {
  showEditGoalModal.value = true
}

// Handle update goal
const handleUpdateGoal = async (goalData) => {
  try {
    await goalService.updateGoal(goalId.value, goalData)
    showEditGoalModal.value = false
    await fetchGoalData()
  } catch (err) {
    console.error('Error updating goal:', err)
    error.value = 'Failed to update goal. Please try again.'
  }
}

// Handle archive goal
const handleArchive = async () => {
  try {
    await goalService.updateGoal(goalId.value, { status: 'archived' })
    await fetchGoalData()
  } catch (err) {
    console.error('Error archiving goal:', err)
    error.value = 'Failed to archive goal. Please try again.'
  }
}

// Handle unarchive goal (activate archived goal)
const handleUnarchive = async () => {
  try {
    await goalService.updateGoal(goalId.value, { status: 'active' })
    await fetchGoalData()
  } catch (err) {
    console.error('Error unarchiving goal:', err)
    error.value = 'Failed to activate goal. Please try again.'
  }
}

// Close modals
const closeAddModal = () => {
  showAddModal.value = false
}

const closeEditModal = () => {
  showEditModal.value = false
  editingRecord.value = null
}

const closeEditGoalModal = () => {
  showEditGoalModal.value = false
}

// Initialize
onMounted(fetchGoalData)
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Back Button -->
    <div class="mb-6">
      <button
        @click="router.push('/goals')"
        class="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Goals
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center min-h-[400px]">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-700 mb-6"
    >
      {{ error }}
      <button
        @click="fetchGoalData"
        class="ml-2 text-red-600 hover:text-red-800 font-medium underline"
      >
        Try Again
      </button>
    </div>

    <!-- Goal Details -->
    <div v-else-if="goal" class="space-y-8">
      <!-- Goal Header -->
      <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div class="p-6">
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1 min-w-0">
              <h1 class="text-2xl font-bold text-gray-900 mb-2">
                {{ goal.title }}
              </h1>
              <p class="text-gray-600 mb-4 whitespace-pre-line">{{ goal.description }}</p>
            </div>
            
            <!-- Status and Category -->
            <div class="flex items-center space-x-2 ml-4">
              <button
                @click="handleEditGoal"
                class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                title="Edit goal"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                v-if="goal.status !== 'archived'"
                @click="handleArchive"
                class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                title="Archive goal"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </button>
              <button
                v-if="goal.status === 'archived'"
                @click="handleUnarchive"
                class="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                title="Activate goal"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="getStatusColor(goal.status)"
              >
                {{ goal.status.charAt(0).toUpperCase() + goal.status.slice(1) }}
              </span>
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="getCategoryColor(goal.category)"
              >
                {{ goal.category }}
              </span>
            </div>
          </div>

          <!-- Progress Section -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">Progress</span>
              <span class="text-sm text-gray-600">{{ goal.progress_percentage }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div 
                class="bg-blue-600 h-3 rounded-full transition-all duration-300"
                :style="{ width: `${Math.min(goal.progress_percentage, 100)}%` }"
              ></div>
            </div>
            <div class="mt-3 text-sm text-gray-600">
              <div class="flex justify-between">
                <span>Initial: {{ goal.initial_value || 0 }} {{ goal.unit }}</span>
                <span>Target: {{ goal.target }} {{ goal.unit }}</span>
              </div>
              <div v-if="goal.current_value !== undefined && goal.current_value !== null" class="text-center text-xs text-gray-500 mt-1">
                Current: {{ goal.current_value }} {{ goal.unit }}
              </div>
            </div>
          </div>

          <!-- Tags -->
          <div v-if="goal.tags && goal.tags.length > 0" class="mb-4">
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in goal.tags"
                :key="tag"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- Target Date -->
          <div class="flex items-center justify-between text-sm text-gray-600">
            <span>Target Date: {{ formatDate(goal.target_date) }}</span>
            <span v-if="goal.status === 'active'">
              {{ getDaysUntilTarget(goal.target_date) > 0 
                ? `${getDaysUntilTarget(goal.target_date)} days left` 
                : `${Math.abs(getDaysUntilTarget(goal.target_date))} days overdue` 
              }}
            </span>
          </div>
        </div>
      </div>

      <!-- Events Section -->
      <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-gray-900">Events</h2>
            <div class="flex items-center space-x-4">
              <!-- Time Range Filter -->
              <div class="flex items-center space-x-2">
                <label class="text-sm font-medium text-gray-700">Time Range:</label>
                <select
                  v-model="timeRangeFilter"
                  @change="handleTimeRangeChange"
                  class="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Time</option>
                  <option value="current_week">Current Week</option>
                  <option value="current_month">Current Month</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              
              <!-- Custom Date Range Picker -->
              <div v-if="showCustomDatePicker" class="flex items-center space-x-2">
                <input
                  v-model="customStartDate"
                  type="date"
                  class="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Start Date"
                />
                <span class="text-gray-500">to</span>
                <input
                  v-model="customEndDate"
                  type="date"
                  class="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="End Date"
                />
                <button
                  @click="applyCustomDateRange"
                  class="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

          <!-- Events List -->
          <div v-if="events.length === 0" class="text-center py-8 text-gray-500">
            No events found for the selected time range.
          </div>
          <div v-else>
            <div class="space-y-4 mb-6">
              <div
                v-for="event in events"
                :key="event.id"
                class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h3 class="text-base font-semibold text-gray-900 mb-1">
                      {{ event.title || event.name || 'Untitled Event' }}
                      <span v-if="event.quality && event.unit" class="text-sm font-normal text-gray-600 ml-2">
                        ({{ event.quality }} {{ event.unit }})
                      </span>
                    </h3>
                    <p v-if="event.description" class="text-sm text-gray-600 mb-2">
                      {{ event.description }}
                    </p>
                    <div class="flex items-center space-x-4 text-xs text-gray-500">
                      <span v-if="event.start_at || event.start_date">
                        <span class="font-medium">Start:</span> {{ formatDateTimeWithDay(event.start_at || event.start_date) }}
                      </span>
                      <span v-if="event.end_at || event.end_date">
                        <span class="font-medium">End:</span> {{ formatDateTime(event.end_at || event.end_date) }}
                      </span>
                      <span v-if="event.created_at">
                        <span class="font-medium">Created:</span> {{ formatDate(event.created_at) }}
                      </span>
                    </div>
                  </div>
                  <div v-if="event.status" class="ml-4">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="getStatusColor(event.status)"
                    >
                      {{ event.status.charAt(0).toUpperCase() + event.status.slice(1) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pagination Controls -->
            <div v-if="eventsMetadata && eventsMetadata.total_pages > 1" class="flex items-center justify-between border-t border-gray-200 pt-4">
              <div class="flex-1 flex justify-between sm:hidden">
                <button
                  @click="previousPage"
                  :disabled="currentPage === 1"
                  class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  @click="nextPage"
                  :disabled="currentPage === eventsMetadata.total_pages"
                  class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p class="text-sm text-gray-700">
                    Showing
                    <span class="font-medium">{{ (currentPage - 1) * perPage + 1 }}</span>
                    to
                    <span class="font-medium">{{ Math.min(currentPage * perPage, eventsMetadata.total) }}</span>
                    of
                    <span class="font-medium">{{ eventsMetadata.total }}</span>
                    events
                  </p>
                </div>
                <div>
                  <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      @click="previousPage"
                      :disabled="currentPage === 1"
                      class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span class="sr-only">Previous</span>
                      <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                    </button>
                    
                    <!-- Page numbers -->
                    <template v-for="page in eventsMetadata.total_pages" :key="page">
                      <button
                        v-if="page === 1 || page === eventsMetadata.total_pages || (page >= currentPage - 1 && page <= currentPage + 1)"
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
                      <span
                        v-else-if="page === currentPage - 2 || page === currentPage + 2"
                        class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                      >
                        ...
                      </span>
                    </template>

                    <button
                      @click="nextPage"
                      :disabled="currentPage === eventsMetadata.total_pages"
                      class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span class="sr-only">Next</span>
                      <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Chart Section -->
      <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div class="p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">Progress Chart</h2>
          <GoalProgressChart :goal="goal" />
        </div>
      </div>

      <!-- Progress Records Section -->
      <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-gray-900">Progress Records</h2>
            <button
              @click="showAddModal = true"
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg 
                class="-ml-1 mr-2 h-5 w-5" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M12 4v16m8-8H4" 
                />
              </svg>
              Add Progress Record
            </button>
          </div>

          <ProgressRecordList
            :progress-records="progressRecords"
            :goal="goal"
            @edit="handleEditRecord"
            @delete="handleDeleteRecord"
          />
        </div>
      </div>
    </div>

    <!-- Add Progress Record Modal -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold text-gray-900">Add Progress Record</h2>
          <button
            @click="closeAddModal"
            class="text-gray-400 hover:text-gray-500"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <ProgressRecordForm
          :goal="goal"
          @submit="handleAddRecord"
          @cancel="closeAddModal"
        />
      </div>
    </div>

    <!-- Edit Progress Record Modal -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold text-gray-900">Edit Progress Record</h2>
          <button
            @click="closeEditModal"
            class="text-gray-400 hover:text-gray-500"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <ProgressRecordForm
          :goal="goal"
          :progress-record="editingRecord"
          :is-editing="true"
          @submit="handleUpdateRecord"
          @cancel="closeEditModal"
        />
      </div>
    </div>

    <!-- Edit Goal Modal -->
    <div
      v-if="showEditGoalModal"
      class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold text-gray-900">Edit Goal</h2>
          <button
            @click="closeEditGoalModal"
            class="text-gray-400 hover:text-gray-500"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <GoalForm
          :goal="goal"
          :is-editing="true"
          @submit="handleUpdateGoal"
          @cancel="closeEditGoalModal"
        />
      </div>
    </div>
  </div>
</template>
