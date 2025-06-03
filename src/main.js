import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { clerkPlugin } from '@clerk/vue'
import './style.css'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY


if (!clerkPubKey) {
  throw new Error('Add your Clerk Publishable Key to the .env file')
}

const app = createApp(App)
const pinia = createPinia()


// Initialize Clerk using the plugin
app.use(clerkPlugin, { publishableKey: clerkPubKey })
app.use(router)
app.use(pinia)
app.mount('#app')
