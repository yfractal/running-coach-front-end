<script setup>
import { computed } from 'vue'

const props = defineProps({
  plan: {
    type: Object,
    required: true
  }
})

const daysLeft = computed(() => {
  return Math.max(0, Math.ceil((new Date(props.plan.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
})

const statusColor = computed(() => {
  switch (props.plan.status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'completed':
      return 'bg-blue-100 text-blue-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
})
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer">
    <div class="flex justify-between items-start mb-4">
      <h3 class="text-xl font-semibold text-gray-900">{{ plan.name }}</h3>
      <span :class="['px-2 py-1 text-sm font-medium rounded-full', statusColor]">
        {{ plan.status }}
      </span>
    </div>
    
    <div class="space-y-2">
      <p class="text-gray-600">
        Target: {{ plan.quality }} {{ plan.unit }}
      </p>
      <p v-if="plan.sub_quality" class="text-gray-600">
        {{ plan.sub_quality }} {{ plan.sub_unit }} per {{ plan.duration_type }}
      </p>
      <div class="flex justify-between text-sm text-gray-500">
        <span>Started: {{ new Date(plan.start_date) }}</span>
        <span>{{ daysLeft }} days left</span>
      </div>
    </div>

    <p v-if="plan.description" class="mt-4 text-gray-600 text-sm line-clamp-2">
      {{ plan.description }}
    </p>
  </div>
</template> 
