<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionsStore } from '@/stores/sessions'
import { usePatternsStore } from '@/stores/patterns'
import { useArsenalStore } from '@/stores/arsenal'
import { useBowlerStore } from '@/stores/bowler'

const sessions = useSessionsStore()
const patternsStore = usePatternsStore()
const arsenal = useArsenalStore()
const bowler = useBowlerStore()
const router = useRouter()

const saving = ref(false)
const error = ref('')

const form = ref({
  event_type: 'league' as 'practice' | 'league' | 'tournament',
  event_name: '',
  center_name: '',
  lane_pair: '',
  session_date: new Date().toISOString().slice(0, 10),
  planned_games: 3,
  is_handicap: false,
  session_notes: '',
  starting_ball_id: '',
})

onMounted(async () => {
  await Promise.all([bowler.fetchMine(), patternsStore.fetchAll(), arsenal.fetchAll()])
  // Default to first in-bag ball
  const inBag = arsenal.balls.filter((b) => b.in_bag && b.status_active)
  if (inBag.length) form.value.starting_ball_id = inBag[0].id
})

const eventTypes = [
  { value: 'practice',   label: 'PRACTICE' },
  { value: 'league',     label: 'LEAGUE' },
  { value: 'tournament', label: 'TOURNEY' },
  { value: 'open',       label: 'OPEN' },
]

const inBagBalls = computed(() => arsenal.balls.filter((b) => b.in_bag && b.status_active))

// Pattern combobox: user can type freely or pick from datalist
const patternQuery = ref('')

// Find a known pattern matching the typed text (case-insensitive)
const matchedPattern = computed(() =>
  patternsStore.patterns.find((p) => p.name.toLowerCase() === patternQuery.value.trim().toLowerCase())
)

// What goes into the session: matched ID or null for custom
const resolvedPatternId = computed(() => matchedPattern.value?.id ?? null)

// Snapshot: matched pattern object, or minimal custom stub with just a name
const resolvedPatternSnapshot = computed(() => {
  if (matchedPattern.value) return matchedPattern.value
  const name = patternQuery.value.trim()
  if (name) return { name, custom: true }
  return null
})

const roleColor: Record<string, string> = {
  benchmark: '#FF2E6E', strong_asym: '#00E0FF', transition: '#FFD83D',
  urethane: '#B8A88A', spare: '#8A4BE8', other: '#6E5F75',
}
function ballColor(ball: { role_tag?: string | null }) {
  return roleColor[ball.role_tag || ''] || '#FF2E6E'
}

async function save() {
  if (!form.value.center_name.trim()) { error.value = 'Center name is required'; return }
  if (!bowler.profile) { error.value = 'Please create a bowler profile first'; return }
  error.value = ''
  saving.value = true

  const { data: session, error: sErr } = await sessions.createSession({
    event_type: form.value.event_type as any,
    event_name: form.value.event_name.trim() || null,
    center_name: form.value.center_name.trim(),
    lane_pair: form.value.lane_pair || null,
    pattern_id: resolvedPatternId.value,
    pattern_snapshot: resolvedPatternSnapshot.value,
    session_date: form.value.session_date,
    planned_games: form.value.planned_games,
    is_handicap: form.value.is_handicap,
    session_notes: form.value.session_notes || null,
  } as any)

  if (sErr || !session) { saving.value = false; error.value = sErr?.message ?? 'Failed to create session'; return }

  const { data: game, error: gErr } = await sessions.createGame(session.id, 1)
  saving.value = false
  if (gErr || !game) { error.value = gErr?.message ?? 'Failed to create game'; return }

  router.push(`/sessions/${session.id}/games/${game.id}`)
}
</script>

<template>
  <div class="new-root no-scrollbar">
    <!-- Status bar (mobile) -->
    <div class="status-bar rr-mono">
      <span>{{ new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }}</span>
      <span style="color:var(--text-2);">● ● ● ▮▮▮▮</span>
    </div>

    <!-- Header -->
    <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 16px 12px; flex-shrink:0;">
      <button class="rr-mono" style="font-size:22px; color:var(--text-2); background:none; border:none; cursor:pointer; line-height:1;" @click="router.back()">×</button>
      <div class="rr-script rr-text-cyan" style="font-size:22px;">New session</div>
      <span style="width:22px;" />
    </div>

    <!-- Scrollable form -->
    <form class="form-scroll no-scrollbar" @submit.prevent="save">

      <!-- Recent / quick-start chips -->
      <div class="rr-marquee rr-text-pink" style="font-size:10px; margin:6px 0 8px;">RECENT · ONE-TAP</div>
      <div style="font-size:12px; color:var(--text-3); font-style:italic; padding:8px 0;">
        Recent sessions appear here after you bowl a few.
      </div>

      <!-- Event type -->
      <div class="rr-marquee rr-text-cyan" style="font-size:10px; margin:20px 0 8px;">EVENT TYPE</div>
      <div class="seg-4">
        <button
          v-for="t in eventTypes" :key="t.value"
          type="button"
          class="rr-marquee seg-item-4"
          :class="{ 'seg-active-4': form.event_type === t.value }"
          @click="form.event_type = t.value as any"
        >{{ t.label }}</button>
      </div>

      <!-- Event / league name (shown for league + tournament) -->
      <template v-if="form.event_type === 'league' || form.event_type === 'tournament'">
        <div class="rr-marquee rr-text-pink" style="font-size:10px; margin:18px 0 8px;">
          {{ form.event_type === 'league' ? 'LEAGUE' : 'TOURNAMENT' }} NAME
        </div>
        <input
          v-model="form.event_name"
          type="text"
          :placeholder="form.event_type === 'league' ? 'Thursday Night Doubles' : 'Spring Classic'"
          class="rr-script retro-input"
          style="font-style:italic; font-size:15px;"
        />
      </template>

      <!-- Center + lane -->
      <div style="display:grid; grid-template-columns:1.3fr 1fr; gap:10px; margin-top:14px;">
        <div>
          <div class="rr-marquee rr-text-pink" style="font-size:10px; margin-bottom:6px;">CENTER *</div>
          <input
            v-model="form.center_name"
            type="text"
            placeholder="AMF North"
            class="rr-script retro-input"
            style="font-size:14px;"
            required
          />
        </div>
        <div>
          <div class="rr-marquee rr-text-cyan" style="font-size:10px; margin-bottom:6px;">LANE PAIR</div>
          <input
            v-model="form.lane_pair"
            type="text"
            placeholder="13 / 14"
            class="rr-num retro-input"
            style="font-size:14px; text-align:center;"
          />
        </div>
      </div>

      <!-- Oil pattern — combobox: pick from list OR type a custom name -->
      <div class="rr-marquee rr-text-pink" style="font-size:10px; margin:18px 0 8px;">OIL PATTERN</div>
      <div style="position:relative;">
        <input
          v-model="patternQuery"
          type="text"
          list="pattern-datalist"
          placeholder="House · 40 ft, Viper, custom…"
          class="rr-script retro-input"
          style="font-size:14px; font-style:italic;"
          autocomplete="off"
        />
        <datalist id="pattern-datalist">
          <option v-for="p in patternsStore.patterns" :key="p.id"
            :value="p.name + (p.length_ft ? ' · ' + p.length_ft + ' ft' : '')" />
        </datalist>
        <span v-if="matchedPattern" class="rr-mono"
          style="position:absolute; right:10px; top:50%; transform:translateY(-50%); font-size:9px; color:var(--accent-2); pointer-events:none;">
          ✓ MATCHED
        </span>
      </div>
      <div v-if="patternQuery && !matchedPattern" class="rr-mono"
        style="font-size:9px; color:var(--text-3); margin-top:4px; padding-left:2px;">
        Custom pattern — will be saved with the session
      </div>

      <!-- Games + handicap -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:14px;">
        <div>
          <div class="rr-marquee rr-text-cyan" style="font-size:10px; margin-bottom:6px;">GAMES</div>
          <div class="rr-card" style="padding:10px; display:flex; align-items:center; justify-content:space-between;">
            <button type="button" @click="form.planned_games = Math.max(1, form.planned_games - 1)"
              style="font-size:18px; color:var(--accent-2); background:none; border:none; cursor:pointer; line-height:1; padding:0 4px;">−</button>
            <span class="rr-num rr-text-cyan" style="font-size:22px;">{{ form.planned_games }}</span>
            <button type="button" @click="form.planned_games = Math.min(8, form.planned_games + 1)"
              style="font-size:18px; color:var(--accent-2); background:none; border:none; cursor:pointer; line-height:1; padding:0 4px;">+</button>
          </div>
        </div>
        <div>
          <div class="rr-marquee rr-text-pink" style="font-size:10px; margin-bottom:6px;">SCORING</div>
          <div class="seg-2">
            <button type="button" class="rr-marquee seg-item-2" :class="{ 'seg-active-4': form.is_handicap }" @click="form.is_handicap = true">HCP</button>
            <button type="button" class="rr-marquee seg-item-2" :class="{ 'seg-active-4': !form.is_handicap }" @click="form.is_handicap = false">SCR</button>
          </div>
        </div>
      </div>

      <!-- Date -->
      <div class="rr-marquee rr-text-cyan" style="font-size:10px; margin:18px 0 8px;">DATE</div>
      <input v-model="form.session_date" type="date" class="retro-input rr-mono" style="font-size:13px;" />

      <!-- Starting ball -->
      <template v-if="inBagBalls.length > 0">
        <div class="rr-marquee rr-text-cyan" style="font-size:10px; margin:18px 0 8px;">STARTING BALL</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
          <button
            v-for="ball in inBagBalls"
            :key="ball.id"
            type="button"
            class="rr-card ball-select-btn"
            :style="form.starting_ball_id === ball.id
              ? 'border-color:var(--accent); box-shadow:var(--neon-glow-pink);'
              : ''"
            @click="form.starting_ball_id = ball.id"
          >
            <div class="ball-dot" :style="`--c:${ballColor(ball)};`" />
            <span class="rr-script" style="font-size:13px; color:var(--text-0);">{{ ball.brand }} {{ ball.model }}</span>
          </button>
        </div>
      </template>

      <!-- Error -->
      <p v-if="error" class="rr-mono" style="font-size:11px; color:var(--danger); margin-top:12px;">{{ error }}</p>

      <!-- Auto-save note -->
      <div class="rr-mono" style="font-size:10px; color:var(--text-3); text-align:center; margin-top:20px;">✓ DRAFT AUTO-SAVED</div>

      <!-- Spacer for sticky CTA -->
      <div style="height:80px;" />
    </form>

    <!-- Sticky CTA -->
    <div class="sticky-cta">
      <button type="submit" class="rr-btn rr-btn-primary cta-btn" :disabled="saving" @click.prevent="save">
        {{ saving ? 'STARTING…' : 'START GAME 1 →' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.new-root {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-0);
}

.status-bar {
  display: flex;
  justify-content: space-between;
  padding: 10px 20px 4px;
  font-size: 12px;
  color: var(--text-1);
  font-weight: 600;
  flex-shrink: 0;
}

.form-scroll {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 0 16px;
}

/* Segmented 4-way */
.seg-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  padding: 4px;
  background: var(--bg-1);
  border: 1px solid var(--line);
  border-radius: 6px;
}
.seg-item-4 {
  padding: 10px 4px;
  border-radius: 4px;
  text-align: center;
  font-size: 9px;
  letter-spacing: 0.06em;
  color: var(--text-2);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.12s, color 0.12s, box-shadow 0.12s;
}
.seg-active-4 {
  background: var(--accent);
  color: #FFF;
  box-shadow: var(--neon-glow-pink);
}

/* Segmented 2-way */
.seg-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  padding: 4px;
  background: var(--bg-1);
  border: 1px solid var(--line);
  border-radius: 6px;
  height: 100%;
}
.seg-item-2 {
  padding: 6px 4px;
  border-radius: 4px;
  text-align: center;
  font-size: 9px;
  letter-spacing: 0.06em;
  color: var(--text-2);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.12s, color 0.12s, box-shadow 0.12s;
}

/* Retro input */
.retro-input {
  width: 100%;
  padding: 12px 14px;
  background: var(--bg-1);
  border: 1px solid var(--line);
  border-radius: 6px;
  color: var(--text-0);
  outline: none;
  font-size: 14px;
}
.retro-input:focus {
  border-color: var(--accent-line);
}
.retro-input::placeholder { color: var(--text-3); }

.retro-select {
  width: 100%;
  padding: 12px 14px;
  background: var(--bg-1);
  border: 1px solid var(--line);
  border-radius: 6px;
  color: var(--text-0);
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236E5F75' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
}
.retro-select:focus { border-color: var(--accent-line); }
.retro-select option { background: var(--bg-1); color: var(--text-0); }

/* Ball selector */
.ball-select-btn {
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  background: var(--bg-1);
  border: 1px solid var(--line);
  transition: border-color 0.12s, box-shadow 0.12s;
  text-align: left;
}

.ball-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  flex-shrink: 0;
  background: radial-gradient(circle at 30% 30%, var(--c, #FF2E6E), color-mix(in srgb, var(--c, #FF2E6E) 20%, transparent) 70%);
  border: 1px solid var(--c, #FF2E6E);
}

/* Sticky CTA */
.sticky-cta {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--sidebar-bg);
  border-top: 1px solid var(--accent-line);
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px));
  flex-shrink: 0;
}

.cta-btn {
  width: 100%;
  padding: 16px;
  font-size: 13px;
}

.cta-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (min-width: 1024px) {
  .status-bar { display: none; }
  .form-scroll { padding: 0 28px; max-width: 600px; margin: 0 auto; }
}
</style>
