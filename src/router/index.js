import { createRouter, createWebHistory } from 'vue-router'

// Pre-import components to avoid dynamic import issues
import PlansView from '@/views/PlansView.vue'
import PlanDetails from '@/views/PlanDetails.vue'
import Plan2CalendarView from '@/views/Plan2CalendarView.vue'
import WorkoutsAggregateView from '@/views/WorkoutsAggregateView.vue'
import WorkoutsIndexView from '@/views/WorkoutsIndexView.vue'
import WorkoutShowView from '@/views/WorkoutShowView.vue'
import WorkoutEditView from '@/views/WorkoutEditView.vue'
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
    path: '/workouts-aggregate',
    name: 'WorkoutsAggregate',
    component: WorkoutsAggregateView
  },
  {
    path: '/workouts',
    name: 'WorkoutsIndex',
    component: WorkoutsIndexView
  },
  {
    path: '/workouts/:id',
    name: 'WorkoutShow',
    component: WorkoutShowView,
    props: true
  },
  {
    path: '/workouts/:id/edit',
    name: 'WorkoutEdit',
    component: WorkoutEditView,
    props: true
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