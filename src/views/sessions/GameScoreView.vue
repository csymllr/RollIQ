<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSessionsStore, type Frame } from '@/stores/sessions'
import { useArsenalStore } from '@/stores/arsenal'
import { scoreGame } from '@/lib/scoring'
import type { FrameInput, FrameResult } from '@/lib/scoring'

const route = useRoute()
const router = useRouter()
const sessions = useSessionsStore()
const arsenal = useArsenalStore()

const sessionId = route.params.sessionId as string
const gameId = route.params.gameId as string

interface LocalFrame {
  dbId: string | null
  roll1: number | null
  roll2: number | null
  roll3: number | null
  ball_id: string | null
  frame_note: string
}

const loading = ref(true)
const saving = ref(false)
const gameComplete = ref(false)
const showKeypad = ref(false)
const showNoteInput = ref(false)

const frames = ref<LocalFrame[]>(
  Array(10).fill(null).map(() => ({ dbId: null, roll1: null, roll2: null, roll3: null, ball_id: null, frame_note: '' }))
)

const activeFrame = ref(0)
const activeRoll = ref<1 | 2 | 3>(1)

// Session info for top bar
const sessionInfo = ref<{ event_name: string | null; center_name: string; planned_games: number | null; lane_pair: string | null; pattern_id: string | null } | null>(null)
const allGames = ref<Array<{ id: string; game_number: number; final_score: number | null }>>([])

const scoringInput = computed<FrameInput[]>(() =>
  frames.value.map((f) => ({ roll1: f.roll1, roll2: f.roll2, roll3: f.roll3 }))
)
const results = computed<FrameResult[]>(() => scoreGame(scoringInput.value))

const pinsAvailable = computed<number>(() => {
  const f = frames.value[activeFrame.value]
  const isLast = activeFrame.value === 9
  if (activeRoll.value === 1) return 10
  if (activeRoll.value === 2) {
    if (isLast) return f.roll1 === 10 ? 10 : 10 - (f.roll1 ?? 0)
    return 10 - (f.roll1 ?? 0)
  }
  if (f.roll1 === 10 && f.roll2 === 10) return 10
  if (f.roll1 === 10) return 10 - (f.roll2 ?? 0)
  return 10
})

const pinButtons = computed(() => Array.from({ length: pinsAvailable.value + 1 }, (_, i) => i))

const showSpareShortcut = computed(() => {
  const f = frames.value[activeFrame.value]
  const isLast = activeFrame.value === 9
  if (activeRoll.value === 2 && !isLast && f.roll1 !== 10) return true
  if (activeRoll.value === 2 && isLast && f.roll1 !== 10 && f.roll1 !== null) return true
  return false
})

const lastBallUsed = computed<string | null>(() => {
  for (let i = activeFrame.value - 1; i >= 0; i--) {
    if (frames.value[i].ball_id) return frames.value[i].ball_id
  }
  return arsenal.activeBalls()[0]?.id ?? null
})

// Current game number derived from allGames
const currentGameNum = computed(() => {
  const g = allGames.value.find((g) => g.id === gameId)
  return g?.game_number ?? 1
})

const totalGames = computed(() => sessionInfo.value?.planned_games ?? allGames.value.length)

// Series scores
const seriesGames = computed(() =>
  allGames.value.map((g) => ({
    id: g.id,
    num: g.game_number,
    score: g.id === gameId ? currentScore() : (g.final_score ?? null),
    isLive: g.id === gameId,
    isDone: g.id !== gameId && g.final_score != null,
  }))
)

const seriesTotal = computed(() =>
  seriesGames.value.reduce((sum, g) => sum + (g.score ?? 0), 0)
)

// Strike/spare/open counts for this game
const strikeCount = computed(() => frames.value.filter((f) => f.roll1 === 10).length)
const spareCount = computed(() => results.value.filter((r) => r.isSpare).length)
const openCount = computed(() => {
  let opens = 0
  for (let i = 0; i < 10; i++) {
    const f = frames.value[i]
    if (f.roll1 === null) break
    const isStrike = f.roll1 === 10
    if (i < 9) {
      if (!isStrike && f.roll2 !== null && (f.roll1 + (f.roll2 ?? 0)) < 10) opens++
    }
  }
  return opens
})
// Projected score if close all remaining frames
const projectedScore = computed(() => {
  const cur = currentScore() ?? 0
  const framesLeft = 10 - (activeFrame.value + (gameComplete.value ? 1 : 0))
  return Math.min(300, cur + framesLeft * 20)
})

// Standing pins after first ball (for pin deck display)
const standingPins = computed<number[]>(() => {
  const f = frames.value[activeFrame.value]
  if (activeRoll.value === 1) return [1,2,3,4,5,6,7,8,9,10]
  if (f.roll1 === null) return [1,2,3,4,5,6,7,8,9,10]
  if (f.roll1 === 10) return [1,2,3,4,5,6,7,8,9,10]
  // remaining pins after first ball
  const knocked = f.roll1
  // simplified: show remaining as a count approximation — show pins 1..remaining
  const remaining = 10 - knocked
  return Array.from({ length: remaining }, (_, i) => i + 1)
})

const inHandBall = computed(() => {
  const id = frames.value[activeFrame.value]?.ball_id ?? lastBallUsed.value
  return arsenal.balls.find((b) => b.id === id) ?? null
})

const roleColor: Record<string, string> = {
  benchmark:   '#FF2E6E',
  strong_asym: '#00E0FF',
  transition:  '#FFD83D',
  urethane:    '#B8A88A',
  spare:       '#8A4BE8',
  other:       '#6E5F75',
}

function ballColor(roleTag: string | null) {
  return roleColor[roleTag ?? ''] || '#FF2E6E'
}

onMounted(async () => {
  await arsenal.fetchAll()
  const { data } = await sessions.fetchOne(sessionId)
  if (data) {
    sessionInfo.value = {
      event_name: data.session.event_name,
      center_name: data.session.center_name,
      planned_games: data.session.planned_games,
      lane_pair: data.session.lane_pair,
      pattern_id: data.session.pattern_id,
    }
    allGames.value = data.games.map((g) => ({ id: g.id, game_number: g.game_number, final_score: g.final_score }))
    const dbFrames = data.frames.filter((f) => f.game_id === gameId)
    for (const dbf of dbFrames) {
      const idx = dbf.frame_number - 1
      if (idx >= 0 && idx < 10) {
        frames.value[idx] = {
          dbId: dbf.id,
          roll1: dbf.roll1_pins,
          roll2: dbf.roll2_pins,
          roll3: dbf.roll3_pins,
          ball_id: dbf.ball_id,
          frame_note: dbf.frame_note ?? '',
        }
      }
    }
    advanceToFirstIncomplete()
  }
  if (!frames.value[activeFrame.value].ball_id) {
    frames.value[activeFrame.value].ball_id = lastBallUsed.value
  }
  loading.value = false
})

function advanceToFirstIncomplete() {
  for (let i = 0; i < 10; i++) {
    const f = frames.value[i]
    if (f.roll1 === null) { activeFrame.value = i; activeRoll.value = 1; return }
    if (i < 9) {
      if (f.roll1 !== 10 && f.roll2 === null) { activeFrame.value = i; activeRoll.value = 2; return }
    } else {
      const needsRoll3 = f.roll1 === 10 || (f.roll1 !== null && f.roll2 !== null && f.roll1 + f.roll2 === 10)
      if (f.roll2 === null) { activeFrame.value = i; activeRoll.value = 2; return }
      if (needsRoll3 && f.roll3 === null) { activeFrame.value = i; activeRoll.value = 3; return }
    }
  }
  gameComplete.value = true
  activeFrame.value = 9
}

async function enterRoll(pins: number) {
  const f = frames.value[activeFrame.value]
  if (activeRoll.value === 1) f.roll1 = pins
  else if (activeRoll.value === 2) f.roll2 = pins
  else f.roll3 = pins
  if (!f.ball_id) f.ball_id = lastBallUsed.value
  showKeypad.value = false
  await saveCurrentFrame()
  advance()
}

async function enterStrike() {
  await enterRoll(10)
}

async function enterSpare() {
  const f = frames.value[activeFrame.value]
  const remaining = 10 - (f.roll1 ?? 0)
  await enterRoll(remaining)
}

async function saveCurrentFrame() {
  saving.value = true
  const fi = activeFrame.value
  const f = frames.value[fi]
  const resultType = results.value[fi]?.resultType ?? 'incomplete'
  const { data, error } = await sessions.upsertFrame({
    id: f.dbId ?? undefined,
    game_id: gameId,
    frame_number: fi + 1,
    roll1_pins: f.roll1,
    roll2_pins: f.roll2,
    roll3_pins: f.roll3,
    frame_score: results.value[fi]?.frameScore ?? null,
    cumulative_score: results.value[fi]?.cumulative ?? null,
    result_type: resultType,
    leave_type: null,
    converted: null,
    ball_id: f.ball_id,
    frame_note: f.frame_note || null,
  })
  if (!error && data) f.dbId = (data as Frame).id
  saving.value = false
}

function advance() {
  const f = frames.value[activeFrame.value]
  const isLast = activeFrame.value === 9

  if (isLast) {
    const strike = f.roll1 === 10
    const spare = !strike && f.roll1 !== null && f.roll2 !== null && f.roll1 + f.roll2 === 10
    if (activeRoll.value === 1) { activeRoll.value = 2; return }
    if (activeRoll.value === 2 && (strike || spare)) { activeRoll.value = 3; return }
    gameComplete.value = true
    finishGame()
    return
  }

  if (f.roll1 === 10) {
    goToNextFrame()
  } else if (activeRoll.value === 1) {
    activeRoll.value = 2
  } else {
    goToNextFrame()
  }
}

function goToNextFrame() {
  if (activeFrame.value < 9) {
    activeFrame.value++
    activeRoll.value = 1
    if (!frames.value[activeFrame.value].ball_id) {
      frames.value[activeFrame.value].ball_id = lastBallUsed.value
    }
  }
}

async function finishGame() {
  const finalScore = results.value[9]?.cumulative ?? null
  const strikes = frames.value.filter((f) => f.roll1 === 10).length
  const spares = results.value.filter((r) => r.isSpare).length
  const opens = 10 - strikes - spares
  await sessions.updateGame(gameId, {
    final_score: finalScore,
    clean_game: opens === 0,
    strike_count: strikes,
    spare_count: spares,
    open_count: opens,
  })
  // Update allGames local score
  const g = allGames.value.find((g) => g.id === gameId)
  if (g) g.final_score = finalScore
}

function selectFrame(idx: number) {
  activeFrame.value = idx
  const f = frames.value[idx]
  if (f.roll1 === null) { activeRoll.value = 1; return }
  const isLast = idx === 9
  if (!isLast && f.roll1 === 10) { advanceToFirstIncomplete(); return }
  if (f.roll2 === null) { activeRoll.value = 2; return }
  if (isLast) {
    const spare = f.roll1 !== null && f.roll2 !== null && f.roll1 !== 10 && f.roll1 + f.roll2 === 10
    if ((f.roll1 === 10 || spare) && f.roll3 === null) { activeRoll.value = 3; return }
  }
  advanceToFirstIncomplete()
}

function currentScore(): number {
  for (let i = 9; i >= 0; i--) {
    if (results.value[i]?.cumulative != null) return results.value[i].cumulative!
  }
  return 0
}

function roll1Label(i: number) {
  const f = frames.value[i]
  if (f.roll1 === null) return ''
  if (f.roll1 === 10 && i < 9) return 'X'
  return String(f.roll1)
}

function roll2Label(i: number) {
  const f = frames.value[i]
  if (f.roll2 === null) return ''
  if (i < 9 && f.roll1 !== 10 && (f.roll1 ?? 0) + f.roll2 === 10) return '/'
  if (f.roll2 === 10) return 'X'
  return String(f.roll2)
}

function roll3Label(i: number) {
  const f = frames.value[i]
  if (f.roll3 === null) return ''
  if (f.roll3 === 10) return 'X'
  return String(f.roll3)
}

// Pin deck positions (standard 10-pin formation)
const pinPositions = [
  { n: 7, x: 20, y: 20 }, { n: 8, x: 50, y: 20 }, { n: 9, x: 80, y: 20 }, { n: 10, x: 110, y: 20 },
  { n: 4, x: 35, y: 50 }, { n: 5, x: 65, y: 50 }, { n: 6, x: 95, y: 50 },
  { n: 2, x: 50, y: 80 }, { n: 3, x: 80, y: 80 },
  { n: 1, x: 65, y: 110 },
]

// Is desktop breakpoint
const isDesktop = ref(window.innerWidth >= 1024)
window.addEventListener('resize', () => { isDesktop.value = window.innerWidth >= 1024 })

const eventLabel = computed(() => sessionInfo.value?.event_name || sessionInfo.value?.center_name || 'Session')
</script>

<template>
  <div class="screen-root no-scrollbar" style="background: var(--bg-0); height: 100%; display: flex; flex-direction: column; overflow: hidden;">

    <!-- ── TOP BAR ── -->
    <div class="between" style="padding: 12px 16px; border-bottom: 1px solid var(--line); background: var(--bg-0); flex-shrink: 0;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span class="rr-marquee rr-text-pink" style="font-size: 11px; display: flex; align-items: center; gap: 6px;">
          <span style="width: 7px; height: 7px; border-radius: 50%; background: var(--accent); box-shadow: var(--neon-glow-pink); display: inline-block;"/>
          LIVE · G{{ currentGameNum }} OF {{ totalGames }}
        </span>
        <span class="rr-script" style="font-size: 17px; color: var(--text-0);">{{ eventLabel }}</span>
        <span v-if="sessionInfo?.lane_pair" class="rr-chip">LANE {{ sessionInfo.lane_pair }}</span>
        <span v-if="sessionInfo?.pattern_id" class="rr-chip">{{ sessionInfo.pattern_id }}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span v-if="saving" class="rr-mono" style="font-size: 10px; color: var(--text-3);">SAVING…</span>
        <button v-if="isDesktop" class="rr-btn rr-btn-ghost" style="font-size: 10px; padding: 7px 12px;">PAUSE</button>
        <button class="rr-btn rr-btn-primary" style="font-size: 10px; padding: 7px 12px;"
          @click="router.push(`/sessions/${sessionId}`)">
          END GAME
        </button>
      </div>
    </div>

    <!-- ── LOADING ── -->
    <div v-if="loading" style="flex: 1; display: flex; align-items: center; justify-content: center;">
      <span class="rr-marquee rr-text-cyan" style="font-size: 12px;">LOADING…</span>
    </div>

    <!-- ── DESKTOP LAYOUT ── -->
    <template v-else-if="isDesktop">
      <div style="flex: 1; display: grid; grid-template-columns: 1fr 360px; overflow: hidden;">

        <!-- Left: scoresheet + pin deck + actions -->
        <div style="padding: 20px; overflow-y: auto;" class="no-scrollbar">

          <!-- Series row -->
          <div class="rr-card" style="padding: 16px; margin-bottom: 16px;">
            <div class="between" style="margin-bottom: 12px;">
              <span class="rr-marquee rr-text-cyan" style="font-size: 10px;">━━ SERIES ━━</span>
              <span class="rr-mono" style="font-size: 10px; color: var(--text-3);">RUNNING</span>
            </div>
            <div :style="{ display: 'grid', gridTemplateColumns: `repeat(${seriesGames.length}, 1fr) 1.2fr`, gap: '10px' }">
              <div v-for="g in seriesGames" :key="g.id"
                :style="{
                  padding: '12px 14px', borderRadius: '4px',
                  border: '1px solid ' + (g.isLive ? 'var(--accent)' : 'var(--line)'),
                  background: g.isLive ? 'rgba(255,46,110,0.08)' : 'var(--bg-1)',
                  boxShadow: g.isLive ? 'inset 0 0 12px rgba(255,46,110,0.15)' : 'none',
                }">
                <div class="rr-marquee" :style="{ fontSize: '10px', color: g.isLive ? 'var(--accent)' : 'var(--text-3)' }">G{{ g.num }}</div>
                <div class="rr-num" :style="{
                  fontSize: '28px', color: 'var(--text-0)',
                  textShadow: g.isLive ? 'var(--neon-glow-pink)' : g.isDone ? '0 0 10px rgba(0,224,255,0.45)' : 'none'
                }">{{ g.score ?? '—' }}</div>
              </div>
              <div style="padding: 12px 14px; border-radius: 4px; border: 1px solid var(--accent-2); background: linear-gradient(135deg, rgba(0,224,255,0.10), rgba(255,46,110,0.06));">
                <div class="rr-marquee rr-text-cyan" style="font-size: 10px;">SERIES</div>
                <div class="rr-num rr-text-cyan" style="font-size: 28px; margin-top: 2px;">{{ seriesTotal }}</div>
              </div>
            </div>
          </div>

          <!-- Live scoresheet -->
          <div class="rr-card rr-scanlines" style="padding: 20px; border-color: var(--accent-line); background: linear-gradient(135deg, var(--bg-1), #261538); overflow: hidden; position: relative;">
            <div class="rr-marquee rr-text-pink" style="font-size: 10px; margin-bottom: 12px;">
              ━━ GAME {{ currentGameNum }} · FRAME {{ activeFrame + 1 }} ━━
            </div>
            <!-- 10-frame grid -->
            <div style="display: grid; grid-template-columns: repeat(10, 1fr); border: 1px solid var(--accent-line); border-radius: 4px; overflow: hidden;">
              <div v-for="(_, i) in Array(10)" :key="i"
                @click="selectFrame(i)"
                :style="{
                  padding: '6px 4px 8px',
                  background: activeFrame === i && !gameComplete
                    ? 'rgba(255,46,110,0.15)'
                    : frames[i].roll1 === 10 ? 'rgba(0,224,255,0.06)'
                    : (frames[i].roll1 !== null && frames[i].roll2 !== null && frames[i].roll1 !== 10 && (frames[i].roll1 + (frames[i].roll2 ?? 0)) === 10) ? 'rgba(255,46,110,0.05)'
                    : 'transparent',
                  border: activeFrame === i && !gameComplete ? '2px solid var(--accent)' : '0',
                  borderRight: activeFrame !== i ? '1px solid var(--line-soft)' : '0',
                  boxShadow: activeFrame === i && !gameComplete ? 'inset 0 0 16px rgba(255,46,110,0.25)' : 'none',
                  cursor: 'pointer',
                }">
                <div style="display: flex; justify-content: flex-end; gap: 2px; min-height: 14px;">
                  <span class="rr-marquee rr-text-cyan" style="font-size: 9px; min-width: 10px; text-align: center;">{{ roll1Label(i) }}</span>
                  <span class="rr-marquee rr-text-cyan" style="font-size: 9px; min-width: 10px; text-align: center;">{{ roll2Label(i) }}</span>
                  <span v-if="i === 9" class="rr-marquee rr-text-pink" style="font-size: 9px; min-width: 10px; text-align: center;">{{ roll3Label(i) }}</span>
                </div>
                <div class="rr-num" :class="activeFrame === i && !gameComplete ? 'rr-text-pink' : ''"
                  style="font-size: 14px; text-align: center; margin-top: 2px; color: var(--text-0);">
                  {{ results[i]?.cumulative ?? '—' }}
                </div>
              </div>
            </div>

            <!-- Pin deck + capture grid -->
            <div style="margin-top: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div>
                <div class="rr-marquee rr-text-cyan" style="font-size: 10px; margin-bottom: 10px;">
                  {{ activeRoll === 1 ? 'FIRST BALL' : 'ON THE DECK · 2ND BALL' }}
                </div>
                <!-- Pin deck SVG -->
                <svg viewBox="0 0 130 130" width="100%" style="max-height: 140px; display: block;">
                  <g v-for="p in pinPositions" :key="p.n">
                    <circle :cx="p.x" :cy="p.y" r="10"
                      :fill="standingPins.includes(p.n) ? 'rgba(255,255,255,0.92)' : 'transparent'"
                      :stroke="standingPins.includes(p.n) ? '#FF2E6E' : 'rgba(110,95,117,0.4)'"
                      :stroke-width="standingPins.includes(p.n) ? 1.5 : 1"
                      :stroke-dasharray="standingPins.includes(p.n) ? 'none' : '2 2'"
                      :style="standingPins.includes(p.n) ? { filter: 'drop-shadow(0 0 6px #FF2E6E)' } : {}"
                    />
                    <text :x="p.x" :y="p.y + 3" text-anchor="middle"
                      font-family="Bungee" font-size="9"
                      :fill="standingPins.includes(p.n) ? '#1A1020' : 'rgba(110,95,117,0.7)'">{{ p.n }}</text>
                  </g>
                </svg>
                <div class="rr-mono" style="font-size: 9px; color: var(--text-3); margin-top: 8px; text-align: center; text-transform: uppercase; letter-spacing: 0.12em;">
                  FRAME {{ activeFrame + 1 }} · ROLL {{ activeRoll }}
                </div>
              </div>
              <div>
                <div class="rr-marquee rr-text-pink" style="font-size: 10px; margin-bottom: 10px;">FRAME NOTE</div>
                <textarea v-model="frames[activeFrame].frame_note"
                  placeholder="Frame note…"
                  style="width: 100%; padding: 10px; background: var(--bg-1); border: 1px solid var(--line); border-radius: 4px; color: var(--text-1); font-family: 'JetBrains Mono', monospace; font-size: 11px; resize: none; height: 80px; box-sizing: border-box;"/>
              </div>
            </div>
          </div>

          <!-- Action buttons -->
          <div style="display: flex; gap: 10px; margin-top: 16px; justify-content: center;">
            <button class="rr-btn rr-btn-ghost" style="padding: 14px 20px;" @click="advanceToFirstIncomplete()">↶ UNDO LAST</button>
            <button v-if="!gameComplete" class="rr-btn rr-btn-primary" style="padding: 14px 28px; font-size: 13px;" @click="enterStrike">STRIKE ✗</button>
            <button v-if="!gameComplete && showSpareShortcut" class="rr-btn rr-btn-cyan" style="padding: 14px 20px; font-size: 13px;" @click="enterSpare">SPARE /</button>
            <button class="rr-btn rr-btn-ghost" style="padding: 14px 20px;" @click="showKeypad = !showKeypad">
              {{ showKeypad ? 'HIDE PAD' : 'KEYPAD' }}
            </button>
          </div>

          <!-- Keypad (desktop) -->
          <div v-if="showKeypad && !gameComplete" style="margin-top: 12px; display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px;">
            <button v-for="n in pinButtons" :key="n"
              @click="enterRoll(n)"
              class="rr-btn"
              :class="n === 10 ? 'rr-btn-primary' : 'rr-btn-ghost'"
              style="padding: 12px; font-size: 14px; font-family: 'Bungee', sans-serif;">
              {{ n === 10 ? 'X' : n }}
            </button>
          </div>
        </div>

        <!-- Right rail -->
        <aside style="border-left: 1px solid var(--line); background: var(--bg-0); padding: 20px; overflow-y: auto;" class="no-scrollbar">
          <!-- In Hand -->
          <div class="rr-marquee rr-text-pink" style="font-size: 10px; margin-bottom: 10px;">IN HAND</div>
          <div class="rr-card" style="padding: 14px; display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
            <div :style="{
              width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
              background: inHandBall ? `radial-gradient(circle at 30% 30%, ${ballColor(inHandBall.role_tag)}, ${ballColor(inHandBall.role_tag)}33 70%)` : 'var(--bg-3)',
              border: inHandBall ? `1px solid ${ballColor(inHandBall.role_tag)}` : '1px solid var(--line)',
              boxShadow: inHandBall ? `0 0 12px ${ballColor(inHandBall.role_tag)}66` : 'none',
            }"/>
            <div style="flex: 1; min-width: 0;">
              <div class="rr-script" style="font-size: 15px; color: var(--text-0);">
                {{ inHandBall ? `${inHandBall.brand} ${inHandBall.model}` : 'No ball' }}
              </div>
              <div class="rr-mono" style="font-size: 9px; color: var(--text-3); margin-top: 2px; text-transform: uppercase; letter-spacing: 0.12em;">
                {{ inHandBall?.role_tag?.replace('_', ' ').toUpperCase() }} · {{ inHandBall?.weight_lb ?? '—' }} LB
              </div>
            </div>
            <!-- Ball selector -->
            <select v-model="frames[activeFrame].ball_id"
              style="background: var(--bg-2); border: 1px solid var(--line); border-radius: 4px; color: var(--text-1); font-size: 10px; padding: 4px 6px; font-family: 'Bungee', sans-serif; cursor: pointer;">
              <option :value="null">—</option>
              <option v-for="ball in arsenal.activeBalls()" :key="ball.id" :value="ball.id">
                {{ ball.brand }} {{ ball.model }}
              </option>
            </select>
          </div>

          <!-- Coach card -->
          <div class="rr-card" style="padding: 16px; margin-bottom: 16px; background: linear-gradient(180deg, rgba(255,46,110,0.12), transparent); border-color: var(--accent-line);">
            <div class="between" style="margin-bottom: 8px;">
              <span style="display: flex; align-items: center; gap: 6px;">
                <span class="rr-text-pink">✦</span>
                <span class="rr-marquee rr-text-pink" style="font-size: 10px;">COACH · LIVE</span>
              </span>
            </div>
            <div class="rr-script" style="font-size: 14px; color: var(--text-0); line-height: 1.35;">
              Stay focused. Close each frame and let the pins fall.
            </div>
          </div>

          <!-- This Game stats -->
          <div class="rr-marquee rr-text-cyan" style="font-size: 10px; margin-bottom: 10px;">THIS GAME</div>
          <div style="display: grid; gap: 0;">
            <div v-for="[k, v, c] in [
              ['Strikes', String(strikeCount), 'cyan'],
              ['Spares',  String(spareCount), 'cyan'],
              ['Opens',   String(openCount), 'pink'],
            ]" :key="k"
              class="between"
              style="padding: 8px 0; border-bottom: 1px solid var(--line-soft);">
              <span style="font-size: 12px; color: var(--text-1);">{{ k }}</span>
              <span class="rr-num" :class="c === 'cyan' ? 'rr-text-cyan' : 'rr-text-pink'" style="font-size: 16px;">{{ v }}</span>
            </div>
          </div>

          <!-- Projected score -->
          <div class="rr-card" style="padding: 14px; margin-top: 18px; text-align: center;">
            <div class="rr-marquee rr-text-pink" style="font-size: 10px; margin-bottom: 8px;">PROJECTED</div>
            <div class="rr-num rr-text-cyan" style="font-size: 40px;">{{ projectedScore }}</div>
            <div class="rr-mono" style="font-size: 9px; color: var(--text-3); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.12em;">IF YOU CLOSE EVERY FRAME</div>
          </div>

          <!-- Game complete panel -->
          <div v-if="gameComplete" class="rr-card" style="padding: 20px; margin-top: 16px; text-align: center; border-color: var(--accent-line); background: linear-gradient(135deg, var(--bg-1), #261538);">
            <div class="rr-marquee rr-text-cyan" style="font-size: 10px; margin-bottom: 8px;">GAME COMPLETE</div>
            <div class="rr-num rr-text-pink" style="font-size: 48px;">{{ results[9]?.cumulative ?? '—' }}</div>
            <button class="rr-btn rr-btn-primary" style="width: 100%; margin-top: 14px; padding: 12px;"
              @click="router.push(`/sessions/${sessionId}`)">
              BACK TO SESSION
            </button>
          </div>
        </aside>
      </div>
    </template>

    <!-- ── MOBILE LAYOUT ── -->
    <template v-else>
      <!-- Series bar -->
      <div style="padding: 12px 16px 0; flex-shrink: 0;">
        <div :style="{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(seriesGames.length, 1)}, 1fr) 1.2fr`, gap: '6px', marginBottom: '10px' }">
          <div v-for="g in seriesGames" :key="g.id"
            :style="{
              padding: '8px 10px', borderRadius: '4px',
              border: '1px solid ' + (g.isLive ? 'var(--accent)' : 'var(--line)'),
              background: g.isLive ? 'rgba(255,46,110,0.08)' : 'var(--bg-1)',
            }">
            <div class="rr-marquee" :style="{ fontSize: '9px', color: g.isLive ? 'var(--accent)' : 'var(--text-3)' }">G{{ g.num }}</div>
            <div class="rr-num" :style="{ fontSize: '20px', color: 'var(--text-0)', textShadow: g.isLive ? 'var(--neon-glow-pink)' : 'none' }">{{ g.score ?? '—' }}</div>
          </div>
          <div style="padding: 8px 10px; border-radius: 4px; border: 1px solid var(--accent-2); background: rgba(0,224,255,0.08);">
            <div class="rr-marquee rr-text-cyan" style="font-size: 9px;">SER</div>
            <div class="rr-num rr-text-cyan" style="font-size: 20px;">{{ seriesTotal }}</div>
          </div>
        </div>
      </div>

      <!-- Scrollable content area -->
      <div style="flex: 1; overflow-y: auto; padding: 0 16px 180px;" class="no-scrollbar">

        <!-- Scoresheet (2 rows of 5) -->
        <div class="rr-card rr-scanlines" style="padding: 12px; border-color: var(--accent-line); margin-bottom: 12px; overflow: hidden; position: relative;">
          <div class="rr-marquee rr-text-pink" style="font-size: 10px; margin-bottom: 8px;">
            ━ G{{ currentGameNum }} · FR {{ activeFrame + 1 }} ━
          </div>
          <!-- Frames 1-5 -->
          <div style="display: grid; grid-template-columns: repeat(5, 1fr); border: 1px solid var(--accent-line); border-radius: 3px; margin-bottom: 2px; overflow: hidden;">
            <div v-for="(_, i) in Array(5)" :key="i"
              @click="selectFrame(i)"
              :style="{
                padding: '5px 3px 7px',
                background: activeFrame === i && !gameComplete ? 'rgba(255,46,110,0.15)' : frames[i].roll1 === 10 ? 'rgba(0,224,255,0.06)' : 'transparent',
                border: activeFrame === i && !gameComplete ? '2px solid var(--accent)' : '0',
                borderRight: activeFrame !== i && i < 4 ? '1px solid var(--line-soft)' : '0',
                cursor: 'pointer',
              }">
              <div style="display: flex; justify-content: flex-end; gap: 1px; min-height: 13px;">
                <span class="rr-marquee rr-text-cyan" style="font-size: 9px; min-width: 9px; text-align: center;">{{ roll1Label(i) }}</span>
                <span class="rr-marquee rr-text-cyan" style="font-size: 9px; min-width: 9px; text-align: center;">{{ roll2Label(i) }}</span>
              </div>
              <div class="rr-num" :class="activeFrame === i ? 'rr-text-pink' : ''"
                style="font-size: 13px; text-align: center; margin-top: 1px; color: var(--text-0);">
                {{ results[i]?.cumulative ?? '—' }}
              </div>
            </div>
          </div>
          <!-- Frames 6-10 -->
          <div style="display: grid; grid-template-columns: repeat(5, 1fr); border: 1px solid var(--accent-line); border-radius: 3px; overflow: hidden;">
            <div v-for="(_, idx) in Array(5)" :key="idx + 5"
              @click="selectFrame(idx + 5)"
              :style="{
                padding: '5px 3px 7px',
                background: activeFrame === idx + 5 && !gameComplete ? 'rgba(255,46,110,0.15)' : frames[idx + 5]?.roll1 === 10 ? 'rgba(0,224,255,0.06)' : 'transparent',
                border: activeFrame === idx + 5 && !gameComplete ? '2px solid var(--accent)' : '0',
                borderRight: activeFrame !== idx + 5 && idx < 4 ? '1px solid var(--line-soft)' : '0',
                cursor: 'pointer',
              }">
              <div style="display: flex; justify-content: flex-end; gap: 1px; min-height: 13px;">
                <span class="rr-marquee rr-text-cyan" style="font-size: 9px; min-width: 9px; text-align: center;">{{ roll1Label(idx + 5) }}</span>
                <span class="rr-marquee rr-text-cyan" style="font-size: 9px; min-width: 9px; text-align: center;">{{ roll2Label(idx + 5) }}</span>
                <span v-if="idx + 5 === 9" class="rr-marquee rr-text-pink" style="font-size: 9px; min-width: 9px; text-align: center;">{{ roll3Label(9) }}</span>
              </div>
              <div class="rr-num" :class="activeFrame === idx + 5 ? 'rr-text-pink' : ''"
                style="font-size: 13px; text-align: center; margin-top: 1px; color: var(--text-0);">
                {{ results[idx + 5]?.cumulative ?? '—' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Game complete (mobile) -->
        <div v-if="gameComplete" class="rr-card" style="padding: 20px; text-align: center; margin-bottom: 12px; border-color: var(--accent-line); background: linear-gradient(135deg, var(--bg-1), #261538);">
          <div class="rr-marquee rr-text-cyan" style="font-size: 10px; margin-bottom: 8px;">GAME COMPLETE</div>
          <div class="rr-num rr-text-pink" style="font-size: 56px;">{{ results[9]?.cumulative ?? '—' }}</div>
          <button class="rr-btn rr-btn-primary" style="width: 100%; margin-top: 14px; padding: 14px;"
            @click="router.push(`/sessions/${sessionId}`)">
            BACK TO SESSION
          </button>
        </div>

        <!-- Pin deck -->
        <div v-if="!gameComplete" class="rr-card" style="padding: 14px; margin-bottom: 12px;">
          <div class="rr-marquee rr-text-cyan" style="font-size: 10px; margin-bottom: 8px; text-align: center;">
            {{ activeRoll === 1 ? 'FIRST BALL — ALL 10 UP' : 'ON DECK · TAP TO TRACK LEAVE' }}
          </div>
          <svg viewBox="0 0 130 130" width="100%" style="max-height: 130px; display: block;">
            <g v-for="p in pinPositions" :key="p.n">
              <circle :cx="p.x" :cy="p.y" r="10"
                :fill="standingPins.includes(p.n) ? 'rgba(255,255,255,0.92)' : 'transparent'"
                :stroke="standingPins.includes(p.n) ? '#FF2E6E' : 'rgba(110,95,117,0.4)'"
                :stroke-width="standingPins.includes(p.n) ? 1.5 : 1"
                :stroke-dasharray="standingPins.includes(p.n) ? 'none' : '2 2'"
                :style="standingPins.includes(p.n) ? { filter: 'drop-shadow(0 0 6px #FF2E6E)' } : {}"
              />
              <text :x="p.x" :y="p.y + 3" text-anchor="middle"
                font-family="Bungee" font-size="9"
                :fill="standingPins.includes(p.n) ? '#1A1020' : 'rgba(110,95,117,0.7)'">{{ p.n }}</text>
            </g>
          </svg>
        </div>

        <!-- Coach card -->
        <div class="rr-card" style="padding: 14px; margin-bottom: 12px; border-color: var(--accent-line); background: linear-gradient(180deg, rgba(255,46,110,0.10), transparent);">
          <div class="rr-marquee rr-text-pink" style="font-size: 10px; margin-bottom: 6px;">✦ COACH</div>
          <div class="rr-script" style="font-size: 14px; color: var(--text-0); line-height: 1.35;">
            Stay focused. Play your game, close every frame.
          </div>
        </div>

        <!-- In hand ball -->
        <div class="rr-card" style="padding: 12px; display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
          <div :style="{
            width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
            background: inHandBall ? `radial-gradient(circle at 30% 30%, ${ballColor(inHandBall.role_tag)}, ${ballColor(inHandBall.role_tag)}33 70%)` : 'var(--bg-3)',
            border: inHandBall ? `1px solid ${ballColor(inHandBall.role_tag)}` : '1px solid var(--line)',
            boxShadow: inHandBall ? `0 0 10px ${ballColor(inHandBall.role_tag)}66` : 'none',
          }"/>
          <div style="flex: 1; min-width: 0;">
            <div class="rr-script" style="font-size: 14px; color: var(--text-0);">
              {{ inHandBall ? `${inHandBall.brand} ${inHandBall.model}` : 'No ball' }}
            </div>
            <div class="rr-mono" style="font-size: 9px; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.12em;">
              IN HAND · {{ inHandBall?.weight_lb ?? '—' }} LB
            </div>
          </div>
          <select v-model="frames[activeFrame].ball_id"
            style="background: var(--bg-2); border: 1px solid var(--line); border-radius: 4px; color: var(--text-2); font-size: 9px; padding: 3px 5px; font-family: 'Bungee', sans-serif; cursor: pointer;">
            <option :value="null">—</option>
            <option v-for="ball in arsenal.activeBalls()" :key="ball.id" :value="ball.id">
              {{ ball.brand }} {{ ball.model }}
            </option>
          </select>
        </div>

        <!-- Frame note -->
        <div v-if="showNoteInput" style="margin-bottom: 12px;">
          <textarea v-model="frames[activeFrame].frame_note"
            @blur="showNoteInput = false"
            placeholder="Frame note…"
            style="width: 100%; padding: 10px; background: var(--bg-1); border: 1px solid var(--line); border-radius: 6px; color: var(--text-1); font-family: 'JetBrains Mono', monospace; font-size: 11px; resize: none; height: 56px; box-sizing: border-box;"/>
        </div>
        <button v-else @click="showNoteInput = true"
          style="color: var(--text-3); font-size: 11px; background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 6px; margin-bottom: 8px; font-family: 'JetBrains Mono', monospace;">
          ✎ {{ frames[activeFrame].frame_note || 'Add frame note' }}
        </button>

        <!-- Keypad (mobile) -->
        <div v-if="showKeypad && !gameComplete" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 12px;">
          <button v-for="n in pinButtons" :key="n"
            @click="enterRoll(n)"
            class="rr-btn"
            :class="n === pinsAvailable ? 'rr-btn-primary' : 'rr-btn-ghost'"
            style="padding: 14px; font-size: 16px; font-family: 'Bungee', sans-serif; min-height: 52px;">
            {{ n === 10 && pinsAvailable === 10 ? 'X' : n }}
          </button>
        </div>

      </div>

      <!-- Fixed bottom action bar (mobile) -->
      <div v-if="!gameComplete" style="position: fixed; left: 0; right: 0; bottom: 0; background: #14091E; border-top: 1px solid var(--accent-line); padding: 12px 16px 28px; z-index: 50;">
        <div style="display: flex; gap: 8px;">
          <button class="rr-btn rr-btn-primary" style="flex: 1; padding: 16px; font-size: 13px;" @click="enterStrike">STRIKE ✗</button>
          <button v-if="showSpareShortcut" class="rr-btn rr-btn-cyan" style="flex: 1; padding: 16px; font-size: 13px;" @click="enterSpare">SPARE /</button>
          <button class="rr-btn rr-btn-ghost" style="padding: 16px 14px; font-size: 16px;" @click="showKeypad = !showKeypad">⌨</button>
        </div>
      </div>
    </template>

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
