import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login',  component: () => import('@/views/auth/LoginView.vue'),  meta: { requiresAuth: false, hideNav: true } },
    { path: '/signup', component: () => import('@/views/auth/SignupView.vue'), meta: { requiresAuth: false, hideNav: true } },
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', component: () => import('@/views/DashboardView.vue'),  meta: { requiresAuth: true } },
    { path: '/profile',   component: () => import('@/views/ProfileView.vue'),    meta: { requiresAuth: true } },
    { path: '/arsenal',       component: () => import('@/views/arsenal/ArsenalListView.vue'), meta: { requiresAuth: true } },
    { path: '/arsenal/new',   component: () => import('@/views/arsenal/BallEditView.vue'),    meta: { requiresAuth: true } },
    { path: '/arsenal/:id/edit', component: () => import('@/views/arsenal/BallEditView.vue'), meta: { requiresAuth: true } },
    { path: '/sessions',         component: () => import('@/views/sessions/SessionListView.vue'),   meta: { requiresAuth: true } },
    { path: '/sessions/new',     component: () => import('@/views/sessions/SessionNewView.vue'),    meta: { requiresAuth: true } },
    { path: '/sessions/:id',     component: () => import('@/views/sessions/SessionDetailView.vue'), meta: { requiresAuth: true } },
    { path: '/sessions/:sessionId/games/:gameId', component: () => import('@/views/sessions/GameScoreView.vue'), meta: { requiresAuth: true } },
    { path: '/analytics', component: () => import('@/views/analytics/AnalyticsView.vue'), meta: { requiresAuth: true } },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (auth.loading) await new Promise<void>((resolve) => {
    const stop = setInterval(() => { if (!auth.loading) { clearInterval(stop); resolve() } }, 50)
  })
  if (to.meta.requiresAuth && !auth.isAuthenticated()) return '/login'
  if ((to.path === '/login' || to.path === '/signup') && auth.isAuthenticated()) return '/dashboard'
})

export default router
