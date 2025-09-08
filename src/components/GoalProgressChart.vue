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
        <span class="text-gray-700">Progress Records</span>
      </div>
      <div v-if="goal.achieve_date" class="flex items-center">
        <div class="w-4 h-0.5 bg-blue-500 mr-2" style="border-top: 2px dotted rgb(59, 130, 246);"></div>
        <span class="text-gray-700">To Achieve Date</span>
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
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import 'chartjs-adapter-date-fns'
import zoomPlugin from 'chartjs-plugin-zoom'
import { Line } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
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
  const { progress_records, achieve_date, target } = props.goal
  // console.log('Complete goal object:', props.goal)
  // console.log('Goal fields:', Object.keys(props.goal))
  // console.log('Goal fields:', props.goal['initial_value'])

  // Handle case where there are no progress records
  if (!progress_records || progress_records.length === 0) {
    return {
      labels: ['No Data'],
      datasets: [{
        label: 'Progress',
        data: [0],
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
  
  // Prepare time-based data arrays
  // Create time-based data points
  const timeData = []
  
  // Add initial point (created_at)
  timeData.push({
    x: new Date(props.goal['created_at']),
    y: props.goal['initial_value']
  })
  
  // Add progress records
  sortedRecords.forEach(record => {
    timeData.push({
      x: new Date(record.date),
      y: parseFloat(record.value)
    })
  })
  
  // Add achieve date if exists
  if (achieve_date) {
    timeData.push({
      x: new Date(achieve_date),
      y: target
    })
  }

  console.log('Time-based data:', timeData)
  
  return {
    datasets: [{
      label: 'Progress',
      data: timeData,
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      pointRadius: 6,
      pointHoverRadius: 8
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
        // label: (context) => {
        //   const value = context.raw
        //   const unit = props.goal.unit
        //   const index = context.dataIndex
        //   const progressRecordsLength = props.goal.progress_records?.length || 0
        //   const isActual = index <= progressRecordsLength
        //   const isAchieveDate = index === progressRecordsLength && props.goal.achieve_date
          
        //   if (value === null) return null
          
        //   let type = 'Progress'
        //   if (isActual) {
        //     type = 'Actual'
        //   } else if (isAchieveDate) {
        //     type = 'Predict Achieve Date'
        //   }
          
        //   return `${type}: ${value} ${unit}`
        // },
        // afterLabel: (context) => {
        //   const date = context.label
        //   const targetDate = new Date(props.goal.target_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        //   const achieveDate = props.goal.achieve_date ? new Date(props.goal.achieve_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : null
        //   const predictedDate = predictedAchieveDate.value ? predictedAchieveDate.value.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : null
          
        //   if (date === targetDate) {
        //     return '🎯 Target Date'
        //   } else if (achieveDate && date === achieveDate) {
        //     return '✅ Achieved Date'
        //   } else if (predictedDate && date === predictedDate) {
        //     return '📅 Predicted Achieve Date'
        //   }
        //   return null
        // }
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
      type: 'time',
      time: {
        displayFormats: {
          day: 'MMM dd',
          week: 'MMM dd',
          month: 'MMM yyyy'
        }
      },
      title: {
        display: true,
        text: 'Date'
      },
      grid: {
        display: true
      },
      ticks: {
        maxRotation: 45,
        minRotation: 45
      }
    }
  }
}
</script>
