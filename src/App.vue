<script setup>
import { ref, onMounted } from 'vue'
import { planService } from './services/planService'
import PlanCard from './components/PlanCard.vue'
import PlanForm from './components/PlanForm.vue'

const plans = ref([])
const loading = ref(true)
const error = ref(null)
const showNewPlanForm = ref(false)

const fetchPlans = async () => {
  try {
    loading.value = true
    const data = await planService.getPlans()
    plans.value = data
  } catch (err) {
    error.value = 'Failed to load plans. Please try again later.'
  } finally {
    loading.value = false
  }
}

const handleCreatePlan = async (planData) => {
  try {
    await planService.createPlan(planData)
    await fetchPlans()
    showNewPlanForm.value = false
  } catch (err) {
    error.value = 'Failed to create plan. Please try again.'
  }
}

onMounted(fetchPlans)
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Your Plans</h1>
        <button
          @click="showNewPlanForm = true"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Create New Plan
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center min-h-[400px]">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex flex-col items-center justify-center min-h-[400px]">
        <p class="text-red-600 mb-4">{{ error }}</p>
        <button
          @click="fetchPlans"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="plans.length === 0" class="text-center py-12">
        <h3 class="text-xl font-medium text-gray-600 mb-4">No plans yet</h3>
        <p class="text-gray-500 mb-6">Create your first plan to start tracking your progress!</p>
        <button
          @click="showNewPlanForm = true"
          class="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Create Your First Plan
        </button>
      </div>

      <!-- Plans Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PlanCard
          v-for="plan in plans"
          :key="plan.id"
          :plan="plan"
          @click="$router.push(`/${plan.id}`)"
        />
      </div>

      <!-- New Plan Modal -->
      <div v-if="showNewPlanForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div class="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Create New Plan</h2>
            <button
              @click="showNewPlanForm = false"
              class="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <PlanForm
            @submit="handleCreatePlan"
            @cancel="showNewPlanForm = false"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@import '@/assets/tailwind.css';

body {
  margin: 0;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}
</style>
