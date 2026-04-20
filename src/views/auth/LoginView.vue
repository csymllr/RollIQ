<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  const { error: err } = await auth.signInWithPassword(email.value, password.value)
  loading.value = false
  if (err) { error.value = err.message; return }
  router.push('/dashboard')
}
</script>

<template>
  <div class="min-h-screen bg-slate-900 flex items-center justify-center px-4">
    <div class="w-full max-w-sm">
      <h1 class="text-3xl font-bold text-white text-center mb-8">RollIQ</h1>
      <form @submit.prevent="submit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1">Email</label>
          <input v-model="email" type="email" required autocomplete="email"
            class="w-full rounded-lg bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-indigo-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1">Password</label>
          <input v-model="password" type="password" required autocomplete="current-password"
            class="w-full rounded-lg bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-indigo-500" />
        </div>
        <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>
        <button type="submit" :disabled="loading"
          class="tap-target w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-3 transition-colors">
          {{ loading ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>
      <p class="mt-6 text-center text-slate-400 text-sm">
        No account? <router-link to="/signup" class="text-indigo-400 hover:text-indigo-300">Sign up</router-link>
      </p>
    </div>
  </div>
</template>
