<script setup>
import { ref } from 'vue'

const props = defineProps({
  record: {
    type: Object,
    default: () => ({
      date: new Date().toISOString().split('T')[0],
      value: '',
      notes: ''
    })
  },
  unit: {
    type: String,
    required: true
  },
  isNew: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['save', 'cancel'])

const formData = ref({
  date: props.record.date,
  value: props.record.value,
  notes: props.record.notes
})

const handleSubmit = () => {
  emit('save', { ...formData.value })
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="flex items-center gap-4 py-2">
    <input
      type="date"
      v-model="formData.date"
      class="px-2 py-1 border rounded text-sm w-32"
      required
    />
    <div class="flex items-center gap-1">
      <input
        type="number"
        v-model="formData.value"
        class="px-2 py-1 border rounded text-sm w-24"
        step="0.01"
        required
      />
      <span class="text-sm text-gray-600">{{ unit }}</span>
    </div>
    <input
      type="text"
      v-model="formData.notes"
      :placeholder="isNew ? 'Add notes (optional)' : 'Edit notes (optional)'"
      class="px-2 py-1 border rounded text-sm flex-1"
    />
    <div class="flex items-center gap-2">
      <button
        type="submit"
        class="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
      >
        {{ isNew ? 'Add' : 'Save' }}
      </button>
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-3 py-1 text-gray-600 rounded text-sm hover:bg-gray-100"
      >
        Cancel
      </button>
    </div>
  </form>
</template> 