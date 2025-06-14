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
      class="bg-white rounded-lg shadow-md px-4 py-3 hover:shadow-lg transition-shadow duration-200 cursor-pointer" 
      @click="handleCardClick"
    >
      <div class="flex items-center gap-4">
        <!-- Plan Name and Status -->
        <div class="flex items-center gap-2 min-w-[200px]">
          <h3 class="text-base font-semibold text-gray-900 truncate">{{ plan.name }}</h3>
          <span :class="['px-2 py-0.5 text-xs font-medium rounded-full', statusColor]">
            {{ plan.status }}
          </span>
        </div>

        <!-- Target -->
        <div class="flex items-center gap-1 text-sm text-gray-600 min-w-[150px]">
          <span>{{ plan.quality }} {{ plan.unit }}</span>
          <span v-if="plan.sub_quality" class="text-gray-400">
            ({{ plan.sub_quality }} {{ plan.sub_unit }}/{{ plan.duration_type }})
          </span>
        </div>

        <!-- Progress Bars -->
        <div class="flex-1 flex items-center gap-4">
          <!-- Progress Bar -->
          <div class="flex-1 flex items-center gap-2">
            <span class="text-xs text-gray-500 w-24">Progress:</span>
            <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                class="h-full bg-blue-500 rounded-full"
                :style="{ width: `${plan.progress_percentage || 0}%` }"
              ></div>
            </div>
            <span class="text-xs text-gray-500 w-12">{{ Math.round(plan.progress_percentage || 0) }}%</span>
          </div>

          <!-- Time Progress Bar -->
          <div class="flex-1 flex items-center gap-2">
            <span class="text-xs text-gray-500 w-24">Time Passed:</span>
            <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                class="h-full bg-gray-500 rounded-full"
                :style="{ width: `${plan.time_passed_percentage || 0}%` }"
              ></div>
            </div>
            <span class="text-xs text-gray-500 w-12">{{ Math.round(plan.time_passed_percentage || 0) }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Record Button -->
    <button
      v-if="plan.status === 'active'"
      @click.stop="handleAddRecord"
      class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
