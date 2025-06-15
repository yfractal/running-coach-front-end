<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import RecordForm from './RecordForm.vue'
import RecordInlineForm from './RecordInlineForm.vue'
import PlanInlineForm from './PlanInlineForm.vue'
import { planService } from '@/services/planService'

const router = useRouter()
const showRecordForm = ref(false)
const isSubmitting = ref(false)
const isExpanded = ref(false)
const records = ref([])
const isLoadingRecords = ref(false)
const editingRecordId = ref(null)
const showNewRecordForm = ref(false)
const isEditingPlan = ref(false)

const props = defineProps({
  plan: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['recordAdded', 'deleted', 'updated'])

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
  if (!isEditingPlan.value && props.plan?._id) {
    router.push({ name: 'PlanDetails', params: { id: props.plan._id } })
  }
}

const handleAddRecord = () => {
  showRecordForm.value = true
}

const maybeRound = (value) => {
  const num = Number(value);
  if (Number.isInteger(num)) {
    return num;
  } else {
    return num.toFixed(2);
  }
}

const handleRecordSubmit = async (record) => {
  try {
    isSubmitting.value = true
    console.log('Creating record:', record)
    const newRecord = await planService.createPlanRecord(props.plan._id, record)
    console.log('Record created:', newRecord)
    emit('recordAdded', newRecord)
    showRecordForm.value = false
    if (isExpanded.value) {
      await fetchRecords() // Refresh records if expanded
    }
  } catch (error) {
    console.error('Failed to create record:', error)
    alert('Failed to create record. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

const handleDelete = async () => {
  if (confirm('Are you sure you want to delete this plan?')) {
    try {
      await planService.deletePlan(props.plan._id)
      emit('deleted', props.plan._id)
    } catch (error) {
      console.error('Failed to delete plan:', error)
      alert('Failed to delete plan. Please try again.')
    }
  }
}

const fetchRecords = async () => {
  console.log('fetchRecords')
  try {
    isLoadingRecords.value = true
    records.value = await planService.getPlanRecords(props.plan._id)
  } catch (error) {
    console.error('Failed to fetch records:', error)
    alert('Failed to load records. Please try again.')
  } finally {
    isLoadingRecords.value = false
  }
}

const toggleExpand = async (e) => {
  e.stopPropagation() // Prevent card click
  isExpanded.value = !isExpanded.value
  if (isExpanded.value && records.value.length === 0) {
    await fetchRecords()
  }
}

const startEditRecord = (recordId) => {
  editingRecordId.value = recordId
}

const handleEditSave = async (recordId, updatedRecord) => {
  try {
    await planService.updatePlanRecord(props.plan._id, recordId, updatedRecord)
    await fetchRecords() // Refresh records
    editingRecordId.value = null
    emit('recordAdded') // Trigger plan refresh for progress update
  } catch (error) {
    console.error('Failed to update record:', error)
    alert('Failed to update record. Please try again.')
  }
}

const handleDeleteRecord = async (recordId) => {
  if (confirm('Are you sure you want to delete this record?')) {
    try {
      await planService.deletePlanRecord(props.plan._id, recordId)
      await fetchRecords() // Refresh records
      emit('recordAdded') // Trigger plan refresh for progress update
    } catch (error) {
      console.error('Failed to delete record:', error)
      alert('Failed to delete record. Please try again.')
    }
  }
}

const handleInlineRecordAdd = async (record) => {
  try {
    await planService.createPlanRecord(props.plan._id, record)
    await fetchRecords() // Refresh records
    showNewRecordForm.value = false
    emit('recordAdded') // Trigger plan refresh for progress update
  } catch (error) {
    console.error('Failed to create record:', error)
    alert('Failed to create record. Please try again.')
  }
}

const startEditPlan = (e) => {
  e.stopPropagation()
  isEditingPlan.value = true
}

const handlePlanEditSave = async (updatedPlan) => {
  try {
    await planService.updatePlan(props.plan._id, updatedPlan)
    emit('updated', { ...props.plan, ...updatedPlan })
    isEditingPlan.value = false
  } catch (error) {
    console.error('Failed to update plan:', error)
    alert('Failed to update plan. Please try again.')
  }
}

const getProgressColor = computed(() => {
  const progress = props.plan.progress_percentage || 0
  if (progress >= 100) return 'bg-green-500'
  if (progress >= 80) return 'bg-blue-500'
  if (progress >= 50) return 'bg-yellow-500'
  return 'bg-gray-500'
})

const formatValue = (value, unit) => {
  if (!value) return '0'
  if (unit === 'kg') return `${value}kg`
  if (unit === 'km') return `${value}km`
  if (unit === 'hour') return `${value}h`
  if (unit === 'time' || unit === 'times') return `${value}次`
  return `${value} ${unit}`
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dayName = days[date.getDay()]
  return dayName
}

const getCompletedValue = computed(() => {
  const progress = props.plan.progress_percentage || 0
  const quality = props.plan.quality || 0
  return (progress * quality) / 100
})

</script>

<template>
  <div class="relative">
    <div 
      class="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 overflow-hidden"
      :class="{ 'ring-2 ring-blue-100': isExpanded }"
    >
      <!-- Plan Edit Form -->
      <PlanInlineForm
        v-if="isEditingPlan"
        :plan="plan"
        @save="handlePlanEditSave"
        @cancel="isEditingPlan = false"
      />

      <!-- Main Card Content -->
      <div v-else>
        <div class="p-4" :class="{ 'cursor-pointer': !isExpanded }" @click="handleCardClick">
          <!-- Header -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="text-lg font-semibold text-gray-900">{{ plan.name }}</h3>
                <span :class="['px-2 py-0.5 text-xs font-medium rounded-full', statusColor]">
                  {{ plan.status }}
                </span>
              </div>
            </div>
            
            <div class="flex items-center gap-1">
              <button
                v-if="plan.status === 'active'"
                @click.stop="handleAddRecord"
                class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                title="Add Record"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
              <button
                @click.stop="startEditPlan"
                class="p-1.5 text-gray-400 hover:bg-gray-50 rounded-full transition-colors"
                title="Edit Plan"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button
                @click.stop="handleDelete"
                class="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors"
                title="Delete Plan"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button
                @click.stop="toggleExpand"
                class="p-1.5 text-gray-400 hover:bg-gray-50 rounded-full transition-colors"
                title="Toggle Details"
              >
                <svg 
                  class="w-5 h-5 transition-transform"
                  :class="{ 'rotate-180': isExpanded }"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Progress Section -->
          <div class="space-y-4">
            <!-- Main Progress -->
            <div class="flex items-center gap-3">
              <div class="flex-1">
                <div class="flex items-center justify-between text-sm mb-1.5">
                  <span class="text-gray-600 font-medium">Progress</span>
                  <div class="flex items-center gap-2">
                    <span class="text-gray-500">
                      {{ maybeRound(plan.completed_value) }} / {{ plan.quality }} {{ plan.unit}}
                    </span>
                    <span :class="[
                      'font-semibold',
                      plan.progress_percentage >= 100 ? 'text-green-600' :
                      plan.progress_percentage >= 80 ? 'text-blue-600' :
                      'text-gray-900'
                    ]">
                      {{ Math.round(plan.progress_percentage || 0) }}%
                    </span>
                    <span class="text-gray-600 font-medium">Time Passed: {{ plan.time_passed_percentage || 0 }}%</span>

                  </div>
                </div>
                <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    class="h-full rounded-full transition-all duration-300"
                    :class="[getProgressColor]"
                    :style="{ width: `${plan.progress_percentage || 0}%` }"
                  ></div>
                </div>
                
              </div>
            </div>
            </div>
        </div>

        <!-- Expanded Records Section -->
        <div v-if="isExpanded">
          <div class="px-4 py-3 bg-gray-50 border-t border-gray-100">
            <div class="flex items-center justify-between mb-3">
              <h4 class="font-medium text-gray-900">Training Records</h4>
              <button
                v-if="plan.status === 'active' && !showNewRecordForm"
                @click="showNewRecordForm = true"
                class="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add Record
              </button>
            </div>
            
            <!-- New Record Form -->
            <RecordInlineForm
              v-if="showNewRecordForm"
              :unit="plan.unit"
              :is-new="true"
              @save="handleInlineRecordAdd"
              @cancel="showNewRecordForm = false"
            />
            
            <!-- Loading State -->
            <div v-if="isLoadingRecords" class="py-6 text-center">
              <div class="animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-blue-600 mx-auto"></div>
            </div>
            
            <!-- Records List -->
            <div v-else-if="records.length > 0" class="space-y-1">
              <div v-for="record in records" :key="record._id" class="group">
                <!-- Edit Form -->
                <RecordInlineForm
                  v-if="editingRecordId === record._id"
                  :record="record"
                  :unit="plan.unit"
                  @save="(updatedRecord) => handleEditSave(record._id, updatedRecord)"
                  @cancel="editingRecordId = null"
                />
                
                <!-- Record Display -->
                <div 
                  v-else
                  class="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white transition-colors duration-150"
                >
                  <div class="flex items-center gap-4">
                    <span class="text-sm font-medium text-gray-900">
                      {{ formatValue(record.value, plan.unit) }}
                    </span>
                    <div class="flex flex-col">
                      <span class="text-sm text-gray-500">
                        {{ formatDate(record.date) }}
                      </span>
                      <span class="text-xs text-gray-400">
                        {{ new Date(record.date).toLocaleDateString() }}
                      </span>
                    </div>
                    <span v-if="record.notes" class="text-sm text-gray-500 italic">
                      {{ record.notes }}
                    </span>
                  </div>
                  <div class="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <button
                      @click="startEditRecord(record._id)"
                      class="p-1 text-gray-400 hover:text-blue-600 rounded-full hover:bg-white"
                      title="Edit Record"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      @click="handleDeleteRecord(record._id)"
                      class="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-white"
                      title="Delete Record"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- No Records State -->
            <div v-else class="py-6 text-center text-gray-500">
              <p class="text-sm">No training records yet</p>
              <button
                v-if="plan.status === 'active'"
                @click="showNewRecordForm = true"
                class="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Add your first record
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

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
