<template>
  <div class="w-full h-full">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="text-lg font-medium text-gray-900">{{ goal.title }}</h3>
        <div class="flex items-center space-x-4 mt-1 text-sm text-gray-600">
          <span>🎯 Target: {{ new Date(goal.target_date).toLocaleDateString() }}</span>
          <span v-if="predictedAchieveDate" class="text-orange-600">
            📅 Predicted Achieve Date: {{ predictedAchieveDate.toLocaleDateString() }}
          </span>
          <span v-if="goal.average_speed" class="text-blue-600">
            📈 Speed: {{ goal.average_speed }} {{ goal.unit }}/day
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
    <div class="mt-4 flex flex-wrap gap-6 text-sm">
      <div class="flex items-center">
        <div class="w-4 h-0.5 bg-blue-500 mr-2"></div>
        <span class="text-gray-700">Progress Records</span>
      </div>
      <div v-if="goal.progress_records && goal.progress_records.length > 0" class="flex items-center">
        <div class="w-4 h-0.5 bg-orange-400 mr-2" style="border-top: 2px dashed rgb(251, 146, 60);"></div>
        <span class="text-gray-700">Prediction</span>
      </div>
      <div class="flex items-center">
        <div class="w-4 h-0.5 bg-green-500 mr-2" style="border-top: 2px dotted rgb(34, 197, 94);"></div>
        <span class="text-gray-700">Target</span>
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
    const initialDate = new Date(props.goal['created_at'])
    const targetDate = new Date(props.goal.target_date)
    
    return {
      datasets: [
        {
          label: 'Progress Records',
          data: [{
            x: initialDate,
            y: props.goal['initial_value']
          }],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgb(59, 130, 246)',
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: 'Target',
          data: [
            {
              x: initialDate,
              y: props.goal.target
            },
            {
              x: targetDate,
              y: props.goal.target
            }
          ],
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgb(34, 197, 94)',
          borderWidth: 2,
          borderDash: [2, 2],
          pointRadius: 0,
          pointHoverRadius: 0
        }
      ]
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
  // Handle achieve_date vs target_date relationship
  if (achieve_date) {
    const achieveDate = new Date(achieve_date)
    const targetDate = new Date(props.goal.target_date)
    
    if (achieveDate < targetDate) {
      // Case 1: achieve_date is before target_date
      // Push achieve_date with target value
      timeData.push({
        x: achieveDate,
        y: target
      })
      // Push target_date with target value (horizontal line)
      timeData.push({
        x: targetDate,
        y: target
      })
    } else if (achieveDate > targetDate) {
      // Case 2: achieve_date is after target_date
      // Calculate value at target_date using average speed
      if (props.goal.average_speed && props.goal.average_speed > 0) {
        const lastRecord = sortedRecords[sortedRecords.length - 1]
        const lastRecordDate = new Date(lastRecord.date)
        const lastRecordValue = parseFloat(lastRecord.value)
        
        // Calculate days from last record to target_date
        const daysToTarget = Math.floor((targetDate - lastRecordDate) / (1000 * 60 * 60 * 24))
        
        // Calculate value at target_date using average speed
        const valueAtTargetDate = lastRecordValue + (props.goal.average_speed * daysToTarget)
        
        // Push calculated value at target_date
        timeData.push({
          x: targetDate,
          y: Math.min(valueAtTargetDate, target) // Don't exceed target
        })
      } else {
        // No average speed, just use last record value
        const lastRecord = sortedRecords[sortedRecords.length - 1]
        timeData.push({
          x: targetDate,
          y: parseFloat(lastRecord.value)
        })
      }
    } else {
      // Case 3: achieve_date equals target_date
      timeData.push({
        x: achieveDate,
        y: target
      })
    }
  }

  console.log('Time-based data:', timeData)
  
  // Create three separate datasets like in the reference image
  const progressRecordsData = []
  const predictionData = []
  const targetData = []
  
  // Add initial point (created_at)
  const initialDate = new Date(props.goal['created_at'])
  const targetDate = new Date(props.goal.target_date)
  
  progressRecordsData.push({
    x: initialDate,
    y: props.goal['initial_value']
  })
  predictionData.push({
    x: initialDate,
    y: props.goal['initial_value']
  })
  targetData.push({
    x: initialDate,
    y: props.goal.target
  })
  
  // Add progress records
  sortedRecords.forEach(record => {
    const recordDate = new Date(record.date)
    const recordValue = parseFloat(record.value)
    
    progressRecordsData.push({
      x: recordDate,
      y: recordValue
    })
    predictionData.push({
      x: recordDate,
      y: recordValue
    })
    targetData.push({
      x: recordDate,
      y: props.goal.target
    })
  })
  
  // Calculate prediction line using average speed
  if (props.goal.average_speed && props.goal.average_speed > 0 && sortedRecords.length > 0) {
    const lastRecord = sortedRecords[sortedRecords.length - 1]
    const lastRecordDate = new Date(lastRecord.date)
    const lastRecordValue = parseFloat(lastRecord.value)
    
    // Generate prediction points from last record to target date
    const currentDate = new Date(lastRecordDate)
    while (currentDate <= targetDate) {
      currentDate.setDate(currentDate.getDate() + 1)
      if (currentDate <= targetDate) {
        const daysFromLastRecord = Math.floor((currentDate - lastRecordDate) / (1000 * 60 * 60 * 24))
        const predictedValue = lastRecordValue + (props.goal.average_speed * daysFromLastRecord)
        
        predictionData.push({
          x: new Date(currentDate),
          y: Math.min(predictedValue, props.goal.target)
        })
        targetData.push({
          x: new Date(currentDate),
          y: props.goal.target
        })
      }
    }
  }
  
  return {
    datasets: [
      {
        label: 'Progress Records',
        data: progressRecordsData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgb(59, 130, 246)',
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Prediction',
        data: predictionData,
        borderColor: 'rgb(251, 146, 60)',
        backgroundColor: 'rgb(251, 146, 60)',
        borderDash: [5, 5],
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Target',
        data: targetData,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgb(34, 197, 94)',
        borderWidth: 2,
        borderDash: [2, 2],
        pointRadius: 0,
        pointHoverRadius: 0
      }
    ]
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
