<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const workouts = ref([])
const isLoading = ref(true)
const error = ref(null)

// Fetch workouts data
const fetchWorkouts = async () => {
  try {
    isLoading.value = true
    const response = await axios.get('/api/workouts')
    workouts.value = response.data
  } catch (err) {
    error.value = 'Failed to load workouts'
    console.error('Error fetching workouts:', err)
  } finally {
    isLoading.value = false
  }
}

// Group workouts by week
const workoutsByWeek = computed(() => {
  const grouped = {}
  
  workouts.value.forEach(workout => {
    const date = new Date(workout.start_date)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay()) // Set to Sunday
    const weekKey = weekStart.toISOString().split('T')[0]
    
    if (!grouped[weekKey]) {
      grouped[weekKey] = {
        workouts: [],
        totalDuration: 0,
        totalRunningDistance: 0,
        avgHeartRate: 0,
        zoneDistribution: {
          'Zone 1': 0,
          'Zone 2': 0,
          'Zone 3': 0,
          'Zone 4': 0,
          'Zone 5': 0
        },
        typeDistribution: {},
        distanceByType: {}
      }
    }
    
    // Add workout to week
    grouped[weekKey].workouts.push(workout)
    
    // Update statistics
    grouped[weekKey].totalDuration += workout.duration
    
    // Update distances for any activity with distance
    if (workout.total_distance) {
      if (workout.activity_type === 'running') {
        grouped[weekKey].totalRunningDistance += workout.total_distance
      }
      // Track distance by activity type
      grouped[weekKey].distanceByType[workout.activity_type] = 
        (grouped[weekKey].distanceByType[workout.activity_type] || 0) + workout.total_distance
    }
    
    // Update heart rate zones
    workout.heart_rate_zones?.forEach(zone => {
      grouped[weekKey].zoneDistribution[zone.name] += zone.duration
    })
    
    // Update type distribution
    const type = workout.activity_type
    grouped[weekKey].typeDistribution[type] = (grouped[weekKey].typeDistribution[type] || 0) + workout.duration
  })
  
  // Calculate averages and percentages
  Object.values(grouped).forEach(week => {
    // Calculate average heart rate
    week.avgHeartRate = week.workouts.reduce((sum, w) => sum + (w.average_heart_rate || 0), 0) / week.workouts.length
    
    // Convert durations to hours
    week.totalDuration = Math.round(week.totalDuration / 3600 * 10) / 10
    
    // Convert running distance to kilometers (assuming it's in meters)
    week.totalRunningDistance = Math.round(week.totalRunningDistance / 1000 * 10) / 10
    
    // Convert zone durations to hours
    Object.keys(week.zoneDistribution).forEach(zone => {
      week.zoneDistribution[zone] = Math.round(week.zoneDistribution[zone] / 3600 * 10) / 10
    })
    
    // Convert type durations to hours
    Object.keys(week.typeDistribution).forEach(type => {
      week.typeDistribution[type] = Math.round(week.typeDistribution[type] / 3600 * 10) / 10
    })

    // Convert distances to kilometers
    Object.keys(week.distanceByType).forEach(type => {
      week.distanceByType[type] = Math.round(week.distanceByType[type] / 1000 * 10) / 10
    })
  })
  
  return Object.entries(grouped)
    .sort(([a], [b]) => new Date(b) - new Date(a))
})

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
    <h1 class="text-2xl font-bold text-gray-900 mb-8">Workouts</h1>
    
    <div v-if="isLoading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
      <p class="mt-4 text-gray-600">Loading workouts...</p>
    </div>
    
    <div v-else-if="error" class="bg-red-50 p-4 rounded-md">
      <p class="text-red-700">{{ error }}</p>
    </div>
    
    <div v-else class="space-y-8">
      <div v-for="[weekStart, weekData] in workoutsByWeek" :key="weekStart" 
           class="bg-white shadow rounded-lg overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">{{ formatWeekRange(weekStart) }}</h2>
        </div>
        
        <div class="px-6 py-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Summary Stats -->
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-2">Summary</h3>
              <dl class="space-y-1">
                <div class="flex justify-between">
                  <dt class="text-gray-600">Total Duration</dt>
                  <dd class="font-medium text-gray-900">{{ weekData.totalDuration }}h</dd>
                </div>
                <div v-if="weekData.totalRunningDistance > 0" class="flex justify-between">
                  <dt class="text-gray-600">Running Distance</dt>
                  <dd class="font-medium text-gray-900">{{ weekData.totalRunningDistance }}km</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-gray-600">Avg Heart Rate</dt>
                  <dd class="font-medium text-gray-900">{{ Math.round(weekData.avgHeartRate) }} bpm</dd>
                </div>
              </dl>
            </div>
            
            <!-- Heart Rate Zones -->
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-2">Zone Distribution</h3>
              <div class="space-y-1">
                <div v-for="(hours, zone) in weekData.zoneDistribution" 
                     :key="zone" 
                     class="flex items-center">
                  <div class="w-24 text-sm text-gray-600">{{ zone }}</div>
                  <div class="flex-1">
                    <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div class="h-full bg-blue-500 rounded-full" 
                           :style="{ width: `${(hours / Object.values(weekData.zoneDistribution).reduce((a, b) => a + b, 0) * 100)}%` }"></div>
                    </div>
                  </div>
                  <div class="w-16 text-right text-sm text-gray-600">{{ hours }}h</div>
                </div>
              </div>
            </div>
            
            <!-- Activity Types -->
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-2">Activity Types</h3>
              <dl class="space-y-1">
                <div v-for="(hours, type) in weekData.typeDistribution" 
                     :key="type" 
                     class="space-y-0.5">
                  <div class="flex justify-between">
                    <dt class="text-gray-600">{{ type.replace(/_/g, ' ') }}</dt>
                    <dd class="font-medium text-gray-900">{{ hours }}h</dd>
                  </div>
                  <div v-if="weekData.distanceByType[type]" 
                       class="flex justify-end text-sm text-gray-500">
                    {{ weekData.distanceByType[type] }}km
                  </div>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 