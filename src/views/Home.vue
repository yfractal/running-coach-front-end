<script setup>
import { ref, onMounted } from 'vue'
import { planService } from '@/services/planService'
import PlanCard from '@/components/PlanCard.vue'
import PlanForm from '@/components/PlanForm.vue'

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

const handleRecordAdded = async () => {
  await fetchPlans()
}

const handlePlanDeleted = async (planId) => {
  plans.value = plans.value.filter(plan => plan._id !== planId)
}

const handlePlanUpdated = (updatedPlan) => {
  const index = plans.value.findIndex(p => p._id === updatedPlan._id)
  if (index !== -1) {
    plans.value[index] = updatedPlan
  }
}

onMounted(fetchPlans)
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Your Plans</h1>
      <button
        @click="showNewPlanForm = true"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Create New Plan
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex flex-col items-center justify-center py-12">
      <p class="text-red-600 mb-4">{{ error }}</p>
      <button
        @click="fetchPlans"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
      >
        Retry
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="plans.length === 0" class="text-center py-12">
      <p class="text-gray-500">No plans yet. Create your first plan to get started!</p>
    </div>

    <!-- Plans List -->
    <div v-else class="flex flex-col gap-4">
      <PlanCard
        v-for="plan in plans"
        :key="plan._id"
        :plan="plan"
        @record-added="handleRecordAdded"
        @deleted="handlePlanDeleted"
        @updated="handlePlanUpdated"
        class="w-full"
      />
    </div>

    <!-- New Plan Modal -->
    <div v-if="showNewPlanForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold">Create New Plan</h2>
          <button
            @click="showNewPlanForm = false"
            class="text-gray-400 hover:text-gray-500"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <PlanForm
          @submit="handleCreatePlan"
          @cancel="showNewPlanForm = false"
        />
      </div>
    </div>
  </div>
</template> 