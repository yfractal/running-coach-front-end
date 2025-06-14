<script setup>
import { ref, onMounted } from 'vue'
import { planService } from '@/services/planService'
import PlanCard from '@/components/PlanCard.vue'
import PlanInlineForm from '@/components/PlanInlineForm.vue'

const plans = ref([])
const isLoading = ref(true)
const error = ref(null)
const showCreateModal = ref(false)

const fetchPlans = async () => {
  try {
    isLoading.value = true
    error.value = null
    plans.value = await planService.getPlans()
  } catch (err) {
    console.error('Failed to fetch plans:', err)
    error.value = 'Failed to load plans. Please try again.'
  } finally {
    isLoading.value = false
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

const handleCreatePlan = async (newPlan) => {
  try {
    await planService.createPlan(newPlan)
    await fetchPlans()
    showCreateModal.value = false
  } catch (error) {
    console.error('Failed to create plan:', error)
    alert('Failed to create plan. Please try again.')
  }
}

onMounted(fetchPlans)
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Running Plans</h1>
      <button
        @click="showCreateModal = true"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Create New Plan
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">Loading plans...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-600">{{ error }}</p>
      <button
        @click="fetchPlans"
        class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="plans.length === 0" class="text-center py-12">
      <p class="text-gray-600 mb-4">No plans yet. Create your first running plan!</p>
      <button
        @click="showCreateModal = true"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Create New Plan
      </button>
    </div>

    <!-- Plans List -->
    <div v-else-if="plans.length > 0" class="space-y-4">
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

    <!-- Create Plan Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-4 border-b flex justify-between items-center">
          <h2 class="text-xl font-semibold text-gray-900">Create New Plan</h2>
          <button
            @click="showCreateModal = false"
            class="text-gray-400 hover:text-gray-500"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-4">
          <PlanInlineForm
            :plan="{
              name: '',
              description: '',
              start_date: new Date().toISOString().split('T')[0],
              duration_type: 'weekly',
              duration_value: 1,
              quality: '',
              unit: '',
              sub_quality: '',
              sub_unit: '',
              status: 'active'
            }"
            @save="handleCreatePlan"
            @cancel="showCreateModal = false"
          />
        </div>
      </div>
    </div>
  </div>
</template> 