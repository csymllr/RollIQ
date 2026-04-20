<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useSessionsStore } from '@/stores/sessions'
import { useBowlerStore } from '@/stores/bowler'

const sessions = useSessionsStore()
const bowler = useBowlerStore()

onMounted(async () => {
  await bowler.fetchMine()
  await sessions.fetchAll()
})

const eventTypeLabel: Record<string, string> = {
  practice: 'Practice',
  league: 'League',
  tournament: 'Tournament',
}

const eventTypeColors: Record<string, string> = {
  practice: 'bg-slate-600 text-slate-100',
  league: 'bg-indigo-700 text-indigo-100',
  tournament: 'bg-amber-700 text-amber-100',
}

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Group by month
const grouped = computed(() => {
  const map = new Map<string, typeof sessions.sessions>()
  for (const s of sessions.sessions) {
    const key = s.session_date.slice(0, 7)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(s)
  }
  return [...map.entries()]
})

function monthLabel(key: string) {
  const [y, m] = key.split('-')
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}
</script>

<template>
  <div class="p-4 pb-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-bold text-white">Sessions</h1>
      <router-link to="/sessions/new"
        class="tap-target inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl px-4 py-2">
        + New
      </router-link>
    </div>

    <div v-if="sessions.loading" class="text-slate-400 text-sm">Loading…</div>

    <div v-else-if="sessions.sessions.length === 0" class="text-slate-400 text-sm">
      No sessions yet. Tap + New to start tracking.
    </div>

    <div v-else class="space-y-6">
      <div v-for="[key, group] in grouped" :key="key">
        <h2 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{{ monthLabel(key) }}</h2>
        <div class="space-y-2">
          <router-link v-for="s in group" :key="s.id" :to="`/sessions/${s.id}`"
            class="block bg-slate-800 hover:bg-slate-700 rounded-2xl p-4 transition-colors">
            <div class="flex items-center justify-between">
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-white">{{ s.center_name }}</span>
                  <span class="text-xs font-medium px-2 py-0.5 rounded-full"
                    :class="eventTypeColors[s.event_type] ?? 'bg-slate-600 text-slate-100'">
                    {{ eventTypeLabel[s.event_type] ?? s.event_type }}
                  </span>
                </div>
                <p class="text-slate-400 text-sm mt-0.5">{{ formatDate(s.session_date) }}</p>
              </div>
              <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
