<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['submit', 'cancel'])

const form = ref({
  name: '',
  start_at: new Date().toISOString().slice(0, 16), // datetime-local format
  duration: 30,
  state: 'plan',
  summary: '',
  color: '#3b82f6'
})

const newTag = ref('')
const tags = ref([])

const isValid = computed(() => {
  return form.value.name.trim() && 
         form.value.start_at && 
         form.value.duration > 0
})

const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !tags.value.includes(tag)) {
    tags.value.push(tag)
    newTag.value = ''
  }
}

const removeTag = (tag) => {
  tags.value = tags.value.filter(t => t !== tag)
}

const handleSubmit = () => {
  if (!isValid.value) return
  
  // Convert datetime-local to ISO string
  const startAtISO = new Date(form.value.start_at).toISOString()
  
  // Convert duration from days to seconds
  const durationSeconds = form.value.duration * 24 * 60 * 60
  
  emit('submit', {
    plan2: {
      name: form.value.name,
      start_at: startAtISO,
      duration_seconds: durationSeconds,
      state: form.value.state,
      summary: form.value.summary || undefined,
      color: form.value.color
    },
    tags: tags.value
  })
}

const colorOptions = [
  { value: '#3b82f6', label: 'Blue' },
  { value: '#ef4444', label: 'Red' },
  { value: '#10b981', label: 'Green' },
  { value: '#f59e0b', label: 'Orange' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#84cc16', label: 'Lime' }
]
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Name -->
    <div>
      <label for="name" class="block text-sm font-medium text-gray-700">
        Plan Name *
      </label>
      <input
        type="text"
        id="name"
        v-model="form.name"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        placeholder="e.g., VO2max Training Program"
        required
      />
    </div>

    <!-- Start Date & Time -->
    <div>
      <label for="start_at" class="block text-sm font-medium text-gray-700">
        Start Date & Time *
      </label>
      <input
        type="datetime-local"
        id="start_at"
        v-model="form.start_at"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        required
      />
    </div>

    <!-- Duration -->
    <div>
      <label for="duration" class="block text-sm font-medium text-gray-700">
        Duration (days) *
      </label>
      <input
        type="number"
        id="duration"
        v-model.number="form.duration"
        min="1"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        required
      />
    </div>

    <!-- Summary -->
    <div>
      <label for="summary" class="block text-sm font-medium text-gray-700">
        Summary
      </label>
      <textarea
        id="summary"
        v-model="form.summary"
        rows="3"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        placeholder="A brief description of the plan..."
      ></textarea>
    </div>

    <!-- Color -->
    <div>
      <label for="color" class="block text-sm font-medium text-gray-700 mb-2">
        Color
      </label>
      <div class="flex items-center gap-3">
        <input
          type="color"
          id="color"
          v-model="form.color"
          class="h-10 w-20 rounded border border-gray-300 cursor-pointer"
        />
        <select
          v-model="form.color"
          class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option v-for="color in colorOptions" :key="color.value" :value="color.value">
            {{ color.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- State -->
    <div>
      <label for="state" class="block text-sm font-medium text-gray-700">
        State
      </label>
      <select
        id="state"
        v-model="form.state"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      >
        <option value="plan">Plan</option>
        <option value="executed">Executed</option>
      </select>
    </div>

    <!-- Tags -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Tags
      </label>
      <div class="flex gap-2 mb-2">
        <input
          type="text"
          v-model="newTag"
          @keyup.enter.prevent="addTag"
          class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Add a tag and press Enter"
        />
        <button
          type="button"
          @click="addTag"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          Add
        </button>
      </div>
      <div v-if="tags.length > 0" class="flex flex-wrap gap-2">
        <span
          v-for="tag in tags"
          :key="tag"
          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
        >
          {{ tag }}
          <button
            type="button"
            @click="removeTag(tag)"
            class="ml-2 text-blue-600 hover:text-blue-800"
          >
            ×
          </button>
        </span>
      </div>
    </div>

    <!-- Form Actions -->
    <div class="flex justify-end gap-3 pt-4 border-t">
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        :disabled="!isValid"
        class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Create Plan
      </button>
    </div>
  </form>
</template>

