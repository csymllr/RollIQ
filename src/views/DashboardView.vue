<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useSessionsStore } from '@/stores/sessions'
import { useArsenalStore } from '@/stores/arsenal'
import { useBowlerStore } from '@/stores/bowler'

const sessions = useSessionsStore()
const arsenal = useArsenalStore()
const bowler = useBowlerStore()

onMounted(async () => {
  await Promise.all([bowler.fetchMine(), sessions.fetchAll(), arsenal.fetchAll()])
})

const recentSessions = computed(() => sessions.sessions.slice(0, 4))
const inBagBalls = computed(() => arsenal.balls.filter((b) => b.in_bag && b.status_active))

const roleColor: Record<string, string> = {
  benchmark: '#FF2E6E', strong_asym: '#00E0FF', transition: '#FFD83D',
  urethane: '#B8A88A', spare: '#8A4BE8', other: '#6E5F75',
}
function ballColor(ball: { role_tag?: string | null }) {
  return roleColor[ball.role_tag || ''] || '#FF2E6E'
}

function formatDate(d: string) {
  const dt = new Date(d + 'T00:00:00')
  return {
    day: dt.toLocaleDateString('en-US', { day: 'numeric' }),
    mon: dt.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    full: dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase(),
  }
}

const eventTypeChip: Record<string, { label: string; style: string }> = {
  practice:   { label: 'PRACTICE', style: 'background:var(--bg-2)' },
  league:     { label: 'LEAGUE',   style: 'background:rgba(0,224,255,0.10); border-color:rgba(0,224,255,0.3); color:var(--accent-2)' },
  tournament: { label: 'TOURNEY',  style: 'background:rgba(255,46,110,0.10); border-color:var(--accent-line); color:var(--accent)' },
}

// Rolling 30-day average from real sessions
const avg30 = computed(() => {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 30)
  const recent = sessions.sessions.filter((s) => new Date(s.session_date) >= cutoff)
  const scores = recent.flatMap((s) => (s.games ?? []).map((g) => g.final_score).filter(Boolean) as number[])
  if (!scores.length) return null
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
})

const peakScore = computed(() => {
  const scores = sessions.sessions.flatMap((s) => (s.games ?? []).map((g) => g.final_score).filter(Boolean) as number[])
  return scores.length ? Math.max(...scores) : null
})

// Sparkline data (last 12 session scores)
const sparkData = computed(() => {
  const allScores = sessions.sessions
    .flatMap((s) => (s.games ?? []).map((g) => g.final_score).filter(Boolean) as number[])
    .slice(-12)
  return allScores.length >= 2 ? allScores : null
})

function buildSparkPath(data: number[], w = 120, h = 36) {
  const max = Math.max(...data), min = Math.min(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * h
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return 'M' + pts.join(' L')
}
</script>

<template>
  <div class="pulse-root no-scrollbar">
    <!-- ── Status bar (mobile) ── -->
    <div class="status-bar rr-mono">
      <span>{{ new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }}</span>
      <span style="color:var(--text-2);">● ● ● ▮▮▮▮</span>
    </div>

    <!-- ── Top bar ── -->
    <div class="top-bar">
      <div>
        <div class="rr-mono" style="font-size:10px; color:var(--text-3); text-transform:uppercase; letter-spacing:0.1em;">
          {{ new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase() }}
        </div>
        <div class="rr-script rr-text-cyan" style="font-size:32px; line-height:1.1; margin-top:2px;">Pulse</div>
      </div>
      <!-- Desktop: action buttons -->
      <div class="desktop-actions">
        <div class="rr-chip" style="gap:6px; padding:4px 10px;">
          <span class="rr-mono">⌘K</span>
          <span style="color:var(--text-2); font-family:inherit; font-size:10px;">quick action</span>
        </div>
        <router-link to="/sessions/new" class="rr-btn rr-btn-primary">＋ NEW SESSION</router-link>
      </div>
    </div>

    <!-- ── Scrollable content ── -->
    <div class="pulse-scroll no-scrollbar">

      <!-- Date marquee (mobile) -->
      <div class="rr-marquee rr-text-pink mobile-only" style="font-size:10px; padding:6px 0 10px;">
        {{ new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase() }} · EVENING
      </div>

      <!-- Empty state -->
      <div v-if="!sessions.loading && sessions.sessions.length === 0" class="rr-card empty-state">
        <div class="rr-script rr-text-cyan" style="font-size:24px; margin-bottom:8px;">Ready to bowl?</div>
        <p style="font-size:13px; color:var(--text-2); margin-bottom:20px;">Log your first session to start tracking your game.</p>
        <router-link to="/sessions/new" class="rr-btn rr-btn-primary" style="width:100%; justify-content:center;">
          START FIRST SESSION →
        </router-link>
      </div>

      <template v-else>
        <!-- ── Hero card ── -->
        <div class="rr-card rr-scanlines hero-card">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="rr-marquee rr-text-pink" style="font-size:10px;">30-DAY AVG</span>
            <span v-if="avg30" class="rr-chip" style="background:var(--accent); color:#FFF; border-color:var(--accent); box-shadow:var(--neon-glow-pink);">▲ TRACKING</span>
          </div>

          <div style="display:flex; align-items:baseline; gap:12px; margin-top:10px;">
            <span v-if="avg30" class="rr-num rr-text-cyan hero-avg">{{ avg30 }}</span>
            <span v-else class="rr-num rr-text-cyan hero-avg" style="font-size:60px;">—</span>
            <div v-if="peakScore" style="display:flex; flex-direction:column;">
              <span class="rr-mono" style="font-size:9px; color:var(--text-3); text-transform:uppercase; letter-spacing:0.1em;">PEAK</span>
              <span class="rr-num rr-text-pink" style="font-size:20px;">{{ peakScore }}</span>
            </div>
          </div>

          <!-- Mini scoresheet sparkline -->
          <div v-if="sparkData" style="margin-top:16px;">
            <svg :viewBox="`0 0 300 40`" width="100%" height="40" preserveAspectRatio="none" style="display:block;">
              <defs>
                <linearGradient id="sparkGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stop-color="rgba(0,224,255,0.4)"/>
                  <stop offset="100%" stop-color="rgba(0,224,255,0)"/>
                </linearGradient>
              </defs>
              <path
                :d="buildSparkPath(sparkData, 300, 36) + ' L300,40 L0,40 Z'"
                fill="url(#sparkGrad)"
              />
              <path
                :d="buildSparkPath(sparkData, 300, 36)"
                fill="none" stroke="#00E0FF" stroke-width="2"
                style="filter: drop-shadow(0 0 4px #00E0FF);"
              />
            </svg>
          </div>

          <div class="rr-mono" style="font-size:9px; color:var(--text-3); text-transform:uppercase; letter-spacing:0.1em; margin-top:8px; text-align:center;">
            LAST {{ sessions.sessions.length }} SESSION<template v-if="sessions.sessions.length !== 1">S</template>
          </div>
        </div>

        <!-- ── Coach card ── -->
        <div class="rr-card coach-card" style="border-color:var(--accent-line); background:linear-gradient(180deg,rgba(255,46,110,0.10),transparent);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="rr-text-pink" style="font-size:14px;">✦</span>
              <span class="rr-marquee rr-text-pink" style="font-size:10px;">COACH</span>
            </div>
            <span class="rr-mono" style="font-size:10px; color:var(--text-3);">DAILY</span>
          </div>
          <div class="rr-script" style="font-size:18px; color:var(--text-0); line-height:1.3;">
            Keep logging sessions — your trends will appear here.
          </div>
          <div style="font-size:12px; color:var(--text-1); margin-top:6px; line-height:1.5;">
            The more you track, the sharper the AI coach insight.
          </div>
        </div>

        <!-- ── In the bag ── -->
        <div v-if="inBagBalls.length > 0" class="rr-card" style="padding:16px; margin-top:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
            <span class="rr-script rr-text-pink" style="font-size:20px;">In the bag</span>
            <span class="rr-mono" style="font-size:9px; color:var(--text-3); text-transform:uppercase;">
              {{ inBagBalls.length }} BALL<template v-if="inBagBalls.length !== 1">S</template>
            </span>
          </div>
          <div v-for="(ball, i) in inBagBalls.slice(0, 3)" :key="ball.id"
            style="display:flex; align-items:center; gap:12px; padding:12px 0;"
            :style="i > 0 ? 'border-top:1px solid var(--line-soft)' : ''"
          >
            <div class="ball-avatar"
              :style="`background:radial-gradient(circle at 30% 30%, ${ballColor(ball)}, ${ballColor(ball)}33 70%); border:1px solid ${ballColor(ball)}; box-shadow:0 0 12px ${ballColor(ball)}66;`"
            />
            <div style="flex:1; min-width:0;">
              <div class="rr-script" style="font-size:15px; color:var(--text-0);">{{ ball.brand }} {{ ball.model }}</div>
              <div class="rr-mono" style="font-size:9px; color:var(--text-3); margin-top:2px; text-transform:uppercase; letter-spacing:0.08em;">
                {{ ball.weight_lb ? ball.weight_lb + ' LB' : '' }}
              </div>
            </div>
          </div>
          <router-link to="/arsenal"
            class="rr-mono"
            style="font-size:10px; color:var(--accent-2); text-decoration:none; display:block; text-align:right; margin-top:10px; text-transform:uppercase; letter-spacing:0.08em;"
          >VIEW ALL →</router-link>
        </div>

        <!-- ── Recent sessions ── -->
        <div class="rr-marquee rr-text-pink" style="font-size:10px; padding:20px 0 10px;">RECENT SESSIONS</div>

        <div v-for="(s, i) in recentSessions" :key="s.id"
          class="rr-card session-card"
          :style="i < recentSessions.length - 1 ? 'margin-bottom:10px;' : ''"
        >
          <router-link :to="`/sessions/${s.id}`" style="display:flex; align-items:center; gap:12px; text-decoration:none;">
            <!-- Date block -->
            <div style="width:44px; text-align:center; flex-shrink:0; border-right:1px solid var(--line-soft); padding-right:12px;">
              <div class="rr-num rr-text-cyan" style="font-size:20px; line-height:1;">{{ formatDate(s.session_date).day }}</div>
              <div class="rr-mono" style="font-size:9px; color:var(--text-3); margin-top:2px; text-transform:uppercase; letter-spacing:0.08em;">{{ formatDate(s.session_date).mon }}</div>
            </div>
            <!-- Info -->
            <div style="flex:1; min-width:0;">
              <div class="rr-script" style="font-size:16px; color:var(--text-0); line-height:1.2; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                {{ s.event_name || s.center_name || 'Session' }}
              </div>
              <div style="display:flex; gap:6px; margin-top:4px; align-items:center; flex-wrap:wrap;">
                <span class="rr-chip"
                  :style="eventTypeChip[s.event_type]?.style || ''"
                >{{ eventTypeChip[s.event_type]?.label || s.event_type?.toUpperCase() || 'SESSION' }}</span>
                <span v-if="s.games?.length" class="rr-mono" style="font-size:10px; color:var(--text-3);">
                  {{ s.games.length }} game<template v-if="s.games.length !== 1">s</template>
                </span>
              </div>
            </div>
            <!-- High score -->
            <div style="text-align:right; flex-shrink:0;">
              <div v-if="s.games?.some(g => g.final_score)">
                <div class="rr-num rr-text-cyan" style="font-size:18px;">
                  {{ Math.max(...s.games.map(g => g.final_score || 0).filter(Boolean)) }}
                </div>
                <div class="rr-mono" style="font-size:9px; color:var(--text-3); text-transform:uppercase; letter-spacing:0.08em;">HIGH</div>
              </div>
              <div v-else class="rr-num" style="font-size:16px; color:var(--text-3);">—</div>
            </div>
          </router-link>
        </div>

        <router-link to="/sessions" class="rr-mono" style="font-size:10px; color:var(--accent-2); text-decoration:none; display:block; text-align:center; padding:16px 0; text-transform:uppercase; letter-spacing:0.08em;">
          VIEW ALL SESSIONS →
        </router-link>
      </template>
    </div>
  </div>
</template>

<style scoped>
.pulse-root {
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

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 10px 20px 12px;
  flex-shrink: 0;
}

.desktop-actions {
  display: none;
  align-items: center;
  gap: 10px;
}

.mobile-only { display: block; }

.pulse-scroll {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 0 16px 24px;
}

.hero-card {
  padding: 20px;
  background: linear-gradient(135deg, var(--bg-1) 0%, #261538 100%);
  border-color: var(--accent-line);
  overflow: hidden;
}

.hero-avg {
  font-size: 88px;
  line-height: 1;
  text-shadow: 0 0 18px rgba(0,224,255,0.5), 0 0 36px rgba(0,224,255,0.25);
}

.coach-card {
  padding: 16px;
  margin-top: 12px;
}

.ball-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  flex-shrink: 0;
}

.session-card { padding: 14px; }

.empty-state {
  padding: 24px;
  text-align: center;
  margin-top: 12px;
}

/* Desktop overrides */
@media (min-width: 1024px) {
  .status-bar { display: none; }
  .mobile-only { display: none; }
  .desktop-actions { display: flex; }

  .top-bar {
    padding: 24px 28px 16px;
  }

  .pulse-scroll {
    padding: 0 28px 28px;
  }

  .hero-card {
    padding: 24px;
  }

  .hero-avg {
    font-size: 104px;
  }
}
</style>
