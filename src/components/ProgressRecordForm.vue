<script setup>
import { ref, reactive, computed, watch } from 'vue'

const props = defineProps({
  progressRecord: {
    type: Object,
    default: null
  },
  isEditing: {
    type: Boolean,
    default: false
  },
  goal: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['submit', 'cancel'])

// Form data
const formData = reactive({
  date: '',
  value: '',
  unit: '',
  is_benchmark: false,
  notes: ''
})

// Initialize form data
const initializeForm = () => {
  if (props.isEditing && props.progressRecord) {
    Object.assign(formData, {
      date: props.progressRecord.date,
      value: props.progressRecord.value,
      unit: props.progressRecord.unit,
      is_benchmark: props.progressRecord.is_benchmark || false,
      notes: props.progressRecord.notes || ''
    })
  } else {
    // Set default values for new record
    const today = new Date().toISOString().split('T')[0]
    Object.assign(formData, {
      date: today,
      value: '',
      unit: props.goal.unit, // Use goal's unit as default
      is_benchmark: false,
      notes: ''
    })
  }
}

// Watch for prop changes to reinitialize form
watch(() => props.progressRecord, initializeForm, { immediate: true })

// Form validation
const isSubmitting = ref(false)

// Computed validation
const isFormValid = computed(() => {
  return formData.date &&
         formData.value &&
         formData.unit.trim()
})

// Submit form
const handleSubmit = async () => {
  if (!isFormValid.value) return

  try {
    isSubmitting.value = true
    
    const submitData = {
      ...formData,
      value: parseFloat(formData.value)
    }

    emit('submit', submitData)
  } catch (error) {
    console.error('Form submission error:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Cancel form
const handleCancel = () => {
  emit('cancel')
}

// Initialize form on mount
initializeForm()
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- Date -->
    <div>
      <label for="date" class="block text-sm font-medium text-gray-700 mb-1">
        Date *
      </label>
      <input
        id="date"
        v-model="formData.date"
        type="date"
        required
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>

    <!-- Value and Unit -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="value" class="block text-sm font-medium text-gray-700 mb-1">
          Value *
        </label>
        <input
          id="value"
          v-model="formData.value"
          type="number"
          step="0.1"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          :placeholder="`e.g., ${goal.target}`"
        />
      </div>
      
      <div>
        <label for="unit" class="block text-sm font-medium text-gray-700 mb-1">
          Unit *
        </label>
        <input
          id="unit"
          v-model="formData.unit"
          type="text"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          :placeholder="goal.unit"
        />
      </div>
    </div>

    <!-- Benchmark Checkbox -->
    <div class="flex items-center">
      <input
        id="is_benchmark"
        v-model="formData.is_benchmark"
        type="checkbox"
        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      <label for="is_benchmark" class="ml-2 block text-sm text-gray-700">
        Mark as benchmark (personal record)
      </label>
    </div>

    <!-- Notes -->
    <div>
      <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">
        Notes
      </label>
      <textarea
        id="notes"
        v-model="formData.notes"
        rows="3"
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Add any notes about this progress record..."
      ></textarea>
    </div>

    <!-- Progress Context -->
    <div class="bg-gray-50 rounded-md p-3 text-sm text-gray-600">
      <div class="flex justify-between">
        <span>Initial: {{ goal.initial_value || 0 }} {{ goal.unit }}</span>
        <span>Target: {{ goal.target }} {{ goal.unit }}</span>
      </div>
      <div v-if="goal.current_value !== undefined && goal.current_value !== null" class="text-center text-xs text-gray-500 mt-1">
        Current: {{ goal.current_value }} {{ goal.unit }}
      </div>
      <div class="text-xs text-gray-500 mt-1">
        Current progress: {{ goal.progress_percentage }}%
      </div>
    </div>

    <!-- Form Actions -->
    <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
      <button
        type="button"
        @click="handleCancel"
        :disabled="isSubmitting"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        :disabled="!isFormValid || isSubmitting"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isSubmitting ? 'Saving...' : (isEditing ? 'Update Record' : 'Add Record') }}
      </button>
    </div>
  </form>
</template>
