<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import PlanCard from '@/components/PlanCard.vue'
import PlanForm from '@/components/PlanForm.vue'
import axios from 'axios'

const plans = ref([])
const isLoading = ref(true)
const error = ref(null)
const showCreateModal = ref(false)
const selectedWeek = ref(0) // 0 for current week, -1 for last week, 1 for next week, etc.
const isCopying = ref(false)

// Format the week for display
const formatWeekRange = (weekOffset) => {
  const today = new Date()
  const monday = new Date(today)
  monday.setDate(today.getDate() - today.getDay() + 1 + (weekOffset * 7))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const formatDate = (date) => {
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}/${day}`
  }

  return `${formatDate(monday)} - ${formatDate(sunday)}`
}

// Add current week range display
const currentWeekRange = computed(() => formatWeekRange(selectedWeek.value))

const weekOptions = computed(() => {
  // Generate options for 4 weeks before and after current week
  const options = []
  for (let i = -4; i <= 4; i++) {
    options.push({
      value: i,
      label: i === 0 ? 'Current Week' : formatWeekRange(i),
      range: formatWeekRange(i)
    })
  }
  return options
})

const fetchPlans = async () => {
  try {
    isLoading.value = true
    const response = await axios.get('/api/plans', {
      params: {
        week: selectedWeek.value
      }
    })
    plans.value = response.data
  } catch (err) {
    error.value = 'Failed to load plans. Please try again later.'
    console.error('Error fetching plans:', err)
  } finally {
    isLoading.value = false
  }
}

const handleCreatePlan = async (planData) => {
  try {
    await axios.post('/api/plans', planData)
    showCreateModal.value = false
    await fetchPlans()
  } catch (err) {
    console.error('Error creating plan:', err)
    // You might want to show an error message to the user here
  }
}

// Add function to copy plans from previous week
const copyFromPreviousWeek = async () => {
  try {
    isCopying.value = true
    await axios.post('/api/plans/copy_from_previous_week', {
      week: selectedWeek.value
    })
    await fetchPlans() // Refresh the plans after copying
  } catch (err) {
    error.value = 'Failed to copy plans. Please try again later.'
    console.error('Error copying plans:', err)
  } finally {
    isCopying.value = false
  }
}

// Watch for week changes
watch(selectedWeek, () => {
  fetchPlans()
})

onMounted(() => {
  fetchPlans()
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex justify-between items-start mb-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Week Plans</h1>
          <p class="mt-2 text-sm text-gray-600">
            Track and manage your plans.
          </p>
        </div>
        <div class="flex space-x-3">
          <button
            @click="copyFromPreviousWeek"
            :disabled="isCopying"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg 
              class="-ml-1 mr-2 h-5 w-5 text-gray-500" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            {{ isCopying ? 'Copying...' : 'Copy Previous Week' }}
          </button>
          <button
            @click="showCreateModal = true"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg 
              class="-ml-1 mr-2 h-5 w-5" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M12 4v16m8-8H4" 
              />
            </svg>
            Create Plan
          </button>
        </div>
      </div>

      <!-- Week Selector -->
      <div class="flex items-center justify-center w-full max-w-xs mx-auto mb-8">
        <button
          @click="selectedWeek--"
          class="p-2 text-gray-600 hover:text-gray-800 focus:outline-none transition-colors duration-150"
          :disabled="selectedWeek <= -4"
          :class="{ 'opacity-50 cursor-not-allowed': selectedWeek <= -4 }"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div class="relative flex-1 mx-4">
          <button
            @click="$refs.weekSelect.click()"
            class="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
          >
            {{ currentWeekRange }}
            <svg 
              class="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <select
            ref="weekSelect"
            v-model="selectedWeek"
            class="absolute inset-0 w-full opacity-0 cursor-pointer"
          >
            <option
              v-for="option in weekOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.value === 0 ? 'Current Week' : option.range }}
            </option>
          </select>
        </div>

        <button
          @click="selectedWeek++"
          class="p-2 text-gray-600 hover:text-gray-800 focus:outline-none transition-colors duration-150"
          :disabled="selectedWeek >= 4"
          :class="{ 'opacity-50 cursor-not-allowed': selectedWeek >= 4 }"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center min-h-[300px]">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-700"
    >
      {{ error }}
    </div>

    <!-- Plans Grid -->
    <div
      v-else
      class="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <template v-if="plans.length > 0">
        <div v-for="plan in plans" :key="plan._id">
          <PlanCard :plan="plan" @update="fetchPlans" />
        </div>
      </template>
      
      <!-- Empty State -->
      <div
        v-else
        class="col-span-2 bg-white rounded-lg border border-gray-200 p-8 text-center"
      >
        <h3 class="text-lg font-medium text-gray-900 mb-2">No Training Plans Yet</h3>
        <p class="text-gray-600 mb-4">
          Get started by creating your first training plan to track your fitness goals.
        </p>
        <button
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          @click="showCreateModal = true"
        >
          Create New Plan
        </button>
      </div>
    </div>

    <!-- Create Plan Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-900">Create New Plan</h2>
          <button
            @click="showCreateModal = false"
            class="text-gray-400 hover:text-gray-500"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <PlanForm
          @submit="handleCreatePlan"
          @cancel="showCreateModal = false"
        />
      </div>
    </div>
  </div>
</template> 