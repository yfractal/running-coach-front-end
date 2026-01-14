<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { workoutService } from '@/services/workoutService'

const route = useRoute()
const router = useRouter()
const workout = ref(null)
const isLoading = ref(true)
const isSaving = ref(false)
const error = ref(null)

// Form data
const formData = ref({
  workout_activity_type: '',
  start_date: '',
  duration: 0,
  total_distance: 0,
  average_heart_rate: 0,
  total_energy_burned: 0,
  device: '',
  source_revision: '',
  note: ''
})

// Format date for input
const formatDateForInput = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toISOString().slice(0, 16)
}

// Map activity_type string to workout_activity_type string for form
const mapActivityTypeToWorkoutActivityType = (activityType) => {
  const mapping = {
    'running': 'HKWorkoutActivityTypeRunning',
    'cycling': 'HKWorkoutActivityTypeCycling',
    'walking': 'HKWorkoutActivityTypeWalking',
    'high_intensity_interval_training': 'HKWorkoutActivityTypeHighIntensityIntervalTraining',
    'traditional_strength_training': 'HKWorkoutActivityTypeTraditionalStrengthTraining',
    'functional_strength_training': 'HKWorkoutActivityTypeFunctionalStrengthTraining',
    'flexibility': 'HKWorkoutActivityTypeFlexibility'
  }
  return mapping[activityType] || ''
}

// Fetch workout
const fetchWorkout = async () => {
  try {
    isLoading.value = true
    error.value = null
    const data = await workoutService.getWorkout(route.params.id)
    workout.value = data
    
    // Populate form
    // Map activity_type to workout_activity_type for the form
    // If workout_activity_type is already a string, use it; otherwise map from activity_type
    let workoutActivityType = ''
    if (data.workout_activity_type) {
      if (typeof data.workout_activity_type === 'string') {
        workoutActivityType = data.workout_activity_type
      } else {
        // It's a number, map from activity_type
        workoutActivityType = mapActivityTypeToWorkoutActivityType(data.activity_type)
      }
    } else if (data.activity_type) {
      workoutActivityType = mapActivityTypeToWorkoutActivityType(data.activity_type)
    }
    
    formData.value = {
      workout_activity_type: workoutActivityType,
      start_date: formatDateForInput(data.start_date),
      duration: data.duration || 0,
      total_distance: data.total_distance || 0,
      average_heart_rate: data.average_heart_rate || 0,
      total_energy_burned: data.total_energy_burned || 0,
      device: data.device || '',
      source_revision: data.source_revision || '',
      note: (data.custom_meta && data.custom_meta.note) || ''
    }
  } catch (err) {
    error.value = 'Failed to load workout. Please try again later.'
    console.error('Error fetching workout:', err)
  } finally {
    isLoading.value = false
  }
}

// Save workout
const saveWorkout = async () => {
  try {
    isSaving.value = true
    error.value = null
    
    // Validate duration
    const duration = Number(formData.value.duration)
    if (isNaN(duration) || duration < 0) {
      error.value = 'Duration must be a valid number greater than or equal to 0.'
      isSaving.value = false
      return
    }
    
    // Prepare update data
    const updates = {
      workout_activity_type: formData.value.workout_activity_type,
      start_date: new Date(formData.value.start_date).toISOString(),
      duration: duration,
      total_distance: parseFloat(formData.value.total_distance) || 0,
      average_heart_rate: parseFloat(formData.value.average_heart_rate) || 0,
      total_energy_burned: parseFloat(formData.value.total_energy_burned) || 0,
      device: formData.value.device,
      source_revision: formData.value.source_revision,
      custom_meta: {
        note: formData.value.note
      }
    }
    
    await workoutService.updateWorkout(route.params.id, updates)
    router.push({ name: 'WorkoutShow', params: { id: route.params.id } })
  } catch (err) {
    error.value = 'Failed to save workout. Please try again.'
    console.error('Error saving workout:', err)
  } finally {
    isSaving.value = false
  }
}

// Cancel editing
const cancel = () => {
  router.push({ name: 'WorkoutShow', params: { id: route.params.id } })
}

onMounted(() => {
  fetchWorkout()
})
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
    </div>

    <!-- Edit Form -->
    <div v-else-if="workout">
      <!-- Header -->
      <div class="mb-6">
        <div class="flex items-center">
          <button
            @click="cancel"
            class="mr-4 text-gray-600 hover:text-gray-900"
          >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 class="text-2xl font-bold text-gray-900">Edit Workout</h1>
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="saveWorkout" class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="space-y-6">
          <!-- Activity Type -->
          <div>
            <label for="activity-type" class="block text-sm font-medium text-gray-700 mb-2">
              Activity Type
            </label>
            <select
              id="activity-type"
              v-model="formData.workout_activity_type"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Activity Type</option>
              <option value="HKWorkoutActivityTypeRunning">Running</option>
              <option value="HKWorkoutActivityTypeCycling">Cycling</option>
              <option value="HKWorkoutActivityTypeWalking">Walking</option>
              <option value="HKWorkoutActivityTypeHighIntensityIntervalTraining">HIIT</option>
              <option value="HKWorkoutActivityTypeTraditionalStrengthTraining">Traditional Strength Training</option>
              <option value="HKWorkoutActivityTypeFunctionalStrengthTraining">Functional Strength Training</option>
              <option value="HKWorkoutActivityTypeFlexibility">Flexibility</option>
            </select>
          </div>

          <!-- Start Date -->
          <div>
            <label for="start-date" class="block text-sm font-medium text-gray-700 mb-2">
              Start Date & Time
            </label>
            <input
              id="start-date"
              v-model="formData.start_date"
              type="datetime-local"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- Duration -->
          <div>
            <label for="duration" class="block text-sm font-medium text-gray-700 mb-2">
              Duration (seconds)
            </label>
            <input
              id="duration"
              v-model.number="formData.duration"
              type="number"
              min="0"
              step="1"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- Distance -->
          <div>
            <label for="distance" class="block text-sm font-medium text-gray-700 mb-2">
              Distance (meters)
            </label>
            <input
              id="distance"
              v-model.number="formData.total_distance"
              type="number"
              min="0"
              step="0.01"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- Average Heart Rate -->
          <div>
            <label for="heart-rate" class="block text-sm font-medium text-gray-700 mb-2">
              Average Heart Rate (bpm)
            </label>
            <input
              id="heart-rate"
              v-model.number="formData.average_heart_rate"
              type="number"
              min="0"
              step="any"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- Calories -->
          <div>
            <label for="calories" class="block text-sm font-medium text-gray-700 mb-2">
              Calories Burned (kcal)
            </label>
            <input
              id="calories"
              v-model.number="formData.total_energy_burned"
              type="number"
              min="0"
              step="any"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- Device -->
          <div>
            <label for="device" class="block text-sm font-medium text-gray-700 mb-2">
              Device
            </label>
            <input
              id="device"
              v-model="formData.device"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- Source Revision -->
          <div>
            <label for="source-revision" class="block text-sm font-medium text-gray-700 mb-2">
              Source Revision
            </label>
            <input
              id="source-revision"
              v-model="formData.source_revision"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- Note -->
          <div>
            <label for="note" class="block text-sm font-medium text-gray-700 mb-2">
              Note
            </label>
            <textarea
              id="note"
              v-model="formData.note"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add a note about this workout..."
            ></textarea>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            @click="cancel"
            :disabled="isSaving"
            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isSaving"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSaving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
