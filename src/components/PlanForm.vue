<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  plan: {
    type: Object,
    default: () => ({
      name: '',
      status: 'active',
      description: '',
      quality: '',
      unit: '',
      sub_quality: '',
      sub_unit: '',
      duration_type: 'daily',
      duration_value: 1,
      start_date: new Date().toISOString().split('T')[0]
    })
  }
})

const emit = defineEmits(['submit', 'cancel'])

const form = ref({
  name: props.plan.name,
  status: props.plan.status,
  description: props.plan.description || '',
  quality: props.plan.quality,
  unit: props.plan.unit,
  sub_quality: props.plan.sub_quality || '',
  sub_unit: props.plan.sub_unit || '',
  duration_type: props.plan.duration_type,
  duration_value: props.plan.duration_value,
  start_date: props.plan.start_date
})

const durationTypes = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
]

const isValid = computed(() => {
  return form.value.name && 
         form.value.quality && 
         form.value.unit && 
         form.value.duration_value > 0 &&
         form.value.start_date
})

const handleSubmit = () => {
  if (!isValid.value) return
  emit('submit', { ...form.value })
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Name -->
    <div>
      <label for="name" class="block text-sm font-medium text-gray-700">Plan Name</label>
      <input
        type="text"
        id="name"
        v-model="form.name"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        required
      />
    </div>

    <!-- Description -->
    <div>
      <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
      <textarea
        id="description"
        v-model="form.description"
        rows="3"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      ></textarea>
    </div>

    <!-- Main Target -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label for="quality" class="block text-sm font-medium text-gray-700">Target Value</label>
        <input
          type="number"
          id="quality"
          v-model="form.quality"
          min="0"
          step="0.1"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label for="unit" class="block text-sm font-medium text-gray-700">Unit</label>
        <input
          type="text"
          id="unit"
          v-model="form.unit"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="e.g., km, kg, times"
          required
        />
      </div>
    </div>

    <!-- Start Date -->
    <div>
      <label for="start_date" class="block text-sm font-medium text-gray-700">Start Date</label>
      <input
        type="date"
        id="start_date"
        v-model="form.start_date"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        required
      />
    </div>

    <!-- Sub Target (Optional) -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label for="sub_quality" class="block text-sm font-medium text-gray-700">
          Sub-Target Value (Optional)
        </label>
        <input
          type="number"
          id="sub_quality"
          v-model="form.sub_quality"
          min="0"
          step="0.1"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label for="sub_unit" class="block text-sm font-medium text-gray-700">Sub-Unit (Optional)</label>
        <input
          type="text"
          id="sub_unit"
          v-model="form.sub_unit"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="e.g., km, kg, times"
        />
      </div>
    </div>

    <!-- Duration -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label for="duration_value" class="block text-sm font-medium text-gray-700">Duration</label>
        <input
          type="number"
          id="duration_value"
          v-model="form.duration_value"
          min="1"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label for="duration_type" class="block text-sm font-medium text-gray-700">Duration Type</label>
        <select
          id="duration_type"
          v-model="form.duration_type"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option v-for="type in durationTypes" :key="type.value" :value="type.value">
            {{ type.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Status -->
    <div>
      <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
      <select
        id="status"
        v-model="form.status"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      >
        <option value="active">Active</option>
        <option value="completed">Completed</option>
        <option value="paused">Paused</option>
      </select>
    </div>

    <!-- Form Actions -->
    <div class="flex justify-end gap-3">
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
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