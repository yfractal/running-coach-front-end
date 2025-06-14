<script setup>
import { ref } from 'vue'

const props = defineProps({
  planId: {
    type: String,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'cancel'])

const formData = ref({
  value: 0,
  date: new Date().toISOString().split('T')[0],
  notes: ''
})

const handleSubmit = (e) => {
  e.preventDefault()
  const record = {
    value: Number(formData.value.value),
    date: formData.value.date,
    notes: formData.value.notes || undefined
  }
  console.log('Submitting record:', record)
  emit('submit', record)
}
</script>

<template>
  <form @submit="handleSubmit" class="space-y-6">
    <div class="space-y-4">
      <div>
        <label for="value" class="block text-sm font-medium text-gray-700">
          Value
        </label>
        <input
          type="number"
          id="value"
          v-model="formData.value"
          :disabled="disabled"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          required
          min="0"
          step="0.01"
        />
      </div>

      <div>
        <label for="date" class="block text-sm font-medium text-gray-700">
          Date
        </label>
        <input
          type="date"
          id="date"
          v-model="formData.date"
          :disabled="disabled"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          required
        />
      </div>

      <div>
        <label for="notes" class="block text-sm font-medium text-gray-700">
          Notes (Optional)
        </label>
        <textarea
          id="notes"
          v-model="formData.notes"
          :disabled="disabled"
          rows="3"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>
    </div>

    <div class="flex justify-end space-x-4">
      <button
        type="button"
        @click="emit('cancel')"
        :disabled="disabled"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        Cancel
      </button>
      <button
        type="submit"
        :disabled="disabled"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Save Record
      </button>
    </div>
  </form>
</template> 