<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionsStore } from '@/stores/sessions'
import { usePatternsStore } from '@/stores/patterns'
import { useBowlerStore } from '@/stores/bowler'
import TapButton from '@/components/TapButton.vue'

const sessions = useSessionsStore()
const patternsStore = usePatternsStore()
const bowler = useBowlerStore()
const router = useRouter()

const saving = ref(false)
const error = ref('')

const form = ref({
  event_type: 'league' as 'practice' | 'league' | 'tournament',
  center_name: '',
  lane_pair: '',
  pattern_id: '',
  session_date: new Date().toISOString().slice(0, 10),
  session_notes: '',
})

onMounted(async () => {
  await bowler.fetchMine()
  await patternsStore.fetchAll()
})

async function save() {
  if (!form.value.center_name.trim()) { error.value = 'Center name is required'; return }
  if (!bowler.profile) { error.value = 'Please create a bowler profile first'; return }
  error.value = ''
  saving.value = true

  const selectedPattern = form.value.pattern_id
    ? patternsStore.patterns.find((p) => p.id === form.value.pattern_id)
    : null

  const { data: session, error: sErr } = await sessions.createSession({
    event_type: form.value.event_type,
    center_name: form.value.center_name.trim(),
    lane_pair: form.value.lane_pair || null,
    pattern_id: form.value.pattern_id || null,
    pattern_snapshot: selectedPattern ?? null,
    session_date: form.value.session_date,
    session_notes: form.value.session_notes || null,
  })

  if (sErr || !session) { saving.value = false; error.value = sErr?.message ?? 'Failed to create session'; return }

  const { data: game, error: gErr } = await sessions.createGame(session.id, 1)
  saving.value = false
  if (gErr || !game) { error.value = gErr?.message ?? 'Failed to create game'; return }

  router.push(`/sessions/${session.id}/games/${game.id}`)
}
</script>

<template>
  <div class="p-4 pb-6 max-w-lg mx-auto">
    <div class="flex items-center gap-3 mb-6">
      <button @click="router.back()" class="tap-target text-slate-400 hover:text-white">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 class="text-xl font-bold text-white">New Session</h1>
    </div>

    <form @submit.prevent="save" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-slate-300 mb-2">Session Type</label>
        <div class="flex gap-2">
          <button v-for="t in ['practice','league','tournament']" :key="t" type="button"
            @click="form.event_type = t as any"
            class="tap-target flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-colors"
            :class="form.event_type === t ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'">
            {{ t }}
          </button>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-300 mb-1">Bowling Center *</label>
        <input v-model="form.center_name" type="text" required placeholder="AMF, Brunswick…"
          class="w-full rounded-lg bg-slate-800 border-slate-700 text-white placeholder-slate-500" />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1">Lane Pair</label>
          <input v-model="form.lane_pair" type="text" placeholder="e.g. 11–12"
            class="w-full rounded-lg bg-slate-800 border-slate-700 text-white placeholder-slate-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1">Date</label>
          <input v-model="form.session_date" type="date"
            class="w-full rounded-lg bg-slate-800 border-slate-700 text-white" />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-300 mb-1">Oil Pattern</label>
        <select v-model="form.pattern_id" class="w-full rounded-lg bg-slate-800 border-slate-700 text-white">
          <option value="">Unknown / Custom</option>
          <option v-for="p in patternsStore.patterns" :key="p.id" :value="p.id">
            {{ p.name }} ({{ p.category }}, {{ p.length_ft ? p.length_ft + 'ft' : '?' }})
          </option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-300 mb-1">Session Notes</label>
        <textarea v-model="form.session_notes" rows="2" placeholder="Any notes before you start…"
          class="w-full rounded-lg bg-slate-800 border-slate-700 text-white placeholder-slate-500 resize-none" />
      </div>

      <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>

      <TapButton type="submit" :loading="saving" class="w-full">Start Session</TapButton>
    </form>
  </div>
</template>
