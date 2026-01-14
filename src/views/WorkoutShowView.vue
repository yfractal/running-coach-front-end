<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { workoutService } from '@/services/workoutService'

const route = useRoute()
const router = useRouter()
const workout = ref(null)
const isLoading = ref(true)
const error = ref(null)

// Format duration in hours and minutes
const formatDuration = (durationInSeconds) => {
  if (typeof durationInSeconds !== 'number') return '-'
  const hours = Math.floor(durationInSeconds / 3600)
  const minutes = Math.round((durationInSeconds % 3600) / 60)
  const seconds = Math.round(durationInSeconds % 60)
  
  if (hours === 0 && minutes === 0) {
    return `${seconds}s`
  }
  if (hours === 0) {
    return `${minutes}m ${seconds}s`
  }
  return `${hours}h ${minutes}m ${seconds}s`
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

// Get zone color
const getZoneColor = (zoneName) => {
  const colors = {
    'Zone 1': 'bg-blue-400',
    'Zone 2': 'bg-teal-400',
    'Zone 3': 'bg-green-400',
    'Zone 4': 'bg-orange-400',
    'Zone 5': 'bg-red-400'
  }
  return colors[zoneName] || 'bg-gray-400'
}

// Fetch workout
const fetchWorkout = async () => {
  try {
    isLoading.value = true
    error.value = null
    const data = await workoutService.getWorkout(route.params.id)
    workout.value = data
  } catch (err) {
    error.value = 'Failed to load workout. Please try again later.'
    console.error('Error fetching workout:', err)
  } finally {
    isLoading.value = false
  }
}

// Navigate to edit
const editWorkout = () => {
  router.push({ name: 'WorkoutEdit', params: { id: route.params.id } })
}

// Delete workout
const deleteWorkout = async () => {
  if (!confirm('Are you sure you want to delete this workout?')) {
    return
  }
  try {
    await workoutService.deleteWorkout(route.params.id)
    router.push({ name: 'WorkoutsIndex' })
  } catch (err) {
    error.value = 'Failed to delete workout. Please try again.'
    console.error('Error deleting workout:', err)
  }
}

// Go back
const goBack = () => {
  router.push({ name: 'WorkoutsIndex' })
}

onMounted(() => {
  fetchWorkout()
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        @click="fetchWorkout"
        class="ml-2 text-red-600 hover:text-red-800 font-medium underline"
      >
        Try Again
      </button>
    </div>

    <!-- Workout Details -->
    <div v-else-if="workout">
      <!-- Header -->
      <div class="mb-6">
        <div class="flex items-center mb-4">
          <button
            @click="goBack"
            class="mr-4 text-gray-600 hover:text-gray-900"
          >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div class="flex-1">
            <div class="flex items-center">
              <h1 class="text-2xl font-bold text-gray-900 mr-4">Workout Details</h1>
              <span
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                :class="getActivityTypeColor(workout.activity_type)"
              >
                {{ formatActivityType(workout.activity_type) }}
              </span>
            </div>
            <p class="mt-2 text-sm text-gray-600">
              {{ new Date(workout.start_date).toLocaleString() }}
            </p>
          </div>
          <div class="flex space-x-3">
            <button
              @click="editWorkout"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button
              @click="deleteWorkout"
              class="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
            >
              <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Summary Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="text-sm text-gray-600 mb-1">Duration</div>
          <div class="text-2xl font-bold text-gray-900">{{ formatDuration(workout.duration) }}</div>
        </div>
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="text-sm text-gray-600 mb-1">Distance</div>
          <div class="text-2xl font-bold text-gray-900">{{ formatDistance(workout.total_distance) }}</div>
        </div>
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="text-sm text-gray-600 mb-1">Avg Heart Rate</div>
          <div class="text-2xl font-bold text-gray-900">
            {{ workout.average_heart_rate ? Math.round(workout.average_heart_rate) + ' bpm' : '-' }}
          </div>
        </div>
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="text-sm text-gray-600 mb-1">Calories</div>
          <div class="text-2xl font-bold text-gray-900">
            {{ workout.total_energy_burned ? Math.round(workout.total_energy_burned) + ' kcal' : '-' }}
          </div>
        </div>
      </div>

      <!-- Note -->
      <div v-if="workout.custom_meta && workout.custom_meta.note" class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-3">Note</h2>
        <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ workout.custom_meta.note }}</p>
      </div>

      <!-- Heart Rate Zones -->
      <div v-if="workout.heart_rate_zones && workout.heart_rate_zones.length > 0" class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Heart Rate Zones</h2>
        <div class="space-y-3">
          <div
            v-for="zone in workout.heart_rate_zones.filter(z => z.duration > 0)"
            :key="zone.name"
            class="flex items-center"
          >
            <div class="flex items-center flex-1">
              <span
                class="w-4 h-4 rounded-full mr-3"
                :class="getZoneColor(zone.name)"
              ></span>
              <span class="text-sm font-medium text-gray-900 w-20">{{ zone.name }}</span>
              <span class="text-sm text-gray-600 ml-4">
                {{ zone.lower_bound }} - {{ zone.upper_bound }} bpm
              </span>
            </div>
            <span class="text-sm font-medium text-gray-900">
              {{ formatDuration(zone.duration) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Additional Information -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Device & Source -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Device Information</h2>
          <dl class="space-y-2">
            <div>
              <dt class="text-sm text-gray-600">Device</dt>
              <dd class="text-sm font-medium text-gray-900">{{ workout.device || '-' }}</dd>
            </div>
            <div>
              <dt class="text-sm text-gray-600">Source Revision</dt>
              <dd class="text-sm font-medium text-gray-900">{{ workout.source_revision || '-' }}</dd>
            </div>
            <div>
              <dt class="text-sm text-gray-600">UUID</dt>
              <dd class="text-sm font-mono text-gray-900 break-all">{{ workout.uuid || '-' }}</dd>
            </div>
          </dl>
        </div>

        <!-- Metadata -->
        <div v-if="workout.metadata && Object.keys(workout.metadata).length > 0" class="bg-white rounded-lg border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
          <dl class="space-y-2">
            <div v-for="(value, key) in workout.metadata" :key="key">
              <dt class="text-sm text-gray-600">{{ key }}</dt>
              <dd class="text-sm font-medium text-gray-900">{{ value }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Statistics -->
      <div v-if="workout.statistics && Object.keys(workout.statistics).length > 0" class="bg-white rounded-lg border border-gray-200 p-6 mt-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>
        <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="(value, key) in workout.statistics" :key="key">
            <dt class="text-sm text-gray-600">{{ key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }}</dt>
            <dd class="text-sm font-medium text-gray-900">{{ value }}</dd>
          </div>
        </dl>
      </div>

      <!-- Workout Events -->
      <div v-if="workout.workout_events && workout.workout_events.length > 0" class="bg-white rounded-lg border border-gray-200 p-6 mt-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Workout Events</h2>
        <div class="space-y-3">
          <div
            v-for="(event, index) in workout.workout_events"
            :key="index"
            class="flex items-center justify-between border-b border-gray-200 pb-3 last:border-b-0"
          >
            <div>
              <div class="text-sm font-medium text-gray-900">{{ event.type }}</div>
              <div class="text-sm text-gray-600">{{ new Date(event.date).toLocaleString() }}</div>
            </div>
            <div v-if="event.metadata" class="text-sm text-gray-600">
              {{ JSON.stringify(event.metadata) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
