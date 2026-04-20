<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSessionsStore } from '@/stores/sessions'
import { useBowlerStore } from '@/stores/bowler'

const auth = useAuthStore()
const router = useRouter()
const sessions = useSessionsStore()
const bowler = useBowlerStore()

onMounted(async () => {
  await bowler.fetchMine()
  await sessions.fetchAll()
})

async function signOut() {
  await auth.signOut()
  router.push('/login')
}

const recentSessions = computed(() => sessions.sessions.slice(0, 5))

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const eventTypeLabel: Record<string, string> = {
  practice: 'Practice',
  league: 'League',
  tournament: 'Tournament',
}
</script>

<template>
  <div class="p-4 pb-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold text-white">RollIQ</h1>
        <p v-if="bowler.profile" class="text-slate-400 text-sm">{{ bowler.profile.display_name }}</p>
      </div>
      <button @click="signOut" class="tap-target text-slate-400 text-sm px-3">Sign out</button>
    </div>

    <!-- Quick-start when no sessions -->
    <div v-if="sessions.sessions.length === 0 && !sessions.loading" class="space-y-4">
      <div class="bg-slate-800 rounded-2xl p-5 text-center">
        <p class="text-slate-300 font-medium mb-1">Ready to bowl?</p>
        <p class="text-slate-500 text-sm mb-4">Log your first session to start tracking.</p>
        <router-link to="/sessions/new"
          class="tap-target inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl px-5 py-2.5">
          Start Session
        </router-link>
      </div>
      <div v-if="!bowler.profile" class="bg-slate-800 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p class="text-white text-sm font-medium">Set up your profile</p>
          <p class="text-slate-400 text-xs mt-0.5">Add your bowler details for better tracking</p>
        </div>
        <router-link to="/profile" class="tap-target text-indigo-400 text-sm">Set up</router-link>
      </div>
    </div>

    <!-- Sessions exist -->
    <div v-else class="space-y-4">
      <!-- Recent sessions -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-sm font-semibold text-slate-400 uppercase tracking-wider">Recent Sessions</h2>
          <router-link to="/sessions" class="tap-target text-indigo-400 text-xs">All</router-link>
        </div>
        <div class="space-y-2">
          <router-link v-for="s in recentSessions" :key="s.id" :to="`/sessions/${s.id}`"
            class="flex items-center justify-between bg-slate-800 hover:bg-slate-700 rounded-xl px-4 py-3 transition-colors">
            <div>
              <p class="text-white text-sm font-medium">{{ s.center_name }}</p>
              <p class="text-slate-500 text-xs">{{ formatDate(s.session_date) }} · {{ eventTypeLabel[s.event_type] }}</p>
            </div>
            <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </router-link>
        </div>
      </div>

      <router-link to="/sessions/new"
        class="tap-target block text-center bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-2xl py-3 transition-colors">
        + New Session
      </router-link>
    </div>
  </div>
</template>
