<script setup>
import { ref, onMounted } from 'vue'
import PlanCard from '@/components/PlanCard.vue'
import PlanForm from '@/components/PlanForm.vue'
import axios from 'axios'

const plans = ref([])
const isLoading = ref(true)
const error = ref(null)
const showCreateModal = ref(false)

const fetchPlans = async () => {
  try {
    isLoading.value = true
    const response = await axios.get('/api/plans')
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

onMounted(() => {
  fetchPlans()
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Current Week Plans</h1>
        <p class="mt-2 text-sm text-gray-600">
          Track and manage your plans.
        </p>
      </div>
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