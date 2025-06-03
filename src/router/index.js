import { createRouter, createWebHistory } from 'vue-router'
import ListView from '../views/ListView.vue'
import ConversationDetail from '../views/ConversationDetail.vue'
import UserConversationsView from '../views/UserConversationsView.vue'
import LoginView from '../views/LoginView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: ListView,
    meta: { requiresAuth: true }
  },
  {
    path: '/conversations/:id',
    name: 'conversation-detail',
    component: ConversationDetail,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/users/:userId/conversations',
    name: 'user-conversations',
    component: UserConversationsView,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router 