<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useSessionsStore } from '@/stores/sessions'
import { useArsenalStore } from '@/stores/arsenal'

const sessions = useSessionsStore()
const arsenal = useArsenalStore()

onMounted(async () => {
  await Promise.all([sessions.fetchAll(), arsenal.fetchAll()])
})

// Build rolling average data for trend chart (last 12 sessions)
const trendData = computed(() => {
  const data = sessions.sessions
    .slice(0, 12)
    .reverse()
    .map((s) => {
      const scores = (s.games ?? []).map((g) => g.final_score).filter(Boolean) as number[]
      if (!scores.length) return null
      return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    })
    .filter((v): v is number => v !== null)
  return data.length >= 2 ? data : null
})

// Overall average
const overallAvg = computed(() => {
  const scores = sessions.sessions.flatMap((s) => (s.games ?? []).map((g) => g.final_score).filter(Boolean) as number[])
  if (!scores.length) return null
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
})

// Peak score
const peak = computed(() => {
  const scores = sessions.sessions.flatMap((s) => (s.games ?? []).map((g) => g.final_score).filter(Boolean) as number[])
  return scores.length ? Math.max(...scores) : null
})

// Per-ball averages
const perBall = computed(() => {
  const map = new Map<string, { name: string; color: string; scores: number[] }>()
  for (const s of sessions.sessions) {
    for (const g of s.games ?? []) {
      if (!g.final_score || !g.ball_id) continue
      const ball = arsenal.balls.find((b) => b.id === g.ball_id)
      if (!ball) continue
      const key = ball.id
      if (!map.has(key)) map.set(key, { name: ball.ball_name || ball.model || 'Unknown', color: ball.color_hex || '#FF2E6E', scores: [] })
      map.get(key)!.scores.push(g.final_score)
    }
  }
  return [...map.values()]
    .map((b) => ({ ...b, avg: Math.round(b.scores.reduce((a, c) => a + c, 0) / b.scores.length) }))
    .sort((a, b) => b.avg - a.avg)
})

// Per-event-type
const perType = computed(() => {
  const map = new Map<string, number[]>()
  for (const s of sessions.sessions) {
    const scores = (s.games ?? []).map((g) => g.final_score).filter(Boolean) as number[]
    if (!scores.length) continue
    if (!map.has(s.event_type)) map.set(s.event_type, [])
    map.get(s.event_type)!.push(...scores)
  }
  const labels: Record<string, string> = { practice: 'PRACTICE', league: 'LEAGUE', tournament: 'TOURNEY' }
  const colors: Record<string, string> = { practice: '#B8A88A', league: '#00E0FF', tournament: '#FF2E6E' }
  return [...map.entries()]
    .map(([k, v]) => ({
      type: k,
      label: labels[k] || k.toUpperCase(),
      color: colors[k] || '#B8A88A',
      avg: Math.round(v.reduce((a, b) => a + b, 0) / v.length),
      games: v.length,
    }))
    .sort((a, b) => b.avg - a.avg)
})

const maxBallAvg = computed(() => Math.max(...perBall.value.map((b) => b.avg), 1))

function trendPath(data: number[], w = 400, h = 80) {
  const max = Math.max(...data), min = Math.min(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 10) - 5
    return { x, y }
  })
  const line = 'M' + pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L')
  const area = line + ` L${w},${h} L0,${h} Z`
  return { line, area, pts }
}
</script>

<template>
  <div class="analytics-root no-scrollbar">
    <!-- Status bar (mobile) -->
    <div class="status-bar rr-mono">
      <span>{{ new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }}</span>
      <span style="color:var(--text-2);">● ● ● ▮▮▮▮</span>
    </div>

    <!-- Header -->
    <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 16px 12px; flex-shrink:0;">
      <div>
        <div class="rr-marquee rr-text-pink" style="font-size:10px;">━━━ DEEP DIVE ━━━</div>
        <div class="rr-script rr-text-cyan" style="font-size:28px; line-height:1.1; margin-top:2px;">Analytics</div>
      </div>
      <div class="rr-btn rr-btn-ghost" style="padding:6px 10px; font-size:10px; cursor:default;">⏷ ALL TIME</div>
    </div>

    <!-- Content -->
    <div class="analytics-scroll no-scrollbar">

      <!-- Empty state -->
      <div v-if="!sessions.loading && sessions.sessions.length === 0" class="rr-card" style="padding:24px; text-align:center;">
        <div class="rr-script rr-text-cyan" style="font-size:20px; margin-bottom:8px;">No data yet</div>
        <p style="font-size:12px; color:var(--text-2); margin-bottom:16px;">Log some sessions to see your analytics.</p>
        <router-link to="/sessions/new" class="rr-btn rr-btn-primary">START SESSION →</router-link>
      </div>

      <template v-else>
        <!-- Hero avg card -->
        <div class="rr-card rr-scanlines" style="padding:18px; border-color:var(--accent-line); background:linear-gradient(135deg, var(--bg-1), #261538); margin-bottom:12px; overflow:hidden; position:relative;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="rr-marquee rr-text-pink" style="font-size:10px;">AVG · ALL TIME</span>
            <span v-if="peak" class="rr-chip" style="background:var(--accent); color:#FFF; border-color:var(--accent);">PEAK {{ peak }}</span>
          </div>
          <div style="display:flex; align-items:baseline; gap:12px; margin-top:10px;">
            <span v-if="overallAvg" class="rr-num rr-text-cyan" style="font-size:72px; line-height:1;">{{ overallAvg }}</span>
            <span v-else class="rr-num rr-text-cyan" style="font-size:72px; line-height:1;">—</span>
            <div>
              <div class="rr-mono" style="font-size:8px; color:var(--text-3); text-transform:uppercase; letter-spacing:0.08em;">{{ sessions.sessions.length }} SESSION<template v-if="sessions.sessions.length !== 1">S</template></div>
            </div>
          </div>

          <!-- Trend chart -->
          <div v-if="trendData" style="margin-top:12px;">
            <svg viewBox="0 0 300 40" width="100%" height="40" preserveAspectRatio="none" style="display:block;">
              <defs>
                <linearGradient id="tGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stop-color="rgba(0,224,255,0.4)"/>
                  <stop offset="100%" stop-color="rgba(0,224,255,0)"/>
                </linearGradient>
              </defs>
              <path :d="trendPath(trendData, 300, 38).area" fill="url(#tGrad)"/>
              <path :d="trendPath(trendData, 300, 38).line" fill="none" stroke="#00E0FF" stroke-width="2"
                style="filter:drop-shadow(0 0 4px #00E0FF);"/>
              <circle
                v-for="(p, i) in trendPath(trendData, 300, 38).pts.filter((_, i) => i === 0 || i === trendData.length - 1)"
                :key="i"
                :cx="p.x" :cy="p.y" r="3"
                fill="#FF2E6E"
                style="filter:drop-shadow(0 0 4px #FF2E6E);"
              />
            </svg>
          </div>
        </div>

        <!-- Per-ball averages -->
        <div class="rr-marquee rr-text-cyan" style="font-size:10px; margin:8px 0;">PER-BALL AVG</div>
        <div v-if="perBall.length === 0" style="font-size:12px; color:var(--text-3); padding:8px 0;">
          Link balls to games to see per-ball averages.
        </div>
        <div v-for="ball in perBall" :key="ball.name" class="rr-card" style="padding:12px; margin-bottom:8px; display:flex; align-items:center; gap:10px;">
          <div style="width:28px; height:28px; border-radius:50%; flex-shrink:0;"
            :style="`background:radial-gradient(circle at 30% 30%, ${ball.color}, color-mix(in srgb, ${ball.color} 20%, transparent) 70%); border:1px solid ${ball.color}; box-shadow:0 0 8px ${ball.color}66;`"
          />
          <div style="flex:1; min-width:0;">
            <div class="rr-script" style="font-size:14px; color:var(--text-0);">{{ ball.name }}</div>
            <div style="height:3px; background:var(--bg-3); border-radius:2px; margin-top:6px; overflow:hidden;">
              <div :style="`width:${Math.round((ball.avg / maxBallAvg) * 100)}%; height:100%; background:${ball.color}; box-shadow:0 0 6px ${ball.color};`"/>
            </div>
            <div class="rr-mono" style="font-size:9px; color:var(--text-3); margin-top:2px; text-transform:uppercase;">{{ ball.scores.length }} game<template v-if="ball.scores.length !== 1">s</template></div>
          </div>
          <div class="rr-num" :style="`font-size:15px; color:${ball.color}; text-shadow:0 0 6px ${ball.color}66;`">{{ ball.avg }}</div>
        </div>

        <!-- Per-event type -->
        <div class="rr-marquee rr-text-pink" style="font-size:10px; margin:18px 0 8px;">PER-TYPE AVG</div>
        <div v-for="t in perType" :key="t.type" class="rr-card" style="padding:12px; margin-bottom:8px; display:flex; align-items:center; justify-content:space-between;">
          <div>
            <div class="rr-marquee" style="font-size:10px;" :style="`color:${t.color};`">{{ t.label }}</div>
            <div class="rr-mono" style="font-size:9px; color:var(--text-3); margin-top:2px;">{{ t.games }} game<template v-if="t.games !== 1">s</template></div>
          </div>
          <div class="rr-num" style="font-size:20px;" :style="`color:${t.color}; text-shadow:0 0 8px ${t.color}66;`">{{ t.avg }}</div>
        </div>

        <!-- Empty per-type -->
        <div v-if="perType.length === 0" style="font-size:12px; color:var(--text-3); padding:8px 0; margin-bottom:12px;">
          Log more sessions with scored games to see breakdowns.
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.analytics-root {
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

.analytics-scroll {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 0 16px 24px;
}

@media (min-width: 1024px) {
  .status-bar { display: none; }
  .analytics-scroll { padding: 0 28px 28px; }
}
</style>
