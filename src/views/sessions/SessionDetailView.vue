<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSessionsStore } from '@/stores/sessions'
import type { Session, Game } from '@/stores/sessions'

const route = useRoute()
const router = useRouter()
const sessions = useSessionsStore()

const sessionId = route.params.id as string
const loading = ref(true)
const session = ref<Session | null>(null)
const games = ref<Game[]>([])
const addingGame = ref(false)

onMounted(async () => {
  const { data } = await sessions.fetchOne(sessionId)
  if (data) {
    session.value = data.session
    games.value = data.games
  }
  loading.value = false
})

async function addGame() {
  addingGame.value = true
  const nextNum = games.value.length + 1
  const { data, error } = await sessions.createGame(sessionId, nextNum)
  addingGame.value = false
  if (error || !data) return
  games.value.push(data as Game)
  router.push(`/sessions/${sessionId}/games/${data.id}`)
}

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="p-4 pb-6">
    <div class="flex items-center gap-3 mb-4">
      <button @click="router.push('/sessions')" class="tap-target text-slate-400 hover:text-white">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div>
        <h1 class="text-xl font-bold text-white">{{ session?.center_name ?? 'Session' }}</h1>
        <p v-if="session" class="text-slate-400 text-sm">{{ formatDate(session.session_date) }} · {{ session.event_type }}</p>
      </div>
    </div>

    <div v-if="loading" class="text-slate-400 text-sm">Loading…</div>

    <div v-else>
      <div class="space-y-2 mb-4">
        <router-link v-for="game in games" :key="game.id"
          :to="`/sessions/${sessionId}/games/${game.id}`"
          class="flex items-center justify-between bg-slate-800 hover:bg-slate-700 rounded-2xl px-4 py-3 transition-colors">
          <span class="font-medium text-white">Game {{ game.game_number }}</span>
          <div class="flex items-center gap-3">
            <span v-if="game.final_score != null" class="text-2xl font-bold text-indigo-300">{{ game.final_score }}</span>
            <span v-else class="text-slate-500 text-sm">In progress</span>
            <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </router-link>
      </div>

      <button @click="addGame" :disabled="addingGame"
        class="tap-target w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-indigo-400 font-medium rounded-2xl py-3 transition-colors">
        {{ addingGame ? 'Adding…' : '+ Add Game' }}
      </button>

      <div v-if="session?.session_notes" class="mt-4 bg-slate-800 rounded-2xl p-4">
        <p class="text-xs text-slate-500 mb-1">Session notes</p>
        <p class="text-slate-300 text-sm">{{ session.session_notes }}</p>
      </div>
    </div>
  </div>
</template>
