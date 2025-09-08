<script setup>
import { ref } from 'vue'
import { goalService } from '@/services/goalService'

const props = defineProps({
  progressRecords: {
    type: Array,
    required: true
  },
  goal: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update', 'edit', 'delete'])

const isDeleting = ref(false)
const showDeleteConfirm = ref(false)
const recordToDelete = ref(null)

// Format date for display
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

// Format value with unit
const formatValue = (value, unit) => {
  return `${value} ${unit}`
}

// Handle edit record
const handleEdit = (record) => {
  emit('edit', record)
}

// Handle delete record
const handleDelete = (record) => {
  recordToDelete.value = record
  showDeleteConfirm.value = true
}

// Confirm delete
const confirmDelete = async () => {
  if (!recordToDelete.value) return

  try {
    isDeleting.value = true
    await goalService.deleteProgressRecord(recordToDelete.value.id)
    emit('delete', recordToDelete.value.id)
  } catch (error) {
    console.error('Failed to delete progress record:', error)
  } finally {
    isDeleting.value = false
    showDeleteConfirm.value = false
    recordToDelete.value = null
  }
}

// Cancel delete
const cancelDelete = () => {
  showDeleteConfirm.value = false
  recordToDelete.value = null
}

// Sort records by date (newest first)
const sortedRecords = computed(() => {
  return [...props.progressRecords].sort((a, b) => new Date(b.date) - new Date(a.date))
})
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-medium text-gray-900">Progress Records</h3>
      <div class="text-sm text-gray-500">
        {{ progressRecords.length }} record{{ progressRecords.length !== 1 ? 's' : '' }}
      </div>
    </div>

    <!-- Records List -->
    <div v-if="sortedRecords.length > 0" class="space-y-3">
      <div
        v-for="record in sortedRecords"
        :key="record.id"
        class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <div class="flex items-center space-x-3 mb-2">
              <div class="text-lg font-semibold text-gray-900">
                {{ formatValue(record.value, record.unit) }}
              </div>
              <div v-if="record.is_benchmark" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                Benchmark
              </div>
            </div>
            
            <div class="text-sm text-gray-600 mb-2">
              {{ formatDate(record.date) }}
            </div>
            
            <div v-if="record.notes" class="text-sm text-gray-700">
              {{ record.notes }}
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center space-x-2 ml-4">
            <button
              @click="handleEdit(record)"
              class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              title="Edit record"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            
            <button
              @click="handleDelete(record)"
              class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Delete record"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-8 bg-gray-50 rounded-lg">
      <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No Progress Records Yet</h3>
      <p class="text-gray-600 mb-4">
        Start tracking your progress by adding your first record.
      </p>
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
          <h3 class="text-lg font-medium text-gray-900 mb-2">Delete Progress Record</h3>
          <p class="text-sm text-gray-600 mb-4">
            Are you sure you want to delete this progress record? This action cannot be undone.
          </p>
          <div class="flex space-x-3 justify-center">
            <button
              @click="cancelDelete"
              :disabled="isDeleting"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              @click="confirmDelete"
              :disabled="isDeleting"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50"
            >
              {{ isDeleting ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
