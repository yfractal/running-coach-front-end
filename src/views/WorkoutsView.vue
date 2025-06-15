<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const workouts = ref([])
const summary = ref({})
const isLoading = ref(true)
const error = ref(null)

// Fetch workouts data
const fetchWorkouts = async () => {
  try {
    isLoading.value = true
    const response = await axios.get('/api/workouts')
    workouts.value = response.data.workouts
    summary.value = response.data.summary
  } catch (err) {
    error.value = 'Failed to load workouts'
    console.error('Error fetching workouts:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchWorkouts)

// Format date range for display
const formatWeekRange = (weekStart) => {
  const start = new Date(weekStart)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  
  return `${formatDate(start)} - ${formatDate(end)}`
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Workouts</h1>
    
    <div v-if="isLoading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
      <p class="mt-4 text-gray-600">Loading workouts...</p>
    </div>
    
    <div v-else-if="error" class="bg-red-50 p-4 rounded-md">
      <p class="text-red-700">{{ error }}</p>
    </div>
    
    <div v-else>
      <!-- Table Header -->
      <div class="bg-gray-50 rounded-t-lg px-6 py-3 grid grid-cols-12 gap-2 text-sm font-medium text-gray-500">
        <div class="col-span-2">Week</div>
        <div class="col-span-1 text-right">Duration</div>
        <div class="col-span-1 text-right">Distance</div>
        <div class="col-span-1 text-right">Avg HR</div>
        <div class="col-span-4">Zone Distribution</div>
        <div class="flex">Types</div>
      </div>

      <!-- Week Rows -->
      <div class="divide-y divide-gray-200">
        <div v-for="[weekStart, weekData] in Object.entries(summary).sort((a, b) => new Date(b[0]) - new Date(a[0]))" 
             :key="weekStart" 
             class="bg-white px-6 py-4 grid grid-cols-12 gap-2 hover:bg-gray-50 transition-colors">
          
          <!-- Week Range -->
          <div class="col-span-2 text-sm text-gray-900">
            {{ formatWeekRange(weekStart) }}
          </div>

          <!-- Total Duration -->
          <div class="col-span-1 text-right text-sm text-gray-900">
            {{ weekData.total_duration_hours }}h
          </div>

          <!-- Total Distance -->
          <div class="col-span-1 text-right text-sm text-gray-900">
            {{ weekData.running_distance_km > 0 ? `${weekData.running_distance_km}km` : '-' }}
          </div>

          <!-- Average Heart Rate -->
          <div class="col-span-1 text-right text-sm text-gray-900">
            {{ Math.round(weekData.avg_heart_rate) }} bpm
          </div>

          <!-- Heart Rate Zones -->
          <div class="col-span-4">
            <div class="flex space-x-0.5 mb-1">
              <div v-for="(hours, zone) in weekData.zone_durations_hours" 
                   :key="zone"
                   class="h-4 rounded-sm relative group flex items-center justify-center overflow-visible"
                   :class="{
                     'bg-blue-400': zone === 'Zone 1',
                     'bg-teal-400': zone === 'Zone 2',
                     'bg-green-400': zone === 'Zone 3',
                     'bg-orange-400': zone === 'Zone 4',
                     'bg-red-400': zone === 'Zone 5'
                   }"
                   :style="{ 
                     width: `${(hours / Object.values(weekData.zone_durations_hours).reduce((a, b) => a + b, 0) * 100)}%`,
                     minWidth: hours > 0 ? '4px' : '0'
                   }">
                <!-- Tooltip on hover -->
                <div class="invisible group-hover:visible absolute -top-7 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none">
                  {{ zone }}: {{ hours }}h
                </div>
                <!-- Zone text inside bar -->
                <div class="text-xs text-white truncate px-1 pointer-events-none"
                     :class="{
                       'opacity-0': (hours / Object.values(weekData.zone_durations_hours).reduce((a, b) => a + b, 0) * 100) < 15
                     }">
                  {{ zone.replace('Zone ', 'Z') }} ({{ hours }}h)
                </div>
              </div>
            </div>
          </div>

          <!-- Activity Types -->
          <div class="col-span-3 flex flex-wrap gap-1">
            <span v-for="type in weekData.activity_types" 
                  :key="type"
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="{
                    'bg-indigo-100 text-indigo-800': type === 'running',
                    'bg-green-100 text-green-800': type === 'cycling',
                    'bg-yellow-100 text-yellow-800': type === 'walking',
                    'bg-purple-100 text-purple-800': type === 'high_intensity_interval_training',
                    'bg-blue-100 text-blue-800': type === 'traditional_strength_training',
                    'bg-pink-100 text-pink-800': type === 'functional_strength_training',
                    'bg-gray-100 text-gray-800': !['running', 'cycling', 'walking', 'high_intensity_interval_training', 'traditional_strength_training', 'functional_strength_training'].includes(type)
                  }">
              {{ type.replace(/_/g, ' ') }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 
