import { createRouter, createWebHistory } from 'vue-router'

// Pre-import components to avoid dynamic import issues
import PlansView from '@/views/PlansView.vue'
import PlanDetails from '@/views/PlanDetails.vue'
import WorkoutsView from '@/views/WorkoutsView.vue'
import GoalsView from '@/views/GoalsView.vue'

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
    path: '/workouts',
    name: 'Workouts',
    component: WorkoutsView
  },
  {
    path: '/goals',
    name: 'Goals',
    component: GoalsView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 