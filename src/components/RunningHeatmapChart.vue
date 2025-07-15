<template>
  <div class="w-full h-full bg-white p-4">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-medium text-gray-900">Year Running Distance Activity</h3>
      <span class="text-sm text-gray-600">Total: {{ totalDistance }} km</span>
    </div>
    
    <div class="heatmap-container">
      <!-- Month labels -->
      <div class="month-labels">
        <div v-for="month in monthLabels" :key="month.name" class="month-label" :style="{ left: `${month.offset}px`, width: `${month.width}px` }">
          {{ month.name }}
        </div>
      </div>
      
      <!-- Day labels and heatmap grid -->
      <div class="heatmap-grid" ref="heatmapContainer">
        <!-- Day labels -->
        <div class="day-labels">
          <div></div> <!-- Empty space for corner -->
          <div class="day-label">Mon</div>
          <div></div>
          <div class="day-label">Wed</div>
          <div></div>
          <div class="day-label">Fri</div>
          <div></div>
        </div>
        
        <!-- Heatmap squares -->
        <div class="heatmap-squares">
          <div 
            v-for="(week, weekIndex) in calendarWeeks" 
            :key="weekIndex"
            class="week-column"
          >
            <div
              v-for="(day, dayIndex) in week"
              :key="dayIndex"
              class="day-square"
              :class="getIntensityClass(day)"
              @mouseenter="showTooltip($event, day)"
              @mouseleave="hideTooltip"
            >
            </div>
          </div>
        </div>
        
        <!-- Custom Tooltip -->
        <div
          v-if="tooltip.show"
          class="custom-tooltip"
          :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
        >
          {{ tooltip.text }}
        </div>
      </div>
      
      <!-- Legend -->
      <div class="legend">
        <span class="legend-text">Less</span>
        <div class="legend-squares">
          <div class="legend-square intensity-0"></div>
          <div class="legend-square intensity-1"></div>
          <div class="legend-square intensity-2"></div>
          <div class="legend-square intensity-3"></div>
          <div class="legend-square intensity-4"></div>
        </div>
        <span class="legend-text">More</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'

const props = defineProps({
  yearlyRunningData: {
    type: Object,
    required: true
  }
})

// Convert array of {date: meters} to map
const runningDataMap = computed(() => {
  if (!props.yearlyRunningData || !props.yearlyRunningData.values) return {}
  const map = {}
  props.yearlyRunningData.values.forEach(item => {
    const date = Object.keys(item)[0]
    const meters = Object.values(item)[0]
    map[date] = { value: meters }
  })
  return map
})

// Template ref
const heatmapContainer = ref(null)

// Tooltip state
const tooltip = reactive({
  show: false,
  x: 0,
  y: 0,
  text: ''
})

// Convert meters to kilometers
const metersToKm = (meters) => {
  return Math.round((meters / 1000) * 100) / 100
}

// Get the start and end dates for the year
const getYearRange = () => {
  const now = new Date()
  const startDate = new Date(now.getFullYear(), 0, 1) // January 1st
  const endDate = new Date(now.getFullYear(), 11, 31) // December 31st
  return { startDate, endDate }
}

// Calculate intensity level based on distance
const getIntensityLevel = (distance) => {
  if (!distance || distance === 0) return 0
  const km = metersToKm(distance)
  if (km < 2) return 1
  if (km < 4) return 2
  if (km < 6) return 3
  return 4
}

// Get intensity class for styling
const getIntensityClass = (day) => {
  if (!day || !day.date) return 'intensity-0'
  const data = runningDataMap.value[day.date]
  const level = data ? getIntensityLevel(data.value) : 0
  return `intensity-${level}`
}

// Get tooltip text
const getTooltipText = (day) => {
  if (!day || !day.date) return ''
  const data = runningDataMap.value[day.date]
  const dateStr = new Date(day.date).toLocaleDateString()
  if (data) {
    const km = metersToKm(data.value)
    return `${dateStr}: ${km} km`
  }
  return `${dateStr}: No running data`
}

// Show tooltip
const showTooltip = (event, day) => {
  tooltip.text = getTooltipText(day)
  
  if (heatmapContainer.value) {
    const rect = heatmapContainer.value.getBoundingClientRect()
    tooltip.x = event.clientX - rect.left + 10
    tooltip.y = event.clientY - rect.top - 30
  } else {
    tooltip.x = event.offsetX + 10
    tooltip.y = event.offsetY - 30
  }
  
  tooltip.show = true
}

// Hide tooltip
const hideTooltip = () => {
  tooltip.show = false
}

// Generate calendar weeks
const calendarWeeks = computed(() => {
  const { startDate, endDate } = getYearRange()
  const weeks = []
  const current = new Date(startDate)
  
  // Move to the first Sunday of the year or the Sunday before Jan 1
  const firstSunday = new Date(current)
  firstSunday.setDate(current.getDate() - current.getDay())
  
  current.setTime(firstSunday.getTime())
  
  while (current <= endDate) {
    const week = []
    for (let i = 0; i < 7; i++) {
      const dateStr = current.toISOString().split('T')[0]
      week.push({
        date: dateStr,
        isCurrentYear: current.getFullYear() === startDate.getFullYear()
      })
      current.setDate(current.getDate() + 1)
    }
    weeks.push(week)
    
    // Break if we've gone too far into the next year
    if (weeks.length > 54) break
  }
  
  return weeks
})

// Calculate total distance
const totalDistance = computed(() => {
  const total = Object.values(runningDataMap.value).reduce((sum, data) => {
    return sum + (data.value || 0)
  }, 0)
  return metersToKm(total)
})

// Generate month labels
const monthLabels = computed(() => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const squareSize = 12 // 12px square
  const gap = 4 // 4px gap
  const dayLabelWidth = 32 // Width of day labels
  const monthData = []
  
  months.forEach((month, index) => {
    const weeksInMonth = calendarWeeks.value.reduce((count, week, weekIndex) => {
      const firstDay = new Date(week[0].date)
      const lastDay = new Date(week[6].date)
      if (firstDay.getMonth() === index || lastDay.getMonth() === index) {
        if (count === 0) {
          // First week for this month, record the starting week index
          monthData.push({
            name: month,
            startWeek: weekIndex,
            weeks: 1
          })
        } else {
          // Increment weeks for existing month
          monthData[monthData.length - 1].weeks++
        }
        return count + 1
      }
      return count
    }, 0)
  })
  
  // Calculate positions
  return monthData.map(month => ({
    name: month.name,
    offset: dayLabelWidth + (month.startWeek * (squareSize + gap)),
    width: (month.weeks * (squareSize + gap)) - gap
  }))
})
</script>

<style scoped>
.heatmap-container {
  @apply font-mono text-xs;
}

.month-labels {
  @apply relative mb-2;
  height: 20px;
}

.month-label {
  @apply text-gray-600 text-center text-xs absolute;
  font-size: 11px;
}

.heatmap-grid {
  @apply flex relative;
  gap: 4px;
}

.day-labels {
  @apply flex flex-col mr-2;
  gap: 4px;
}

.day-label {
  @apply text-gray-600 text-right;
  width: 28px;
  height: 12px;
  line-height: 12px;
}

.heatmap-squares {
  @apply flex;
  gap: 4px;
}

.week-column {
  @apply flex flex-col;
  gap: 4px;
}

.day-square {
  @apply rounded-sm border border-gray-200 cursor-pointer;
  width: 12px;
  height: 12px;
  transition: all 0.2s ease;
}

.day-square:hover {
  @apply border-gray-400;
  transform: scale(1.1);
}

.intensity-0 {
  @apply bg-gray-100;
}

.intensity-1 {
  @apply bg-green-200;
}

.intensity-2 {
  @apply bg-green-300;
}

.intensity-3 {
  @apply bg-green-500;
}

.intensity-4 {
  @apply bg-green-700;
}

.legend {
  @apply flex items-center justify-end gap-2 mt-4;
}

.legend-text {
  @apply text-gray-600 text-xs;
}

.legend-squares {
  @apply flex;
  gap: 4px;
}

.legend-square {
  @apply rounded-sm border border-gray-200;
  width: 12px;
  height: 12px;
}

.custom-tooltip {
  @apply absolute bg-gray-900 text-white text-xs rounded px-2 py-1 pointer-events-none z-10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  white-space: nowrap;
}
</style> 