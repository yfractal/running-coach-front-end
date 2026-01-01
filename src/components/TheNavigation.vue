<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const currentRoute = computed(() => route.name)
</script>

<template>
  <nav class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <div class="flex space-x-8">
            <router-link 
              to="/" 
              class="inline-flex items-center px-1 pt-1 border-b-2"
              :class="[
                currentRoute === 'Home'
                  ? 'border-blue-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              ]"
            >
              Plans
            </router-link>
            
            <router-link 
              to="/plan2/calendar" 
              class="inline-flex items-center px-1 pt-1 border-b-2"
              :class="[
                currentRoute === 'Plan2Calendar'
                  ? 'border-blue-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              ]"
            >
              Plan2 Calendar
            </router-link>
            
            <router-link 
              to="/workouts" 
              class="inline-flex items-center px-1 pt-1 border-b-2"
              :class="[
                currentRoute === 'Workouts'
                  ? 'border-blue-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              ]"
            >
              Workouts
            </router-link>
            
            <router-link 
              to="/goals" 
              class="inline-flex items-center px-1 pt-1 border-b-2"
              :class="[
                currentRoute === 'Goals'
                  ? 'border-blue-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              ]"
            >
              Goals
            </router-link>
            
            <router-link 
              to="/records" 
              class="inline-flex items-center px-1 pt-1 border-b-2"
              :class="[
                currentRoute === 'Records'
                  ? 'border-blue-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              ]"
            >
              Records
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template> 