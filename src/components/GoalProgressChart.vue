<template>
  <div class="w-full h-full">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="text-lg font-medium text-gray-900">{{ goal.title }}</h3>
        <div class="flex items-center space-x-4 mt-1 text-sm text-gray-600">
          <span>🎯 Target: {{ new Date(goal.target_date).toLocaleDateString() }}</span>
          <span v-if="predictedAchieveDate" class="text-orange-600">
            📅 Predicted: {{ predictedAchieveDate.toLocaleDateString() }}
          </span>
          <span v-if="goal.achieve_date" class="text-green-600">
            ✅ Achieved: {{ new Date(goal.achieve_date).toLocaleDateString() }}
          </span>
          <span v-if="goal.average_speed" class="text-blue-600">
            📈 Speed: {{ goal.average_speed }}/day
          </span>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <span class="text-sm text-gray-600">{{ goal.progress_percentage }}% complete</span>
        <span class="text-sm text-gray-500">•</span>
        <span class="text-sm text-gray-600">{{ goal.current_value }}/{{ goal.target }} {{ goal.unit }}</span>
      </div>
    </div>
    
    <div class="relative w-full h-[400px]">
      <Line
        ref="chartRef"
        :data="chartData"
        :options="chartOptions"
      />
    </div>
    
    <!-- Chart Legend -->
    <div class="mt-4 flex flex-wrap gap-4 text-sm">
      <div class="flex items-center">
        <div class="w-4 h-0.5 bg-blue-500 mr-2"></div>
        <span class="text-gray-700">Actual Progress</span>
      </div>
      <div v-if="goal.average_speed" class="flex items-center">
        <div class="w-4 h-0.5 bg-blue-500 mr-2" style="border-top: 2px dotted rgb(59, 130, 246);"></div>
        <span class="text-gray-700">Prediction (Average Speed)</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom'
import { Line } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
)

const props = defineProps({
  goal: {
    type: Object,
    required: true
  }
})

const chartRef = ref(null)

// Calculate predicted achieve date based on average speed
const predictedAchieveDate = computed(() => {
  const { progress_records, target, average_speed } = props.goal
  
  if (!average_speed || average_speed <= 0 || !progress_records || progress_records.length === 0) {
    return null
  }
  
  const sortedRecords = [...progress_records].sort((a, b) => new Date(a.date) - new Date(b.date))
  const lastRecord = sortedRecords[sortedRecords.length - 1]
  const lastRecordValue = parseFloat(lastRecord.value)
  
  const remainingValue = target - lastRecordValue
  if (remainingValue <= 0) return null
  
  const daysToComplete = Math.ceil(remainingValue / average_speed)
  const predictedDate = new Date(lastRecord.date)
  predictedDate.setDate(predictedDate.getDate() + daysToComplete)
  
  return predictedDate
})

// Process chart data
const chartData = computed(() => {
  const { progress_records, target_date, initial_value, target, average_speed } = props.goal
  
  // Handle case where there are no progress records
  if (!progress_records || progress_records.length === 0) {
    return {
      labels: ['No Data'],
      datasets: [{
        label: 'Progress',
        data: [initial_value],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8
      }]
    }
  }
  
  // Sort progress records by date
  const sortedRecords = [...progress_records].sort((a, b) => new Date(a.date) - new Date(b.date))
  
  // Prepare data arrays
  const allLabels = []
  const allData = []
  const allBorderDash = []
  
  // Add actual progress records (solid line)
  sortedRecords.forEach(record => {
    allLabels.push(new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }))
    allData.push(parseFloat(record.value))
    allBorderDash.push(false) // solid line for actual data
  })
  
  // Add prediction line based on average speed (dotted line)
  if (average_speed && average_speed > 0) {
    const lastRecord = sortedRecords[sortedRecords.length - 1]
    const lastRecordValue = parseFloat(lastRecord.value)
    const lastRecordDate = new Date(lastRecord.date)
    
    // Calculate how many days needed to reach target
    const remainingValue = target - lastRecordValue
    if (remainingValue > 0) {
      const daysToComplete = Math.ceil(remainingValue / average_speed)
      
      // Add prediction points (daily intervals)
      for (let day = 1; day <= daysToComplete; day++) {
        const futureDate = new Date(lastRecordDate)
        futureDate.setDate(futureDate.getDate() + day)
        
        const projectedValue = lastRecordValue + (average_speed * day)
        const finalValue = Math.min(projectedValue, target)
        
        allLabels.push(futureDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }))
        allData.push(finalValue)
        allBorderDash.push(true) // dotted line for predictions
        
        // Stop when we reach the target
        if (finalValue >= target) break
      }
    }
  }
  
  return {
    labels: allLabels,
    datasets: [{
      label: 'Progress',
      data: allData,
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      pointRadius: (context) => {
        // Larger points for actual records, smaller for predictions
        const index = context.dataIndex
        return index < sortedRecords.length ? 6 : 3
      },
      pointHoverRadius: (context) => {
        const index = context.dataIndex
        return index < sortedRecords.length ? 8 : 5
      },
      segment: {
        borderDash: (context) => {
          // Solid line for actual data, dotted for predictions
          const index = context.p1DataIndex
          return index < sortedRecords.length ? [] : [5, 5]
        }
      }
    }]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      display: false // We'll show custom legend below chart
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const value = context.raw
          const unit = props.goal.unit
          const index = context.dataIndex
          const isActual = index < (props.goal.progress_records?.length || 0)
          
          if (value === null) return null
          
          const type = isActual ? 'Actual' : 'Predicted'
          return `${type}: ${value} ${unit}`
        },
        afterLabel: (context) => {
          const date = context.label
          const targetDate = new Date(props.goal.target_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
          const achieveDate = props.goal.achieve_date ? new Date(props.goal.achieve_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : null
          const predictedDate = predictedAchieveDate.value ? predictedAchieveDate.value.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : null
          
          if (date === targetDate) {
            return '🎯 Target Date'
          } else if (achieveDate && date === achieveDate) {
            return '✅ Achieved Date'
          } else if (predictedDate && date === predictedDate) {
            return '📅 Predicted Achieve Date'
          }
          return null
        }
      }
    },
    zoom: {
      pan: {
        enabled: true,
        mode: 'x',
        modifierKey: 'ctrl',
      },
      zoom: {
        wheel: {
          enabled: true,
          modifierKey: 'ctrl',
        },
        drag: {
          enabled: true,
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          borderColor: 'rgb(79, 70, 229)',
          borderWidth: 1,
        },
        mode: 'x',
      }
    }
  },
  scales: {
    y: {
      beginAtZero: false,
      title: {
        display: true,
        text: `Progress (${props.goal.unit})`
      },
      ticks: {
        callback: (value) => `${value} ${props.goal.unit}`
      }
    },
    x: {
      grid: {
        display: false
      },
      ticks: {
        maxRotation: 45,
        minRotation: 45
      }
    }
  }
}
</script>
