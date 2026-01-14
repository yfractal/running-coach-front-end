<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { workoutService } from '@/services/workoutService'

const router = useRouter()
const workouts = ref([])
const meta = ref({})
const isLoading = ref(true)
const error = ref(null)
const currentPage = ref(1)
const perPage = ref(20)
const timeRange = ref('')

// Format duration in hours and minutes
const formatDuration = (durationInSeconds) => {
  if (typeof durationInSeconds !== 'number') return '-'
  const hours = Math.floor(durationInSeconds / 3600)
  const minutes = Math.round((durationInSeconds % 3600) / 60)
  
  if (hours === 0) {
    return `${minutes}m`
  }
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`
}

// Format distance
const formatDistance = (distanceInMeters) => {
  if (!distanceInMeters) return '-'
  return `${(distanceInMeters / 1000).toFixed(2)} km`
}

// Format activity type
const formatActivityType = (type) => {
  if (!type) return '-'
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// Get activity type color
const getActivityTypeColor = (type) => {
  const colors = {
    'running': 'bg-blue-100 text-blue-800',
    'cycling': 'bg-green-100 text-green-800',
    'high_intensity_interval_training': 'bg-red-100 text-red-800',
    'traditional_strength_training': 'bg-yellow-100 text-yellow-800',
    'functional_strength_training': 'bg-purple-100 text-purple-800',
    'walking': 'bg-teal-100 text-teal-800'
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}

// Fetch workouts
const fetchWorkouts = async () => {
  try {
    isLoading.value = true
    error.value = null
    const filters = {
      page: currentPage.value,
      per_page: perPage.value
    }
    if (timeRange.value) {
      filters.time_range = timeRange.value
    }
    const response = await workoutService.getWorkouts(filters)
    workouts.value = response.workouts
    meta.value = response.meta
  } catch (err) {
    error.value = 'Failed to load workouts. Please try again later.'
    console.error('Error fetching workouts:', err)
  } finally {
    isLoading.value = false
  }
}

// Navigate to workout details
const viewWorkout = (id) => {
  router.push({ name: 'WorkoutShow', params: { id } })
}

// Navigate to edit workout
const editWorkout = (id) => {
  router.push({ name: 'WorkoutEdit', params: { id } })
}

// Delete workout
const deleteWorkout = async (id) => {
  if (!confirm('Are you sure you want to delete this workout?')) {
    return
  }
  try {
    await workoutService.deleteWorkout(id)
    await fetchWorkouts()
  } catch (err) {
    error.value = 'Failed to delete workout. Please try again.'
    console.error('Error deleting workout:', err)
  }
}

// Pagination
const goToPage = (page) => {
  currentPage.value = page
  fetchWorkouts()
}

const nextPage = () => {
  if (currentPage.value < meta.value.total_pages) {
    currentPage.value++
    fetchWorkouts()
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchWorkouts()
  }
}

// Change time range
const changeTimeRange = () => {
  currentPage.value = 1
  fetchWorkouts()
}

onMounted(() => {
  fetchWorkouts()
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex justify-between items-start mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Workouts</h1>
          <p class="mt-2 text-sm text-gray-600">
            View and manage your workout history.
          </p>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div class="flex items-center space-x-4">
          <label for="time-range" class="text-sm font-medium text-gray-700">
            Time Range:
          </label>
          <select
            id="time-range"
            v-model="timeRange"
            @change="changeTimeRange"
            class="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Time</option>
            <option value="current_week">Current Week</option>
            <option value="current_month">Current Month</option>
          </select>
          
          <div v-if="meta.total" class="ml-auto text-sm text-gray-600">
            {{ meta.total }} workout{{ meta.total !== 1 ? 's' : '' }} found
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center min-h-[300px]">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-700 mb-6"
    >
      {{ error }}
      <button
        @click="fetchWorkouts"
        class="ml-2 text-red-600 hover:text-red-800 font-medium underline"
      >
        Try Again
      </button>
    </div>

    <!-- Workouts List -->
    <div v-else>
      <template v-if="workouts.length > 0">
        <div class="bg-white shadow-sm rounded-lg overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Distance
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg HR
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Calories
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="workout in workouts"
                :key="workout.id"
                class="hover:bg-gray-50 cursor-pointer"
                @click="viewWorkout(workout.id)"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getActivityTypeColor(workout.activity_type)"
                  >
                    {{ formatActivityType(workout.activity_type) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ new Date(workout.start_date).toLocaleString() }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDuration(workout.duration) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDistance(workout.total_distance) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ workout.average_heart_rate ? Math.round(workout.average_heart_rate) + ' bpm' : '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ workout.total_energy_burned ? Math.round(workout.total_energy_burned) + ' kcal' : '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    @click.stop="editWorkout(workout.id)"
                    class="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    @click.stop="deleteWorkout(workout.id)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="meta.total_pages > 1" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              @click="nextPage"
              :disabled="currentPage === meta.total_pages"
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
                <span class="font-medium">{{ Math.min(currentPage * perPage, meta.total) }}</span>
                of
                <span class="font-medium">{{ meta.total }}</span>
                results
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  @click="prevPage"
                  :disabled="currentPage === 1"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span class="sr-only">Previous</span>
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  Page {{ currentPage }} of {{ meta.total_pages }}
                </span>
                <button
                  @click="nextPage"
                  :disabled="currentPage === meta.total_pages"
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
      </template>

      <!-- Empty State -->
      <div
        v-else
        class="bg-white rounded-lg border border-gray-200 p-12 text-center"
      >
        <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          No Workouts Found
        </h3>
        
        <p class="text-gray-600">
          {{ timeRange ? 'Try adjusting your filters.' : 'Your workout history will appear here.' }}
        </p>
      </div>
    </div>
  </div>
</template>
