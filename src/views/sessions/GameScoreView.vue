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
const showNoteInput = ref(false)

const frames = ref<LocalFrame[]>(
  Array(10).fill(null).map(() => ({ dbId: null, roll1: null, roll2: null, roll3: null, ball_id: null, frame_note: '' }))
)

const activeFrame = ref(0)
const activeRoll = ref<1 | 2 | 3>(1)

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

onMounted(async () => {
  await arsenal.fetchAll()
  const { data } = await sessions.fetchOne(sessionId)
  if (data) {
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
  await saveCurrentFrame()
  advance()
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

function currentScore() {
  for (let i = 9; i >= 0; i--) {
    if (results.value[i]?.cumulative != null) return results.value[i].cumulative
  }
  return 0
}

function roll2Label(i: number) {
  const f = frames.value[i]
  if (f.roll2 === null) return ''
  if (i < 9 && f.roll1 !== 10 && (f.roll1 ?? 0) + f.roll2 === 10) return '/'
  if (f.roll2 === 10) return 'X'
  return String(f.roll2)
}
</script>

<template>
  <div class="flex flex-col h-full bg-slate-950">
    <div class="flex items-center justify-between px-4 pt-4 pb-2">
      <button @click="router.push(`/sessions/${sessionId}`)" class="tap-target text-slate-400 hover:text-white">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div class="text-center">
        <p class="text-xs text-slate-500">Frame {{ activeFrame + 1 }} · Roll {{ activeRoll }}</p>
        <p class="text-2xl font-bold text-white">{{ currentScore() }}</p>
      </div>
      <div class="w-10 flex justify-end">
        <span v-if="saving" class="w-4 h-4 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent inline-block" />
      </div>
    </div>

    <!-- Scorecard -->
    <div class="px-4 pb-3 overflow-x-auto">
      <div class="flex border border-slate-700 rounded-xl overflow-hidden">
        <button v-for="(_, i) in Array(10)" :key="i"
          @click="selectFrame(i)"
          class="flex flex-col border-r border-slate-700 last:border-r-0 transition-colors flex-1"
          :class="activeFrame === i ? 'bg-slate-700' : 'bg-slate-800'">
          <div class="text-center text-xs text-slate-500 py-0.5 border-b border-slate-700">{{ i + 1 }}</div>
          <div class="flex justify-end gap-px px-1 pt-1 pb-0.5 text-xs font-mono">
            <span class="w-4 h-4 flex items-center justify-center"
              :class="frames[i].roll1 !== null ? 'text-white' : 'text-slate-700'">
              {{ frames[i].roll1 === 10 && i < 9 ? 'X' : (frames[i].roll1 ?? '') }}
            </span>
            <span class="w-4 h-4 flex items-center justify-center"
              :class="frames[i].roll2 !== null ? 'text-white' : 'text-slate-700'">
              {{ roll2Label(i) }}
            </span>
            <span v-if="i === 9" class="w-4 h-4 flex items-center justify-center"
              :class="frames[i].roll3 !== null ? 'text-white' : 'text-slate-700'">
              {{ frames[i].roll3 === 10 ? 'X' : (frames[i].roll3 ?? '') }}
            </span>
          </div>
          <div class="text-center text-sm font-bold pb-1 min-h-[20px]"
            :class="results[i]?.cumulative != null ? 'text-white' : 'text-slate-700'">
            {{ results[i]?.cumulative ?? '' }}
          </div>
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex-1 flex items-center justify-center text-slate-400">Loading…</div>

    <template v-else-if="gameComplete">
      <div class="mx-4 mb-3 bg-indigo-900 rounded-2xl p-6 text-center">
        <p class="text-3xl font-bold text-white mb-1">{{ results[9]?.cumulative ?? '' }}</p>
        <p class="text-indigo-300">Game complete</p>
        <button @click="router.push(`/sessions/${sessionId}`)"
          class="tap-target mt-4 text-indigo-300 text-sm underline">Back to session</button>
      </div>
    </template>

    <template v-else>
      <!-- Ball selector -->
      <div class="px-4 pb-2">
        <select v-model="frames[activeFrame].ball_id"
          class="w-full rounded-xl bg-slate-800 border-slate-700 text-white text-sm py-2">
          <option :value="null">No ball selected</option>
          <option v-for="ball in arsenal.activeBalls()" :key="ball.id" :value="ball.id">
            {{ ball.brand }} {{ ball.model }}
          </option>
        </select>
      </div>

      <!-- Pin keypad -->
      <div class="flex-1 px-4 pb-4 flex flex-col gap-3">
        <button v-if="pinsAvailable === 10"
          @click="enterRoll(10)"
          class="tap-target w-full bg-indigo-600 hover:bg-indigo-500 text-white text-2xl font-bold rounded-2xl py-5 transition-colors">
          X — Strike
        </button>

        <div class="grid grid-cols-4 gap-2">
          <button v-for="n in pinButtons.filter((n) => !(n === 10 && pinsAvailable === 10))" :key="n"
            @click="enterRoll(n)"
            class="tap-target rounded-2xl text-xl font-bold transition-colors flex items-center justify-center py-4"
            :class="n === 0 ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-white'">
            {{ n }}
          </button>

          <button v-if="showSpareShortcut" @click="enterSpare"
            class="tap-target rounded-2xl text-xl font-bold bg-teal-700 hover:bg-teal-600 text-white transition-colors flex items-center justify-center py-4">
            /
          </button>
        </div>

        <!-- Frame note -->
        <div>
          <button v-if="!showNoteInput" @click="showNoteInput = true"
            class="tap-target text-slate-500 text-sm hover:text-slate-300 flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {{ frames[activeFrame].frame_note || 'Add note' }}
          </button>
          <textarea v-else v-model="frames[activeFrame].frame_note"
            @blur="showNoteInput = false"
            rows="2" placeholder="Frame note…"
            class="w-full rounded-xl bg-slate-800 border-slate-700 text-white placeholder-slate-500 text-sm resize-none" />
        </div>
      </div>
    </template>
  </div>
</template>
