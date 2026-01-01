<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { goalService } from '@/services/goalService'
import ProgressRecordForm from './ProgressRecordForm.vue'

const router = useRouter()

const props = defineProps({
  goal: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update', 'edit', 'delete'])

const isDeleting = ref(false)
const showDeleteConfirm = ref(false)
const isExpanded = ref(false)
const progressRecords = ref([])
const isLoadingRecords = ref(false)
const editingRecordId = ref(null)
const showNewRecordForm = ref(false)
const isSubmitting = ref(false)

// Format date for display
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

// Get status color
const getStatusColor = (status) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'completed':
      return 'bg-blue-100 text-blue-800'
    case 'paused':
      return 'bg-yellow-100 text-yellow-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Get category color
const getCategoryColor = (category) => {
  switch (category.toLowerCase()) {
    case 'training':
      return 'bg-purple-100 text-purple-800'
    case 'learning':
      return 'bg-indigo-100 text-indigo-800'
    case 'character':
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Calculate days until target
const getDaysUntilTarget = (targetDate) => {
  const target = new Date(targetDate)
  const today = new Date()
  const diffTime = target - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// Handle status change
const handleStatusChange = async (newStatus) => {
  try {
    await goalService.updateGoal(props.goal.id, { status: newStatus })
    emit('update')
  } catch (error) {
    console.error('Failed to update goal status:', error)
  }
}

// Handle delete goal
const handleDelete = async () => {
  try {
    isDeleting.value = true
    await goalService.deleteGoal(props.goal.id)
    emit('delete', props.goal.id)
  } catch (error) {
    console.error('Failed to delete goal:', error)
  } finally {
    isDeleting.value = false
    showDeleteConfirm.value = false
  }
}

// Handle edit
const handleEdit = () => {
  emit('edit', props.goal)
}

// Fetch progress records
const fetchProgressRecords = async () => {
  try {
    isLoadingRecords.value = true
    const response = await goalService.getProgressRecords(props.goal.id)
    progressRecords.value = response.progress_records || []
  } catch (error) {
    console.error('Failed to fetch progress records:', error)
  } finally {
    isLoadingRecords.value = false
  }
}

// Toggle expand/collapse
const toggleExpand = async (e) => {
  e.stopPropagation()
  isExpanded.value = !isExpanded.value
  if (isExpanded.value && progressRecords.value.length === 0) {
    await fetchProgressRecords()
  }
}

// Handle add progress record
const handleAddRecord = async (recordData) => {
  try {
    isSubmitting.value = true
    await goalService.createProgressRecord(props.goal.id, recordData)
    showNewRecordForm.value = false
    await fetchProgressRecords()
    emit('update') // Refresh goal data
  } catch (error) {
    console.error('Failed to create progress record:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Handle edit progress record
const startEditRecord = (recordId) => {
  editingRecordId.value = recordId
}

// Handle update progress record
const handleUpdateRecord = async (recordId, recordData) => {
  try {
    isSubmitting.value = true
    await goalService.updateProgressRecord(recordId, recordData)
    editingRecordId.value = null
    await fetchProgressRecords()
    emit('update') // Refresh goal data
  } catch (error) {
    console.error('Failed to update progress record:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Handle delete progress record
const handleDeleteRecord = async (recordId) => {
  if (confirm('Are you sure you want to delete this progress record?')) {
    try {
      await goalService.deleteProgressRecord(recordId)
      await fetchProgressRecords()
      emit('update') // Refresh goal data
    } catch (error) {
      console.error('Failed to delete progress record:', error)
    }
  }
}

// Format value with unit
const formatValue = (value, unit) => {
  return `${value} ${unit}`
}

// Sort records by date (newest first)
const sortedRecords = computed(() => {
  return [...progressRecords.value].sort((a, b) => new Date(b.date) - new Date(a.date))
})

// Navigate to goal details page
const navigateToGoalDetails = () => {
  router.push(`/goals/${props.goal.id}`)
}
</script>

<template>
  <div 
    class="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    :class="{ 'ring-2 ring-blue-100': isExpanded }"
    @click="navigateToGoalDetails"
  >
    <!-- Header -->
    <div class="p-6 border-b border-gray-100">
      <div class="flex items-start justify-between">
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-semibold text-gray-900 truncate">
            {{ goal.title }}
          </h3>
          <p class="mt-1 text-sm text-gray-600 truncate">
            {{ goal.description.split('\n')[0] }}
          </p>
        </div>
        
        <!-- Actions Menu -->
        <div class="ml-4 flex items-center space-x-2" @click.stop>
          <button
            @click="handleEdit"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            title="Edit goal"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          
          <button
            @click="showDeleteConfirm = true"
            class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Delete goal"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          
          <button
            @click="toggleExpand"
            class="p-2 text-gray-400 hover:bg-gray-100 rounded-md transition-colors"
            title="Toggle Progress Records"
          >
            <svg 
              class="w-4 h-4 transition-transform"
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
    </div>

    <!-- Content -->
    <div class="p-6">
      <!-- Target and Progress -->
      <div class="mb-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-700">Progress</span>
          <span class="text-sm text-gray-600">{{ goal.progress_percentage }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div 
            class="bg-blue-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${Math.min(goal.progress_percentage, 100)}%` }"
          ></div>
        </div>
        <div class="mt-2 text-sm text-gray-600">
          <div class="flex justify-between">
            <span>Current: {{ goal.current_value !== undefined && goal.current_value !== null ? goal.current_value : (goal.initial_value || 0) }} {{ goal.unit }}</span>
            <span>Target: {{ goal.target }} {{ goal.unit }}</span>
          </div>
          <div class="text-xs text-gray-500 mt-1">
            Progress: {{ goal.current_value !== undefined && goal.current_value !== null ? goal.current_value : (goal.initial_value || 0) }} → {{ goal.target }} {{ goal.unit }}
          </div>
        </div>
      </div>

      <!-- Tags -->
      <div v-if="goal.tags && goal.tags.length > 0" class="mb-4">
        <div class="flex flex-wrap gap-2">
          <span
            v-for="tag in goal.tags"
            :key="tag"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- Status and Category -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-2">
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            :class="getStatusColor(goal.status)"
          >
            {{ goal.status.charAt(0).toUpperCase() + goal.status.slice(1) }}
          </span>
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            :class="getCategoryColor(goal.category)"
          >
            {{ goal.category }}
          </span>
        </div>
      </div>

      <!-- Target Date -->
      <div class="flex items-center justify-between text-sm text-gray-600">
        <span>Target Date: {{ formatDate(goal.target_date) }}</span>
        <span v-if="goal.status === 'active'">
          {{ getDaysUntilTarget(goal.target_date) > 0 
            ? `${getDaysUntilTarget(goal.target_date)} days left` 
            : `${Math.abs(getDaysUntilTarget(goal.target_date))} days overdue` 
          }}
        </span>
      </div>
    </div>

    <!-- Status Quick Actions -->
    <div v-if="goal.status === 'active'" class="px-6 py-3 bg-gray-50 border-t border-gray-100 rounded-b-lg" @click.stop>
      <div class="flex space-x-2">
        <button
          @click="handleStatusChange('completed')"
          class="flex-1 px-3 py-2 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md transition-colors"
        >
          Mark Complete
        </button>
        <button
          @click="handleStatusChange('paused')"
          class="flex-1 px-3 py-2 text-sm font-medium text-yellow-700 bg-yellow-100 hover:bg-yellow-200 rounded-md transition-colors"
        >
          Pause
        </button>
      </div>
    </div>

    <!-- Reactivate for paused goals -->
    <div v-else-if="goal.status === 'paused'" class="px-6 py-3 bg-gray-50 border-t border-gray-100 rounded-b-lg" @click.stop>
      <button
        @click="handleStatusChange('active')"
        class="w-full px-3 py-2 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md transition-colors"
      >
        Resume Goal
      </button>
    </div>

    <!-- Expanded Progress Records Section -->
    <div v-if="isExpanded" @click.stop>
      <div class="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <div class="flex items-center justify-between mb-3">
          <h4 class="font-medium text-gray-900">Progress Records</h4>
          <button
            v-if="goal.status === 'active' && !showNewRecordForm"
            @click.stop="showNewRecordForm = true"
            class="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            + Add Record
          </button>
        </div>
        
        <!-- New Record Form -->
        <div v-if="showNewRecordForm" class="mb-4" @click.stop>
          <ProgressRecordForm
            :goal="goal"
            @submit="handleAddRecord"
            @cancel="showNewRecordForm = false"
          />
        </div>
        
        <!-- Loading State -->
        <div v-if="isLoadingRecords" class="py-6 text-center">
          <div class="animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-blue-600 mx-auto"></div>
        </div>
        
        <!-- Records List -->
        <div v-else-if="sortedRecords.length > 0" class="space-y-1">
          <div v-for="record in sortedRecords" :key="record.id" class="group">
            <!-- Edit Form -->
            <div v-if="editingRecordId === record.id" class="mb-4">
              <ProgressRecordForm
                :goal="goal"
                :progress-record="record"
                :is-editing="true"
                @submit="(updatedRecord) => handleUpdateRecord(record.id, updatedRecord)"
                @cancel="editingRecordId = null"
              />
            </div>
            
            <!-- Record Display -->
            <div 
              v-else
              class="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white transition-colors duration-150"
            >
              <div class="flex items-center gap-4">
                <span class="text-sm font-medium text-gray-900">
                  {{ formatValue(record.value, record.unit) }}
                </span>
                <div class="flex flex-col">
                  <span class="text-sm text-gray-500">
                    {{ formatDate(record.date) }}
                  </span>
                  <span class="text-xs text-gray-400">
                    {{ new Date(record.date).toLocaleDateString() }}
                  </span>
                </div>
                <span v-if="record.is_benchmark" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  Benchmark
                </span>
                <span v-if="record.notes" class="text-sm text-gray-500 italic">
                  {{ record.notes }}
                </span>
              </div>
              <div class="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <button
                  @click="startEditRecord(record.id)"
                  class="p-1 text-gray-400 hover:text-blue-600 rounded-full hover:bg-white"
                  title="Edit Record"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  @click="handleDeleteRecord(record.id)"
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
          <p class="text-sm">No progress records yet</p>
          <button
            v-if="goal.status === 'active'"
            @click="showNewRecordForm = true"
            class="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Add your first record
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <div
    v-if="showDeleteConfirm"
    class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <div class="flex items-center mb-4">
        <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
      </div>
      <div class="text-center">
        <h3 class="text-lg font-medium text-gray-900 mb-2">Delete Goal</h3>
        <p class="text-sm text-gray-600 mb-4">
          Are you sure you want to delete "{{ goal.title }}"? This action cannot be undone.
        </p>
        <div class="flex space-x-3 justify-center">
          <button
            @click="showDeleteConfirm = false"
            :disabled="isDeleting"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            @click="handleDelete"
            :disabled="isDeleting"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50"
          >
            {{ isDeleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
