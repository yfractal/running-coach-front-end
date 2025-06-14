<script setup>
import { ref } from 'vue'

const props = defineProps({
  plan: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['save', 'cancel'])

const formData = ref({
  name: props.plan.name,
  description: props.plan.description || '',
  start_date: props.plan.start_date?.split('T')[0] || new Date().toISOString().split('T')[0],
  duration_type: props.plan.duration_type || 'weekly',
  duration_value: props.plan.duration_value || 1,
  quality: props.plan.quality,
  unit: props.plan.unit,
  sub_quality: props.plan.sub_quality,
  sub_unit: props.plan.sub_unit,
  status: props.plan.status
})

const handleSubmit = () => {
  emit('save', { ...formData.value })
}

const statusOptions = ['active', 'completed', 'cancelled']
const durationTypes = ['dayly', 'weekly', 'monthly']
</script>

<template>
  <form @submit.prevent="handleSubmit" class="bg-white p-4 rounded-lg border space-y-4">
    <!-- Name and Status -->
    <div class="flex gap-4">
      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
          type="text"
          v-model="formData.name"
          class="w-full px-3 py-2 border rounded-md text-sm"
          required
        />
      </div>
      <div class="w-40">
        <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          v-model="formData.status"
          class="w-full px-3 py-2 border rounded-md text-sm bg-white"
        >
          <option v-for="status in statusOptions" :key="status" :value="status">
            {{ status.charAt(0).toUpperCase() + status.slice(1) }}
          </option>
        </select>
      </div>
    </div>

    <!-- Description -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
      <textarea
        v-model="formData.description"
        rows="2"
        class="w-full px-3 py-2 border rounded-md text-sm"
        placeholder="Enter plan description..."
      ></textarea>
    </div>

    <!-- Start Date and Duration -->
    <div class="flex gap-4">
      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
        <input
          type="date"
          v-model="formData.start_date"
          class="w-full px-3 py-2 border rounded-md text-sm"
          required
        />
      </div>
      <div class="w-32">
        <label class="block text-sm font-medium text-gray-700 mb-1">Duration</label>
        <input
          type="number"
          v-model="formData.duration_value"
          class="w-full px-3 py-2 border rounded-md text-sm"
          min="1"
          required
        />
      </div>
      <div class="w-40">
        <label class="block text-sm font-medium text-gray-700 mb-1">Duration Type</label>
        <select
          v-model="formData.duration_type"
          class="w-full px-3 py-2 border rounded-md text-sm bg-white"
        >
          <option v-for="type in durationTypes" :key="type" :value="type">
            {{ type.charAt(0).toUpperCase() + type.slice(1) }}
          </option>
        </select>
      </div>
    </div>

    <!-- Main Target -->
    <div class="flex gap-4">
      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-700 mb-1">Target Value</label>
        <input
          type="number"
          v-model="formData.quality"
          class="w-full px-3 py-2 border rounded-md text-sm"
          step="0.01"
          required
        />
      </div>
      <div class="w-40">
        <label class="block text-sm font-medium text-gray-700 mb-1">Unit</label>
        <input
          type="text"
          v-model="formData.unit"
          class="w-full px-3 py-2 border rounded-md text-sm"
          required
        />
      </div>
    </div>

    <!-- Sub Target -->
    <div class="flex gap-4">
      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-700 mb-1">Sub Target Value (Optional)</label>
        <input
          type="number"
          v-model="formData.sub_quality"
          class="w-full px-3 py-2 border rounded-md text-sm"
          step="0.01"
        />
      </div>
      <div class="w-40">
        <label class="block text-sm font-medium text-gray-700 mb-1">Sub Unit</label>
        <input
          type="text"
          v-model="formData.sub_unit"
          class="w-full px-3 py-2 border rounded-md text-sm"
          :required="formData.sub_quality"
        />
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-end gap-2 pt-2">
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-3 py-1 text-gray-600 rounded text-sm hover:bg-gray-100"
      >
        Cancel
      </button>
      <button
        type="submit"
        class="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
      >
        Save
      </button>
    </div>
  </form>
</template> 
