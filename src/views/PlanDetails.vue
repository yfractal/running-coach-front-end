<script setup>
const props = defineProps({
  _id: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Plan Details</h1>
    <div class="bg-white rounded-lg shadow-md p-6">
      <!-- Plan details will be rendered here -->
      <p>Plan ID: {{ _id }}</p>
    </div>
  </div>
</template> 