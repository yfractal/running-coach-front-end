<template>
  <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex justify-between items-center mb-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Plan2 Calendar</h1>
          <p class="mt-2 text-sm text-gray-600">
            View and manage your plans in calendar format.
          </p>
        </div>
        <div class="flex items-center gap-3">
          <!-- View Selector -->
          <div class="relative">
            <button
              @click="showViewMenu = !showViewMenu"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {{ currentViewLabel }}
              <svg
                class="ml-2 -mr-1 h-5 w-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            
            <!-- Dropdown Menu -->
            <div
              v-if="showViewMenu"
              class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
            >
              <div class="py-1">
                <button
                  v-for="view in viewOptions"
                  :key="view.value"
                  @click="changeView(view.value)"
                  :class="[
                    'w-full text-left px-4 py-2 text-sm',
                    currentView === view.value
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  ]"
                >
                  <div class="flex justify-between items-center">
                    <span>{{ view.label }}</span>
                    <span class="text-xs text-gray-500">{{ view.shortcut }}</span>
                  </div>
                </button>
              </div>
            </div>
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
            Create Plan
          </button>
        </div>
      </div>
    </div>

    <!-- Calendar -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <!-- Year View (Custom) -->
      <div v-if="currentView === 'year'" class="year-view">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="month in 12"
            :key="`year-month-${month}-${plans.length}`"
            class="month-calendar"
          >
            <h3 class="text-lg font-semibold mb-2 text-center">
              {{ getMonthName(month - 1) }}
            </h3>
            <FullCalendar
              :key="`fc-${month}-${plans.length}`"
              :options="getYearMonthOptions(month - 1)"
              class="year-month-calendar"
            />
          </div>
        </div>
      </div>
      
      <!-- Standard Calendar Views -->
      <FullCalendar
        v-else
        ref="fullCalendar"
        :options="calendarOptions"
        class="calendar-container"
      />
    </div>

    <!-- Create Plan Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"
      @click.self="showCreateModal = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-900">Create New Plan</h2>
          <button
            @click="showCreateModal = false"
            class="text-gray-400 hover:text-gray-500"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <Plan2Form
          @submit="handleCreatePlan"
          @cancel="showCreateModal = false"
        />
      </div>
    </div>

    <!-- Plan Details Modal -->
    <div
      v-if="selectedPlan"
      class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"
      @click.self="selectedPlan = null"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-900">{{ selectedPlan.name }}</h2>
          <button
            @click="selectedPlan = null"
            class="text-gray-400 hover:text-gray-500"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">ID</label>
            <p class="mt-1 text-sm text-gray-900 font-mono">{{ selectedPlan._id }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Summary</label>
            <p class="mt-1 text-sm text-gray-900">{{ selectedPlan.summary || 'No summary' }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Duration</label>
            <p class="mt-1 text-sm text-gray-900">{{ formatDuration(selectedPlan.duration_seconds) }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">State</label>
            <span
              :class="[
                'mt-1 inline-block px-2 py-1 text-xs font-medium rounded-full',
                selectedPlan.state === 'executed'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
              ]"
            >
              {{ selectedPlan.state }}
            </span>
          </div>
          <div v-if="selectedPlan.tags && selectedPlan.tags.length > 0">
            <label class="block text-sm font-medium text-gray-700">Tags</label>
            <div class="mt-1 flex flex-wrap gap-2">
              <span
                v-for="tag in selectedPlan.tags"
                :key="tag"
                class="inline-block px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800"
              >
                {{ tag }}
              </span>
            </div>
          </div>
          <div class="flex justify-end gap-2 pt-4">
            <button
              @click="handleDeletePlan"
              class="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700"
            >
              Delete
            </button>
            <button
              @click="selectedPlan = null"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import { plan2Service } from '@/services/plan2Service'
import Plan2Form from '@/components/Plan2Form.vue'

const fullCalendar = ref(null)
const showViewMenu = ref(false)
const showCreateModal = ref(false)
const selectedPlan = ref(null)
const currentView = ref('dayGridMonth')
const plans = ref([])
const isLoading = ref(false)

const viewOptions = [
  { value: 'dayGridDay', label: 'Day', shortcut: 'D' },
  { value: 'timeGridWeek', label: 'Week', shortcut: 'W' },
  { value: 'dayGridMonth', label: 'Month', shortcut: 'M' },
  { value: 'listWeek', label: 'Agenda', shortcut: 'A' },
  { value: 'year', label: 'Year', shortcut: 'Y' }
]

const currentViewLabel = computed(() => {
  const view = viewOptions.find(v => v.value === currentView.value)
  return view ? view.label : 'Month'
})

const changeView = (view) => {
  currentView.value = view
  if (view !== 'year' && fullCalendar.value) {
    const calendarApi = fullCalendar.value.getApi()
    // Map our view names to FullCalendar view names
    const viewMap = {
      'dayGridDay': 'dayGridDay',
      'timeGridWeek': 'timeGridWeek',
      'dayGridMonth': 'dayGridMonth',
      'listWeek': 'listWeek'
    }
    if (viewMap[view]) {
      try {
        calendarApi.changeView(viewMap[view])
      } catch (e) {
        console.error('Error changing view:', e)
      }
    }
  }
  showViewMenu.value = false
}

const fetchPlans = async () => {
  try {
    isLoading.value = true
    const data = await plan2Service.getPlan2s()
    plans.value = data
    
    // Update calendar events
    if (fullCalendar.value) {
      const calendarApi = fullCalendar.value.getApi()
      calendarApi.removeAllEvents()
      
      const events = data.map(plan => ({
        id: plan._id,
        title: plan.name,
        start: plan.start_at,
        end: plan.end_at,
        backgroundColor: plan.color || '#3b82f6',
        borderColor: plan.color || '#3b82f6',
        extendedProps: {
          plan: plan
        }
      }))
      
      calendarApi.addEventSource(events)
    }
  } catch (error) {
    console.error('Failed to fetch plans:', error)
    alert('Failed to load plans. Please try again.')
  } finally {
    isLoading.value = false
  }
}

const handleCreatePlan = async (planData) => {
  try {
    await plan2Service.createPlan2(planData.plan2, planData.tags || [])
    showCreateModal.value = false
    await fetchPlans()
  } catch (error) {
    console.error('Failed to create plan:', error)
    alert('Failed to create plan. Please try again.')
  }
}

const handleDeletePlan = async () => {
  if (!selectedPlan.value) return
  
  if (confirm('Are you sure you want to delete this plan?')) {
    try {
      await plan2Service.deletePlan2(selectedPlan.value._id)
      selectedPlan.value = null
      await fetchPlans()
    } catch (error) {
      console.error('Failed to delete plan:', error)
      alert('Failed to delete plan. Please try again.')
    }
  }
}

const getYearMonthOptions = (monthIndex) => {
  const currentYear = new Date().getFullYear()
  const firstDay = new Date(currentYear, monthIndex, 1)
  const lastDay = new Date(currentYear, monthIndex + 1, 0)
  
  // Filter plans that overlap with this month
  const monthPlans = plans.value.filter(plan => {
    const planStart = new Date(plan.start_at)
    const planEnd = new Date(plan.end_at)
    return (planStart <= lastDay && planEnd >= firstDay)
  })
  
  return {
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: false,
    height: 'auto',
    events: monthPlans.map(plan => ({
      id: plan._id,
      title: plan.name,
      start: plan.start_at,
      end: plan.end_at,
      backgroundColor: plan.color || '#3b82f6',
      borderColor: plan.color || '#3b82f6',
      extendedProps: { plan }
    })),
    eventClick: (info) => {
      selectedPlan.value = info.event.extendedProps.plan
    },
    initialDate: firstDay,
    editable: false,
    selectable: false,
    dayMaxEvents: 2,
    moreLinkClick: false,
    aspectRatio: 1.2
  }
}

const getMonthName = (monthIndex) => {
  const date = new Date(2000, monthIndex, 1)
  return date.toLocaleDateString('en-US', { month: 'long' })
}

const formatDuration = (seconds) => {
  if (!seconds) return '0 seconds'
  
  const days = Math.floor(seconds / (24 * 60 * 60))
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60))
  const minutes = Math.floor((seconds % (60 * 60)) / 60)
  
  const parts = []
  if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`)
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`)
  if (minutes > 0 && days === 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`)
  
  return parts.length > 0 ? parts.join(', ') : `${seconds} second${seconds !== 1 ? 's' : ''}`
}

const calendarOptions = computed(() => {
  const viewMap = {
    'dayGridDay': 'dayGridDay',
    'timeGridWeek': 'timeGridWeek',
    'dayGridMonth': 'dayGridMonth',
    'listWeek': 'listWeek'
  }
  
  return {
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
    initialView: viewMap[currentView.value] || 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridDay,timeGridWeek,dayGridMonth,listWeek'
    },
    height: 'auto',
    events: plans.value.map(plan => ({
      id: plan._id,
      title: plan.name,
      start: plan.start_at,
      end: plan.end_at,
      backgroundColor: plan.color || '#3b82f6',
      borderColor: plan.color || '#3b82f6',
      extendedProps: {
        plan: plan
      }
    })),
    eventClick: (info) => {
      selectedPlan.value = info.event.extendedProps.plan
    },
    eventDidMount: (info) => {
      info.el.setAttribute('title', info.event.title)
    },
    datesSet: () => {
      // Could fetch plans for specific date range here if needed
    },
    editable: false,
    selectable: false,
    dayMaxEvents: true,
    moreLinkClick: 'popover',
    locale: 'en'
  }
})

onMounted(() => {
  fetchPlans()
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.relative')) {
      showViewMenu.value = false
    }
  })
})
</script>

<style>
.calendar-container {
  min-height: 600px;
}

.fc-event {
  cursor: pointer;
}

.fc-event:hover {
  opacity: 0.8;
}

.year-view {
  min-height: 600px;
}

.year-month-calendar {
  min-height: 200px;
}

.month-calendar {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  background: white;
}
</style>

