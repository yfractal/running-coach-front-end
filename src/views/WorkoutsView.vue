<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import AbstractChartRenderer from '../components/AbstractChartRenderer.vue'

const workouts = ref([])
const summary = ref({})
const charts = ref([])
const isLoading = ref(true)
const error = ref(null)
const expandedWeeks = ref({})
const userQuery = ref('')

// Format duration in hours and minutes
const formatDuration = (durationInSeconds) => {
  if (typeof durationInSeconds === 'number') {
    const hours = Math.floor(durationInSeconds / 3600)
    const minutes = Math.round((durationInSeconds % 3600) / 60)
    
    if (hours === 0) {
      return `${minutes}m`
    }
    return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`
  } else if (typeof durationInSeconds === 'undefined') {
    return '-'
  }
  
  // If it's already in hours (from total_duration_hours)
  const hours = Math.floor(durationInSeconds)
  const minutes = Math.round((durationInSeconds - hours) * 60)
  
  if (hours === 0) {
    return `${minutes}m`
  }
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`
}

// Format zone duration in hours with one decimal
const formatZoneDuration = (durationInSeconds) => {
  return formatDuration(durationInSeconds)
}

// Fetch workouts data
const fetchWorkouts = async () => {
  try {
    isLoading.value = true
    const response = await axios.get('/api/workouts')
    
    // Handle the new API format where charts is already an array
    charts.value = response.data.charts || []
    
    // Keep the existing data for the table view (if available)
    workouts.value = response.data.workouts || []
    summary.value = response.data.summary || {}
    
    // Store user query from root level
    userQuery.value = response.data.query || ''
  } catch (err) {
    error.value = 'Failed to load workouts'
    console.error('Error fetching workouts:', err)
  } finally {
    isLoading.value = false
  }
}

// Toggle week expansion
const toggleWeekExpanded = (weekStart) => {
  expandedWeeks.value = {
    ...expandedWeeks.value,
    [weekStart]: !expandedWeeks.value[weekStart]
  }
}

onMounted(fetchWorkouts)

// Format date range for display
const formatWeekRange = (weekStart) => {
  const start = new Date(weekStart)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
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
      <!-- AI Assistant Response Section -->
      <div v-if="userQuery || (charts.length > 0 && charts.some(chart => chart.description))" class="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="max-w-none">
          <!-- User Query Section -->
          <div v-if="userQuery" class="mb-6">
            <p class="text-gray-700 mb-3">
              <span class="font-semibold text-gray-900">I'm your AI Assistant</span>, based on your query:
            </p>
            <div class="bg-gray-50 rounded-md p-3 border border-gray-200">
              <p class="text-gray-800 italic">
                "{{ userQuery }}"
              </p>
            </div>
          </div>
          
          <!-- Dashboard Generation Section -->
          <div v-if="charts.length > 0 && charts.some(chart => chart.description)">
            <p class="text-gray-700 mb-4">
              <span class="font-semibold text-gray-900">I will generate those dashboards for you:</span>
            </p>
            <ol class="list-decimal list-inside space-y-3 text-gray-600">
              <li v-for="(chart, index) in charts.filter(chart => chart.description)" :key="index" class="pl-2">
                {{ chart.description }}
              </li>
            </ol>
          </div>
        </div>
      </div>

      <!-- Charts using AbstractChartRenderer -->
      <div class="mb-8">
        <AbstractChartRenderer :charts="charts" :columns="2" />
      </div>

      <!-- Keep the existing table view for detailed workout data -->
      <div v-if="Object.keys(summary).length > 0">
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
               class="bg-white hover:bg-gray-50 transition-colors">
            <!-- Week Summary Row -->
            <div class="px-6 py-4 grid grid-cols-12 gap-2 cursor-pointer"
                 @click="toggleWeekExpanded(weekStart)">
              
              <div class="col-span-2 text-sm text-gray-900 flex items-center">
                <svg :class="{'rotate-90': expandedWeeks[weekStart]}" 
                     class="h-5 w-5 text-gray-400 mr-2 transform transition-transform duration-200" 
                     viewBox="0 0 20 20" 
                     fill="currentColor">
                  <path fill-rule="evenodd" 
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                        clip-rule="evenodd" />
                </svg>
                {{ formatWeekRange(weekStart) }}
              </div>

              <!-- Total Duration -->
              <div class="col-span-1 text-right text-sm text-gray-900">
                {{ formatDuration(weekData.total_duration_hours * 60 * 60) }}
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
                <div class="flex items-center space-x-3">
                  <div v-if="weekData.zone_1_duration_hours > 0" class="flex items-center">
                    <span class="w-2 h-2 bg-blue-400 rounded-full mr-1"></span>
                    <span class="text-sm text-gray-900">{{ formatZoneDuration(weekData.zone_1_duration_hours * 60 * 60) }}</span>
                  </div>
                  <div v-if="weekData.zone_2_duration_hours > 0" class="flex items-center">
                    <span class="w-2 h-2 bg-teal-400 rounded-full mr-1"></span>
                    <span class="text-sm text-gray-900">{{ formatZoneDuration(weekData.zone_2_duration_hours * 60 * 60) }}</span>
                  </div>
                  <div v-if="weekData.zone_3_duration_hours > 0" class="flex items-center">
                    <span class="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                    <span class="text-sm text-gray-900">{{ formatZoneDuration(weekData.zone_3_duration_hours * 60 * 60) }}</span>
                  </div>
                  <div v-if="weekData.zone_4_duration_hours > 0" class="flex items-center">
                    <span class="w-2 h-2 bg-orange-400 rounded-full mr-1"></span>
                    <span class="text-sm text-gray-900">{{ formatZoneDuration(weekData.zone_4_duration_hours * 60 * 60) }}</span>
                  </div>
                  <div v-if="weekData.zone_5_duration_hours > 0" class="flex items-center">
                    <span class="w-2 h-2 bg-red-400 rounded-full mr-1"></span>
                    <span class="text-sm text-gray-900">{{ formatZoneDuration(weekData.zone_5_duration_hours * 60 * 60) }}</span>
                  </div>
                </div>
              </div>

              <!-- Workout Types -->
              <div class="flex">
                <div class="flex flex-wrap gap-1">
                  <span v-for="type in weekData.workout_types" 
                        :key="type"
                        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                        :class="{
                          'bg-blue-100 text-blue-800': type === 'running',
                          'bg-green-100 text-green-800': type === 'cycling',
                          'bg-red-100 text-red-800': type === 'high_intensity_interval_training',
                          'bg-yellow-100 text-yellow-800': type === 'traditional_strength_training',
                          'bg-purple-100 text-purple-800': type === 'functional_strength_training',
                          'bg-gray-100 text-gray-800': !['running', 'cycling', 'high_intensity_interval_training', 'traditional_strength_training', 'functional_strength_training'].includes(type)
                        }">
                    {{ type.replace(/_/g, ' ') }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Expanded Week Details -->
            <div v-if="expandedWeeks[weekStart]" class="px-6 py-4 bg-gray-50">
              <table class="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr class="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th class="py-3 pr-4">Activity & Time</th>
                    <th class="py-3 px-4">Duration</th>
                    <th class="py-3 px-4">Distance</th>
                    <th class="py-3 px-4">Heart Rate</th>
                    <th class="py-3 px-4">Zones (hours)</th>
                    <th class="py-3 px-4">Energy</th>
                    <th class="py-3 pl-4">Weather</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="workout in weekData.weekly_workouts" 
                      :key="workout._id"
                      class="hover:bg-gray-50">
                    <td class="py-4 pr-4">
                      <div class="text-sm font-medium text-gray-900">
                        {{ workout.activity_type.replace(/_/g, ' ') }}
                      </div>
                      <div class="text-sm text-gray-500">
                        {{ new Date(workout.start_date).toLocaleString() }}
                      </div>
                    </td>
                    <td class="py-4 px-4 text-sm text-gray-900">
                      {{ formatDuration(workout.duration) }}
                    </td>
                    <td class="py-4 px-4 text-sm text-gray-900">
                      {{ workout.total_distance ? `${(workout.total_distance / 1000).toFixed(2)}km` : '-' }}
                    </td>
                    <td class="py-4 px-4 text-sm text-gray-900">
                      {{ Math.round(workout.average_heart_rate) }} bpm
                    </td>
                    <td class="py-4 px-4">
                      <div class="text-sm text-gray-500 flex items-center space-x-3">
                        <div v-for="zone in workout.heart_rate_zones.filter(z => z.duration > 0)" 
                             :key="zone.name" 
                             class="flex items-center">
                          <span class="w-2 h-2 rounded-full mr-1"
                                :class="{
                                  'bg-blue-400': zone.name === 'Zone 1',
                                  'bg-teal-400': zone.name === 'Zone 2',
                                  'bg-green-400': zone.name === 'Zone 3',
                                  'bg-orange-400': zone.name === 'Zone 4',
                                  'bg-red-400': zone.name === 'Zone 5'
                                }"></span>
                          <span class="text-gray-900">{{ formatZoneDuration(zone.duration) }}</span>
                        </div>
                      </div>
                    </td>
                    <td class="py-4 px-4 text-sm text-gray-900">
                      {{ Math.round(workout.total_energy_burned) }} kcal
                    </td>
                    <td class="py-4 pl-4 text-sm text-gray-500">
                      <template v-if="workout.metadata?.HKWeatherTemperature">
                        {{ Math.round(parseFloat(workout.metadata.HKWeatherTemperature)) }}°F
                        <span v-if="workout.metadata?.HKWeatherHumidity">
                          / {{ Math.round(parseInt(workout.metadata.HKWeatherHumidity) / 100) }}%
                        </span>
                      </template>
                      <template v-else>-</template>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 
