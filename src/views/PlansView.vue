<script setup>
import { ref, onMounted } from 'vue'
import PlanCard from '@/components/PlanCard.vue'
import axios from 'axios'

const plans = ref([])
const isLoading = ref(true)
const error = ref(null)

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

onMounted(() => {
  fetchPlans()
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Current Week Plans</h1>
      <p class="mt-2 text-sm text-gray-600">
        Track and manage your plans.
      </p>
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
          @click="$emit('create-plan')"
        >
          Create New Plan
        </button>
      </div>
    </div>
  </div>
</template> 