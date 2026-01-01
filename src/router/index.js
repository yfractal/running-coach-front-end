import { createRouter, createWebHistory } from 'vue-router'

// Pre-import components to avoid dynamic import issues
import PlansView from '@/views/PlansView.vue'
import PlanDetails from '@/views/PlanDetails.vue'
import Plan2CalendarView from '@/views/Plan2CalendarView.vue'
import WorkoutsView from '@/views/WorkoutsView.vue'
import GoalsView from '@/views/GoalsView.vue'
import GoalDetails from '@/views/GoalDetails.vue'
import RecordsView from '@/views/RecordsView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: PlansView
  },
  {
    path: '/plans/:_id',
    name: 'PlanDetails',
    component: PlanDetails,
    props: true
  },
  {
    path: '/plan2/calendar',
    name: 'Plan2Calendar',
    component: Plan2CalendarView
  },
  {
    path: '/workouts',
    name: 'Workouts',
    component: WorkoutsView
  },
  {
    path: '/goals',
    name: 'Goals',
    component: GoalsView
  },
  {
    path: '/goals/:id',
    name: 'GoalDetails',
    component: GoalDetails,
    props: true
  },
  {
    path: '/records',
    name: 'Records',
    component: RecordsView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 