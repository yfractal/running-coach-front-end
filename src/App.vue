<script setup>
import TheNavigation from '@/components/TheNavigation.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <TheNavigation />
    <router-view />
  </div>
</template>

<style>
@import '@/assets/tailwind.css';

body {
  margin: 0;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}
</style>
