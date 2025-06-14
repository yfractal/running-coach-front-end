<script setup>
import { ref } from 'vue'

const emit = defineEmits(['submit', 'cancel'])

const formData = ref({
  name: '',
  unit: '',
  quality: 0,
  subUnit: '',
  subQuality: 0,
  durationType: 'daily',
  durationValue: 1,
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  description: '',
  status: 'active'
})

const handleSubmit = () => {
  emit('submit', { ...formData.value })
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div class="space-y-4">
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700">
          Plan Name
        </label>
        <input
          type="text"
          id="name"
          v-model="formData.name"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="quality" class="block text-sm font-medium text-gray-700">
            Target Amount
          </label>
          <input
            type="number"
            id="quality"
            v-model.number="formData.quality"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label for="unit" class="block text-sm font-medium text-gray-700">
            Unit
          </label>
          <input
            type="text"
            id="unit"
            v-model="formData.unit"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="subQuality" class="block text-sm font-medium text-gray-700">
            Sub-Target Amount (Optional)
          </label>
          <input
            type="number"
            id="subQuality"
            v-model.number="formData.subQuality"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label for="subUnit" class="block text-sm font-medium text-gray-700">
            Sub-Unit (Optional)
          </label>
          <input
            type="text"
            id="subUnit"
            v-model="formData.subUnit"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="durationType" class="block text-sm font-medium text-gray-700">
            Duration Type
          </label>
          <select
            id="durationType"
            v-model="formData.durationType"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div>
          <label for="durationValue" class="block text-sm font-medium text-gray-700">
            Duration Value
          </label>
          <input
            type="number"
            id="durationValue"
            v-model.number="formData.durationValue"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            min="1"
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="startDate" class="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            v-model="formData.startDate"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label for="endDate" class="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            v-model="formData.endDate"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            :min="formData.startDate"
          />
        </div>
      </div>

      <div>
        <label for="description" class="block text-sm font-medium text-gray-700">
          Description (Optional)
        </label>
        <textarea
          id="description"
          v-model="formData.description"
          rows="3"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
    </div>

    <div class="flex justify-end space-x-4">
      <button
        type="button"
        @click="emit('cancel')"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Cancel
      </button>
      <button
        type="submit"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Save Plan
      </button>
    </div>
  </form>
</template> 