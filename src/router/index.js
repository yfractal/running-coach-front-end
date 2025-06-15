import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/PlansView.vue')
  },
  {
    path: '/plans/:_id',
    name: 'PlanDetails',
    component: () => import('@/views/PlanDetails.vue'),
    props: true
  },
  {
    path: '/workouts',
    name: 'Workouts',
    component: () => import('@/views/WorkoutsView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 