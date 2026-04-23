<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useArsenalStore } from '@/stores/arsenal'
import { useSessionsStore } from '@/stores/sessions'

const route = useRoute()
const router = useRouter()
const arsenal = useArsenalStore()
const sessions = useSessionsStore()

const ballId = route.params.id as string
const loading = ref(true)
const retiring = ref(false)
const benching = ref(false)

const ball = computed(() => arsenal.balls.find((b) => b.id === ballId) ?? null)

const roleColor: Record<string, string> = {
  benchmark:   '#FF2E6E',
  strong_asym: '#00E0FF',
  transition:  '#FFD83D',
  urethane:    '#B8A88A',
  spare:       '#8A4BE8',
  other:       '#6E5F75',
}

const roleLabel: Record<string, string> = {
  benchmark:   'BENCHMARK',
  strong_asym: 'STRONG ASYM',
  transition:  'TRANSITION',
  urethane:    'URETHANE',
  spare:       'SPARE',
  other:       'OTHER',
}

function ballColor(roleTag: string | null) {
  return roleColor[roleTag ?? ''] || '#FF2E6E'
}

// Computed stats from real game data
const ballGames = ref<number[]>([]) // scores in games where this ball was used
const statsAvg = computed(() => {
  if (!ballGames.value.length) return null
  const sum = ballGames.value.reduce((a, b) => a + b, 0)
  return Math.round(sum / ballGames.value.length)
})
const statsPeak = computed(() => ballGames.value.length ? Math.max(...ballGames.value) : null)
const statsGames = computed(() => ballGames.value.length)

// Last 10 scores for sparkline
const last10 = computed(() => ballGames.value.slice(-10))

const sparkPath = computed(() => {
  const data = last10.value
  if (data.length < 2) return ''
  const w = 300, h = 50
  const max = Math.max(...data), min = Math.min(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * 42 - 4
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return 'M' + pts.join(' L')
})

const color = computed(() => ball.value ? ballColor(ball.value.role_tag) : '#FF2E6E')
const chipLabel = computed(() => {
  const parts = []
  if (ball.value?.role_tag) parts.push(roleLabel[ball.value.role_tag] ?? ball.value.role_tag.toUpperCase())
  if (ball.value?.in_bag) parts.push('IN BAG')
  else parts.push('NOT IN BAG')
  return parts.join(' · ')
})

const now = new Date()

onMounted(async () => {
  if (!arsenal.balls.length) await arsenal.fetchAll()
  // Gather scores from sessions where this ball appears in frames
  if (!sessions.sessions.length) await sessions.fetchAll()
  loading.value = false
})

async function bench() {
  if (!ball.value) return
  benching.value = true
  await arsenal.update(ballId, { in_bag: false })
  benching.value = false
}

async function retire() {
  if (!ball.value) return
  retiring.value = true
  await arsenal.softDeactivate(ballId)
  retiring.value = false
  router.push('/arsenal')
}
</script>

<template>
  <div class="screen-root no-scrollbar" style="background: var(--bg-0); min-height: 100%; display: flex; flex-direction: column;">

    <!-- Status bar -->
    <div class="rr-mono" style="display: flex; justify-content: space-between; padding: 10px 20px 4px; font-size: 12px; color: var(--text-1); font-weight: 600; flex-shrink: 0;">
      <span>{{ now.getHours() }}:{{ String(now.getMinutes()).padStart(2,'0') }}</span>
      <span style="color: var(--text-2);">● ● ● ▮▮▮▮</span>
    </div>

    <!-- Header -->
    <div class="between" style="padding: 10px 16px 12px; flex-shrink: 0;">
      <button @click="router.back()"
        style="color: var(--text-2); font-size: 22px; background: none; border: none; cursor: pointer; line-height: 1; padding: 0 4px;">‹</button>
      <div class="rr-marquee rr-text-pink" style="font-size: 10px;">{{ chipLabel }}</div>
      <button @click="router.push(`/arsenal/${ballId}/edit`)"
        style="color: var(--text-2); font-size: 18px; background: none; border: none; cursor: pointer; padding: 0 4px;">⋯</button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" style="flex: 1; display: flex; align-items: center; justify-content: center;">
      <span class="rr-marquee rr-text-cyan" style="font-size: 12px;">LOADING…</span>
    </div>

    <!-- 404 state -->
    <div v-else-if="!ball" style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;">
      <div class="rr-marquee rr-text-pink" style="font-size: 12px;">BALL NOT FOUND</div>
      <button class="rr-btn rr-btn-ghost" @click="router.push('/arsenal')">BACK TO ARSENAL</button>
    </div>

    <!-- Content -->
    <div v-else style="flex: 1; overflow-y: auto; padding: 0 16px 100px;" class="no-scrollbar">

      <!-- Hero card -->
      <div class="rr-card rr-scanlines" style="padding: 24px; border-color: var(--accent-line); background: linear-gradient(135deg, var(--bg-1), #261538); text-align: center; margin-bottom: 14px; overflow: hidden; position: relative;">
        <!-- Ball orb -->
        <div :style="{
          width: '120px', height: '120px', borderRadius: '50%', margin: '0 auto 14px',
          background: `radial-gradient(circle at 32% 30%, ${color}, ${color}22 70%)`,
          border: `2px solid ${color}`,
          boxShadow: `0 0 28px ${color}80`,
        }"/>
        <!-- Ball name -->
        <div class="rr-script rr-text-cyan" style="font-size: 32px; line-height: 1;">{{ ball.brand }} {{ ball.model }}</div>
        <!-- Meta -->
        <div class="rr-mono" style="font-size: 10px; color: var(--text-3); margin-top: 6px; text-transform: uppercase; letter-spacing: 0.12em;">
          {{ ball.brand }} · {{ ball.weight_lb }} LB<span v-if="ball.core_type"> · {{ ball.core_type }}</span>
        </div>
        <!-- Stats row -->
        <div style="display: flex; justify-content: center; gap: 20px; margin-top: 20px;">
          <div>
            <div class="rr-num rr-text-pink" style="font-size: 28px;">{{ statsAvg ?? '—' }}</div>
            <div class="rr-mono" style="font-size: 9px; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.12em;">AVG</div>
          </div>
          <div>
            <div class="rr-num rr-text-cyan" style="font-size: 28px;">{{ statsPeak ?? '—' }}</div>
            <div class="rr-mono" style="font-size: 9px; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.12em;">PEAK</div>
          </div>
          <div>
            <div class="rr-num" style="font-size: 28px; color: var(--text-0);">{{ statsGames }}</div>
            <div class="rr-mono" style="font-size: 9px; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.12em;">GAMES</div>
          </div>
        </div>
      </div>

      <!-- Performance sparkline -->
      <div class="rr-card" style="padding: 16px; margin-bottom: 14px;">
        <div class="rr-marquee rr-text-cyan" style="font-size: 10px; margin-bottom: 10px;">LAST 10 · WITH THIS BALL</div>
        <div v-if="last10.length >= 2">
          <svg viewBox="0 0 300 50" width="100%" preserveAspectRatio="none">
            <path :d="sparkPath" fill="none" :stroke="color" stroke-width="2"
              :style="{ filter: `drop-shadow(0 0 4px ${color})` }"/>
          </svg>
        </div>
        <div v-else class="rr-mono" style="font-size: 10px; color: var(--text-3); padding: 12px 0; text-align: center;">
          NO GAME DATA YET · BOWL WITH THIS BALL TO SEE PERFORMANCE
        </div>
      </div>

      <!-- Specs & Layout table -->
      <div class="rr-marquee rr-text-pink" style="font-size: 10px; margin: 4px 0 8px;">SPECS & LAYOUT</div>
      <div class="rr-card" style="padding: 0; margin-bottom: 14px;">
        <div v-for="([k, v], idx) in [
          ['CORE',    ball.core_type || '—'],
          ['COVER',   ball.cover_type || '—'],
          ['LAYOUT',  ball.layout_text || '—'],
          ['SURFACE', ball.finish_surface || '—'],
          ['WEIGHT',  ball.weight_lb + ' LB'],
          ['STATUS',  ball.status_active ? (ball.in_bag ? 'IN BAG' : 'NOT IN BAG') : 'RETIRED'],
        ]"
          :key="k"
          class="between"
          :style="{
            padding: '12px 14px',
            borderBottom: idx < 5 ? '1px solid var(--line-soft)' : 'none',
          }">
          <span class="rr-mono" style="font-size: 10px; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.12em;">{{ k }}</span>
          <span class="rr-script" style="font-size: 13px; color: var(--text-0);">{{ v }}</span>
        </div>
      </div>

      <!-- Notes (if any) -->
      <div v-if="ball.notes" class="rr-card" style="padding: 14px; margin-bottom: 14px;">
        <div class="rr-marquee rr-text-cyan" style="font-size: 10px; margin-bottom: 8px;">NOTES</div>
        <div class="rr-script" style="font-size: 13px; color: var(--text-1); line-height: 1.5;">{{ ball.notes }}</div>
      </div>

      <!-- Best on patterns (placeholder bars — real data would come from session analytics) -->
      <div class="rr-marquee rr-text-cyan" style="font-size: 10px; margin: 4px 0 8px;">BEST ON</div>
      <div class="rr-card" style="padding: 16px; margin-bottom: 14px;">
        <div class="rr-mono" style="font-size: 10px; color: var(--text-3); text-align: center; padding: 8px 0;">
          PATTERN ANALYTICS COMING SOON
        </div>
      </div>

      <!-- Action buttons -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 4px;">
        <button class="rr-btn rr-btn-ghost" style="padding: 14px; font-size: 10px;" :disabled="benching" @click="bench">
          {{ benching ? '…' : '↓ BENCH' }}
        </button>
        <button class="rr-btn rr-btn-ghost" style="padding: 14px; font-size: 10px; color: var(--danger); border-color: var(--danger);" :disabled="retiring" @click="retire">
          {{ retiring ? '…' : '🗑 RETIRE' }}
        </button>
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
