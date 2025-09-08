<script setup>
import { ref } from 'vue'
import { goalService } from '@/services/goalService'

const props = defineProps({
  goal: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update', 'edit', 'delete'])

const isDeleting = ref(false)
const showDeleteConfirm = ref(false)

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
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
    <!-- Header -->
    <div class="p-6 border-b border-gray-100">
      <div class="flex items-start justify-between">
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-semibold text-gray-900 truncate">
            {{ goal.title }}
          </h3>
          <p class="mt-1 text-sm text-gray-600">
            {{ goal.description }}
          </p>
        </div>
        
        <!-- Actions Menu -->
        <div class="ml-4 flex items-center space-x-2">
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
          Target: {{ goal.target }} {{ goal.unit }}
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
    <div v-if="goal.status === 'active'" class="px-6 py-3 bg-gray-50 border-t border-gray-100 rounded-b-lg">
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
    <div v-else-if="goal.status === 'paused'" class="px-6 py-3 bg-gray-50 border-t border-gray-100 rounded-b-lg">
      <button
        @click="handleStatusChange('active')"
        class="w-full px-3 py-2 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md transition-colors"
      >
        Resume Goal
      </button>
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
