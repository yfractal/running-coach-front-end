<script setup>
import { ref, reactive, computed, watch } from 'vue'

const props = defineProps({
  goal: {
    type: Object,
    default: null
  },
  isEditing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'cancel'])

// Form data
const formData = reactive({
  title: '',
  description: '',
  target: '',
  initial_value: '',
  unit: '',
  category: '',
  tags: [],
  target_date: ''
})

// Initialize form data
const initializeForm = () => {
  if (props.isEditing && props.goal) {
    Object.assign(formData, {
      title: props.goal.title,
      description: props.goal.description,
      target: props.goal.target,
      initial_value: props.goal.initial_value || 0,
      unit: props.goal.unit,
      category: props.goal.category,
      tags: [...props.goal.tags],
      target_date: props.goal.target_date.split('T')[0] // Convert to YYYY-MM-DD format
    })
  } else {
    Object.assign(formData, {
      title: '',
      description: '',
      target: '',
      initial_value: '',
      unit: '',
      category: '',
      tags: [],
      target_date: ''
    })
  }
}

// Watch for prop changes to reinitialize form
watch(() => props.goal, initializeForm, { immediate: true })

// Form validation
const isSubmitting = ref(false)
const newTag = ref('')

// Predefined options
const categories = [
  'Training',
  'Learning',
  'Character',
  'Health',
  'Personal',
  'Professional'
]

const commonUnits = [
  'stages',
  'seconds',
  'minutes',
  'hours',
  'days',
  'weeks',
  'months',
  'phases',
  'kilometers',
  'miles',
  'pounds',
  'kilograms',
  'repetitions',
  'sets',
  'points',
  'pages',
  'chapters',
  'courses'
]

// Computed validation
const isFormValid = computed(() => {
  return formData.title.trim() &&
         formData.description.trim() &&
         formData.target &&
         formData.initial_value !== '' &&
         formData.unit.trim() &&
         formData.category &&
         formData.target_date
})

// Add tag
const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !formData.tags.includes(tag)) {
    formData.tags.push(tag)
    newTag.value = ''
  }
}

// Remove tag
const removeTag = (index) => {
  formData.tags.splice(index, 1)
}

// Handle tag input keydown
const handleTagKeydown = (event) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    addTag()
  }
}

// Submit form
const handleSubmit = async () => {
  if (!isFormValid.value) return

  try {
    isSubmitting.value = true
    
    const submitData = {
      ...formData,
      target: parseFloat(formData.target),
      initial_value: parseFloat(formData.initial_value) || 0
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
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Title -->
    <div>
      <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
        Goal Title *
      </label>
      <input
        id="title"
        v-model="formData.title"
        type="text"
        required
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="e.g., Double-hand hang"
      />
    </div>

    <!-- Description -->
    <div>
      <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
        Description *
      </label>
      <textarea
        id="description"
        v-model="formData.description"
        required
        rows="3"
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="e.g., Achieve 120 second double-hand hang"
      ></textarea>
    </div>

    <!-- Initial Value, Target and Unit -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label for="initial_value" class="block text-sm font-medium text-gray-700 mb-1">
          Initial Value *
        </label>
        <input
          id="initial_value"
          v-model="formData.initial_value"
          type="number"
          step="0.1"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., 0"
        />
      </div>
      
      <div>
        <label for="target" class="block text-sm font-medium text-gray-700 mb-1">
          Target Value *
        </label>
        <input
          id="target"
          v-model="formData.target"
          type="number"
          step="0.1"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., 120"
        />
      </div>
      
      <div>
        <label for="unit" class="block text-sm font-medium text-gray-700 mb-1">
          Unit *
        </label>
        <select
          id="unit"
          v-model="formData.unit"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select unit</option>
          <option v-for="unit in commonUnits" :key="unit" :value="unit">
            {{ unit }}
          </option>
        </select>
      </div>
    </div>

    <!-- Category -->
    <div>
      <label for="category" class="block text-sm font-medium text-gray-700 mb-1">
        Category *
      </label>
      <select
        id="category"
        v-model="formData.category"
        required
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select category</option>
        <option v-for="category in categories" :key="category" :value="category">
          {{ category }}
        </option>
      </select>
    </div>

    <!-- Target Date -->
    <div>
      <label for="target_date" class="block text-sm font-medium text-gray-700 mb-1">
        Target Date *
      </label>
      <input
        id="target_date"
        v-model="formData.target_date"
        type="date"
        required
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>

    <!-- Tags -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Tags
      </label>
      
      <!-- Existing tags -->
      <div v-if="formData.tags.length > 0" class="flex flex-wrap gap-2 mb-3">
        <span
          v-for="(tag, index) in formData.tags"
          :key="index"
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
        >
          {{ tag }}
          <button
            type="button"
            @click="removeTag(index)"
            class="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200 focus:outline-none"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      </div>

      <!-- Add new tag -->
      <div class="flex">
        <input
          v-model="newTag"
          type="text"
          @keydown="handleTagKeydown"
          class="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Add a tag..."
        />
        <button
          type="button"
          @click="addTag"
          :disabled="!newTag.trim()"
          class="px-4 py-2 bg-gray-100 text-gray-700 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </div>
      <p class="mt-1 text-xs text-gray-500">
        Press Enter or click "Add" to add tags
      </p>
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
        {{ isSubmitting ? 'Saving...' : (isEditing ? 'Update Goal' : 'Create Goal') }}
      </button>
    </div>
  </form>
</template>
