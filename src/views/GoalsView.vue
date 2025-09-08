<script setup>
import { ref, onMounted, computed } from 'vue'
import { goalService } from '@/services/goalService'
import GoalCard from '@/components/GoalCard.vue'
import GoalForm from '@/components/GoalForm.vue'

// State
const goals = ref([])
const meta = ref({
  total: 0,
  categories: [],
  statuses: []
})
const availableTags = ref([])
const isLoading = ref(true)
const error = ref(null)

// Modals
const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingGoal = ref(null)

// Filters
const selectedCategory = ref('')
const selectedStatus = ref('')
const selectedTags = ref([])

// Computed filtered goals
const filteredGoals = computed(() => {
  let filtered = goals.value

  if (selectedCategory.value) {
    filtered = filtered.filter(goal => goal.category === selectedCategory.value)
  }

  if (selectedStatus.value) {
    filtered = filtered.filter(goal => goal.status === selectedStatus.value)
  }

  if (selectedTags.value.length > 0) {
    filtered = filtered.filter(goal => 
      selectedTags.value.every(tag => goal.tags.includes(tag))
    )
  }

  return filtered
})

// Computed stats
const goalStats = computed(() => {
  const stats = {
    total: goals.value.length,
    active: 0,
    completed: 0,
    paused: 0,
    cancelled: 0
  }

  goals.value.forEach(goal => {
    stats[goal.status]++
  })

  return stats
})

// Fetch goals and tags
const fetchGoals = async () => {
  try {
    isLoading.value = true
    error.value = null
    
    const filters = {}
    if (selectedCategory.value) filters.category = selectedCategory.value
    if (selectedStatus.value) filters.status = selectedStatus.value
    
    const response = await goalService.getGoals(filters)
    goals.value = response.goals
    meta.value = response.meta
  } catch (err) {
    error.value = 'Failed to load goals. Please try again later.'
    console.error('Error fetching goals:', err)
  } finally {
    isLoading.value = false
  }
}

const fetchTags = async () => {
  try {
    const response = await goalService.getTags()
    availableTags.value = response.tags || response || []
  } catch (err) {
    console.error('Error fetching tags:', err)
  }
}

// Handle create goal
const handleCreateGoal = async (goalData) => {
  try {
    await goalService.createGoal(goalData)
    showCreateModal.value = false
    await fetchGoals()
  } catch (err) {
    console.error('Error creating goal:', err)
    error.value = 'Failed to create goal. Please try again.'
  }
}

// Handle edit goal
const handleEditGoal = (goal) => {
  editingGoal.value = goal
  showEditModal.value = true
}

// Handle update goal
const handleUpdateGoal = async (goalData) => {
  try {
    await goalService.updateGoal(editingGoal.value.id, goalData)
    showEditModal.value = false
    editingGoal.value = null
    await fetchGoals()
  } catch (err) {
    console.error('Error updating goal:', err)
    error.value = 'Failed to update goal. Please try again.'
  }
}

// Handle delete goal
const handleDeleteGoal = (goalId) => {
  goals.value = goals.value.filter(goal => goal.id !== goalId)
}

// Handle goal update (from status changes)
const handleGoalUpdate = async () => {
  await fetchGoals()
}

// Tag filtering functions
const toggleTag = (tag) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

const removeTag = (tag) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  }
}

// Clear filters
const clearFilters = () => {
  selectedCategory.value = ''
  selectedStatus.value = ''
  selectedTags.value = []
}

// Close modals
const closeCreateModal = () => {
  showCreateModal.value = false
}

const closeEditModal = () => {
  showEditModal.value = false
  editingGoal.value = null
}

// Initialize
onMounted(() => {
  fetchGoals()
  fetchTags()
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex justify-between items-start mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Goals</h1>
          <p class="mt-2 text-sm text-gray-600">
            Track and manage your personal and professional goals.
          </p>
        </div>
        <button
          @click="showCreateModal = true"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg 
            class="-ml-1 mr-2 h-5 w-5" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M12 4v16m8-8H4" 
            />
          </svg>
          Create Goal
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div class="bg-white rounded-lg border border-gray-200 p-4">
          <div class="text-2xl font-bold text-gray-900">{{ goalStats.total }}</div>
          <div class="text-sm text-gray-600">Total Goals</div>
        </div>
        <div class="bg-white rounded-lg border border-gray-200 p-4">
          <div class="text-2xl font-bold text-green-600">{{ goalStats.active }}</div>
          <div class="text-sm text-gray-600">Active</div>
        </div>
        <div class="bg-white rounded-lg border border-gray-200 p-4">
          <div class="text-2xl font-bold text-blue-600">{{ goalStats.completed }}</div>
          <div class="text-sm text-gray-600">Completed</div>
        </div>
        <div class="bg-white rounded-lg border border-gray-200 p-4">
          <div class="text-2xl font-bold text-yellow-600">{{ goalStats.paused }}</div>
          <div class="text-sm text-gray-600">Paused</div>
        </div>
        <div class="bg-white rounded-lg border border-gray-200 p-4">
          <div class="text-2xl font-bold text-red-600">{{ goalStats.cancelled }}</div>
          <div class="text-sm text-gray-600">Cancelled</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center space-x-2">
            <label for="category-filter" class="text-sm font-medium text-gray-700">
              Category:
            </label>
            <select
              id="category-filter"
              v-model="selectedCategory"
              @change="fetchGoals"
              class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              <option v-for="category in meta.categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>

          <div class="flex items-center space-x-2">
            <label for="status-filter" class="text-sm font-medium text-gray-700">
              Status:
            </label>
            <select
              id="status-filter"
              v-model="selectedStatus"
              @change="fetchGoals"
              class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option v-for="status in meta.statuses" :key="status" :value="status">
                {{ status.charAt(0).toUpperCase() + status.slice(1) }}
              </option>
            </select>
          </div>

          <!-- Tags Filter -->
          <div class="flex items-start space-x-2">
            <label class="text-sm font-medium text-gray-700 mt-1">
              Tags:
            </label>
            <div class="flex-1">
              <div v-if="availableTags.length > 0" class="flex flex-wrap gap-2">
                <button
                  v-for="tag in availableTags"
                  :key="tag"
                  @click="toggleTag(tag)"
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors"
                  :class="selectedTags.includes(tag) 
                    ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'"
                >
                  {{ tag }}
                  <svg v-if="selectedTags.includes(tag)" class="ml-1 w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
              <div v-else class="text-sm text-gray-500">
                No tags available
              </div>
            </div>
          </div>

          <!-- Clear Filters Button -->
          <button
            v-if="selectedCategory || selectedStatus || selectedTags.length > 0"
            @click="clearFilters(); fetchGoals()"
            class="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear Filters
          </button>

          <div class="ml-auto text-sm text-gray-600">
            {{ filteredGoals.length }} of {{ goalStats.total }} goals
            <span v-if="selectedTags.length > 0" class="ml-2 text-blue-600">
              ({{ selectedTags.length }} tag{{ selectedTags.length > 1 ? 's' : '' }} selected)
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center min-h-[300px]">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-700 mb-6"
    >
      {{ error }}
      <button
        @click="fetchGoals"
        class="ml-2 text-red-600 hover:text-red-800 font-medium underline"
      >
        Try Again
      </button>
    </div>

    <!-- Goals Grid -->
    <div v-else>
      <template v-if="filteredGoals.length > 0">
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <GoalCard
            v-for="goal in filteredGoals"
            :key="goal.id"
            :goal="goal"
            @update="handleGoalUpdate"
            @edit="handleEditGoal"
            @delete="handleDeleteGoal"
          />
        </div>
      </template>
      
      <!-- Empty State -->
      <div
        v-else
        class="bg-white rounded-lg border border-gray-200 p-12 text-center"
      >
        <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
        
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          {{ selectedCategory || selectedStatus ? 'No Goals Found' : 'No Goals Yet' }}
        </h3>
        
        <p class="text-gray-600 mb-6">
          {{ selectedCategory || selectedStatus 
            ? 'Try adjusting your filters or create a new goal.' 
            : 'Get started by creating your first goal to track your progress.' 
          }}
        </p>
        
        <button
          @click="showCreateModal = true"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Create Your First Goal
        </button>
      </div>
    </div>

    <!-- Create Goal Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold text-gray-900">Create New Goal</h2>
          <button
            @click="closeCreateModal"
            class="text-gray-400 hover:text-gray-500"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <GoalForm
          @submit="handleCreateGoal"
          @cancel="closeCreateModal"
        />
      </div>
    </div>

    <!-- Edit Goal Modal -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold text-gray-900">Edit Goal</h2>
          <button
            @click="closeEditModal"
            class="text-gray-400 hover:text-gray-500"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <GoalForm
          :goal="editingGoal"
          :is-editing="true"
          @submit="handleUpdateGoal"
          @cancel="closeEditModal"
        />
      </div>
    </div>
  </div>
</template>
