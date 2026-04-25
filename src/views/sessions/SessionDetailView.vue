<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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
const deleting = ref(false)
const confirmDelete = ref(false)

const isInProgress = computed(() =>
  games.value.length === 0 || games.value.some((g) => g.final_score == null)
)

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

const seriesTotal = computed(() =>
  games.value.reduce((sum, g) => sum + (g.final_score ?? 0), 0)
)

const seriesAvg = computed(() => {
  const done = games.value.filter((g) => g.final_score != null)
  if (!done.length) return null
  return Math.round(done.reduce((sum, g) => sum + (g.final_score ?? 0), 0) / done.length)
})

const highGame = computed(() =>
  games.value.reduce((max, g) => Math.max(max, g.final_score ?? 0), 0) || null
)

const eventTypeLabel: Record<string, string> = {
  practice:   'PRACTICE',
  league:     'LEAGUE',
  tournament: 'TOURNEY',
}

async function doDelete() {
  deleting.value = true
  const { error } = await sessions.deleteSession(sessionId)
  deleting.value = false
  if (!error) router.push('/sessions')
}

const now = new Date()
</script>

<template>
  <div class="screen-root no-scrollbar" style="background: var(--bg-0); min-height: 100%; display: flex; flex-direction: column;">

    <!-- Status bar -->
    <div class="rr-mono" style="display: flex; justify-content: space-between; padding: 10px 20px 4px; font-size: 12px; color: var(--text-1); font-weight: 600; flex-shrink: 0;">
      <span>{{ now.getHours() }}:{{ String(now.getMinutes()).padStart(2,'0') }}</span>
      <span style="color: var(--text-2);">● ● ● ▮▮▮▮</span>
    </div>

    <!-- Header -->
    <div class="between" style="padding: 10px 16px 12px; border-bottom: 1px solid var(--line); flex-shrink: 0;">
      <button @click="router.push('/sessions')"
        style="color: var(--text-2); font-size: 22px; background: none; border: none; cursor: pointer; line-height: 1; padding: 0 4px;">‹</button>
      <div style="text-align: center;">
        <div class="rr-script rr-text-cyan" style="font-size: 20px; line-height: 1;">
          {{ session?.event_name || session?.center_name || 'Session' }}
        </div>
        <div v-if="session" class="rr-mono" style="font-size: 10px; color: var(--text-3); margin-top: 2px; text-transform: uppercase; letter-spacing: 0.10em;">
          {{ formatDate(session.session_date) }}
        </div>
      </div>
      <button v-if="!loading && isInProgress" @click="confirmDelete = !confirmDelete"
        style="width: 32px; color: var(--danger); font-size: 16px; background: none; border: none; cursor: pointer; padding: 0 4px; opacity: 0.7;">✕</button>
      <div v-else style="width: 32px;"/>
    </div>

    <!-- Loading -->
    <div v-if="loading" style="flex: 1; display: flex; align-items: center; justify-content: center;">
      <span class="rr-marquee rr-text-cyan" style="font-size: 12px;">LOADING…</span>
    </div>

    <!-- Content -->
    <div v-else style="flex: 1; overflow-y: auto; padding: 16px 16px 100px;" class="no-scrollbar">

      <!-- Session meta chips -->
      <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;" v-if="session">
        <span v-if="session.event_type" class="rr-chip rr-chip-accent">
          {{ eventTypeLabel[session.event_type] ?? session.event_type.toUpperCase() }}
        </span>
        <span v-if="session.center_name" class="rr-chip">{{ session.center_name }}</span>
        <span v-if="session.lane_pair" class="rr-chip">LANE {{ session.lane_pair }}</span>
        <span v-if="session.pattern_id" class="rr-chip">{{ session.pattern_id }}</span>
        <span v-if="session.is_handicap" class="rr-chip">HCP</span>
      </div>

      <!-- Series summary -->
      <div v-if="games.length" class="rr-card rr-scanlines" style="padding: 20px; border-color: var(--accent-line); background: linear-gradient(135deg, var(--bg-1), #261538); margin-bottom: 16px; overflow: hidden; position: relative;">
        <div class="rr-marquee rr-text-pink" style="font-size: 10px; margin-bottom: 12px;">━━ SERIES RESULTS ━━</div>
        <div style="display: flex; gap: 24px; justify-content: center; flex-wrap: wrap;">
          <div style="text-align: center;">
            <div class="rr-num rr-text-cyan" style="font-size: 48px; line-height: 1;">{{ seriesTotal }}</div>
            <div class="rr-mono" style="font-size: 9px; color: var(--text-3); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.12em;">SERIES</div>
          </div>
          <div v-if="seriesAvg" style="text-align: center;">
            <div class="rr-num rr-text-pink" style="font-size: 48px; line-height: 1;">{{ seriesAvg }}</div>
            <div class="rr-mono" style="font-size: 9px; color: var(--text-3); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.12em;">AVG</div>
          </div>
          <div v-if="highGame" style="text-align: center;">
            <div class="rr-num" style="font-size: 48px; line-height: 1; color: var(--text-0);">{{ highGame }}</div>
            <div class="rr-mono" style="font-size: 9px; color: var(--text-3); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.12em;">HIGH</div>
          </div>
        </div>
      </div>

      <!-- Games list -->
      <div class="rr-marquee rr-text-cyan" style="font-size: 10px; margin-bottom: 10px;">GAMES</div>
      <div style="display: grid; gap: 8px; margin-bottom: 16px;">
        <component
          :is="game.final_score != null ? 'div' : 'button'"
          v-for="game in games" :key="game.id"
          @click="router.push(`/sessions/${sessionId}/games/${game.id}`)"
          class="rr-card"
          style="padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; border: 1px solid var(--line); transition: border-color 0.15s;"
          :style="game.final_score == null ? { borderColor: 'var(--accent-line)' } : {}">
          <div>
            <div class="rr-marquee" style="font-size: 10px; color: var(--text-3);">GAME {{ game.game_number }}</div>
            <div v-if="game.strike_count || game.spare_count" class="rr-mono" style="font-size: 10px; color: var(--text-3); margin-top: 3px;">
              {{ game.strike_count }} STR · {{ game.spare_count }} SPA · {{ game.open_count }} OPEN
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div v-if="game.final_score != null" class="rr-num rr-text-pink" style="font-size: 36px; line-height: 1;">{{ game.final_score }}</div>
            <div v-else style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
              <span class="rr-marquee rr-text-pink" style="font-size: 10px; display: flex; align-items: center; gap: 5px;">
                <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--accent); box-shadow: var(--neon-glow-pink); display: inline-block;"/>
                IN PROGRESS
              </span>
              <span class="rr-mono" style="font-size: 9px; color: var(--text-3);">TAP TO CONTINUE</span>
            </div>
            <span style="color: var(--text-3); font-size: 16px;">›</span>
          </div>
        </component>
      </div>

      <!-- Add game button -->
      <button @click="addGame" :disabled="addingGame"
        class="rr-btn rr-btn-ghost"
        style="width: 100%; padding: 14px; font-size: 11px; margin-bottom: 16px;">
        {{ addingGame ? 'ADDING…' : '＋ ADD GAME' }}
      </button>

      <!-- Delete confirmation -->
      <div v-if="confirmDelete" class="rr-card" style="padding: 14px; margin-bottom: 16px; border-color: var(--danger); text-align: center;">
        <div class="rr-mono" style="font-size: 10px; color: var(--danger); margin-bottom: 12px; letter-spacing: 0.12em;">DELETE THIS SESSION?</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <button class="rr-btn rr-btn-ghost" @click="confirmDelete = false">CANCEL</button>
          <button class="rr-btn rr-btn-ghost" style="color: var(--danger); border-color: var(--danger);" :disabled="deleting" @click="doDelete">
            {{ deleting ? '…' : 'YES, DELETE' }}
          </button>
        </div>
      </div>

      <!-- Session notes -->
      <div v-if="session?.session_notes" class="rr-card" style="padding: 16px;">
        <div class="rr-marquee rr-text-pink" style="font-size: 10px; margin-bottom: 8px;">SESSION NOTES</div>
        <div class="rr-script" style="font-size: 13px; color: var(--text-1); line-height: 1.5;">{{ session.session_notes }}</div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.screen-root {
  background: var(--bg-0);
  color: var(--text-0);
}
</style>
