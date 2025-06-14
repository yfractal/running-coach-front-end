<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import RecordForm from './RecordForm.vue'
import { planService } from '@/services/planService'

const router = useRouter()
const showRecordForm = ref(false)
const isSubmitting = ref(false)

const props = defineProps({
  plan: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['recordAdded'])

const daysLeft = computed(() => {
  return Math.max(0, Math.ceil((new Date(props.plan.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
})

const statusColor = computed(() => {
  switch (props.plan.status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'completed':
      return 'bg-blue-100 text-blue-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
})

const handleCardClick = () => {
  console.log(props.plan);
  if (props.plan?._id) {
    router.push({ name: 'PlanDetails', params: { id: props.plan._id } })
  }
}

const handleAddRecord = () => {
  showRecordForm.value = true
}

const handleRecordSubmit = async (record) => {
  try {
    isSubmitting.value = true
    console.log('Creating record:', record)
    const newRecord = await planService.createPlanRecord(props.plan._id, record)
    console.log('Record created:', newRecord)
    emit('recordAdded', newRecord)
    showRecordForm.value = false
  } catch (error) {
    console.error('Failed to create record:', error)
    alert('Failed to create record. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="relative">
    <div 
      class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer" 
      @click="handleCardClick"
    >
      <div class="flex justify-between items-start mb-4">
        <h3 class="text-xl font-semibold text-gray-900">{{ plan.name }}</h3>
        <span :class="['px-2 py-1 text-sm font-medium rounded-full', statusColor]">
          {{ plan.status }}
        </span>
      </div>
      
      <div class="space-y-2">
        <p class="text-gray-600">
          Target: {{ plan.quality }} {{ plan.unit }}
        </p>
        <p v-if="plan.sub_quality" class="text-gray-600">
          {{ plan.sub_quality }} {{ plan.sub_unit }} per {{ plan.duration_type }}
        </p>
        <div class="flex justify-between text-sm text-gray-500">
          <span>Started: {{ new Date(plan.start_date).toLocaleDateString() }}</span>
          <span>{{ daysLeft }} days left</span>
        </div>
      </div>

      <p v-if="plan.description" class="mt-4 text-gray-600 text-sm line-clamp-2">
        {{ plan.description }}
      </p>
    </div>

    <!-- Add Record Button -->
    <button
      v-if="plan.status === 'active'"
      @click.stop="handleAddRecord"
      class="absolute bottom-4 right-4 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    </button>

    <!-- Record Form Modal -->
    <div v-if="showRecordForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4" @click.stop>
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Add Record for {{ plan.name }}</h2>
          <button
            @click="showRecordForm = false"
            :disabled="isSubmitting"
            class="text-gray-400 hover:text-gray-500"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <RecordForm
          :plan-id="plan._id"
          :disabled="isSubmitting"
          @submit="handleRecordSubmit"
          @cancel="showRecordForm = false"
        />
      </div>
    </div>
  </div>
</template> 
