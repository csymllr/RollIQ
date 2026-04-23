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

const eventChip: Record<string, { label: string; style: string }> = {
  practice:   { label: 'PRACTICE', style: '' },
  league:     { label: 'LEAGUE',   style: 'background:rgba(0,224,255,0.10); border-color:rgba(0,224,255,0.3); color:var(--accent-2)' },
  tournament: { label: 'TOURNEY',  style: 'background:rgba(255,46,110,0.10); border-color:var(--accent-line); color:var(--accent)' },
}

function formatDate(d: string) {
  const dt = new Date(d + 'T00:00:00')
  return {
    day: dt.toLocaleDateString('en-US', { day: 'numeric' }),
    mon: dt.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
  }
}

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
  return new Date(Number(y), Number(m) - 1, 1)
    .toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    .toUpperCase()
}
</script>

<template>
  <div class="sessions-root no-scrollbar">
    <!-- Status bar (mobile) -->
    <div class="status-bar rr-mono">
      <span>{{ new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }}</span>
      <span style="color:var(--text-2);">● ● ● ▮▮▮▮</span>
    </div>

    <!-- Header -->
    <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 16px 12px; flex-shrink:0;">
      <div class="rr-script rr-text-cyan" style="font-size:26px;">Sessions</div>
      <router-link to="/sessions/new" class="rr-btn rr-btn-primary" style="padding:8px 12px; font-size:10px;">＋ NEW</router-link>
    </div>

    <!-- Content -->
    <div class="sessions-scroll no-scrollbar">
      <div v-if="sessions.loading" class="rr-mono" style="font-size:11px; color:var(--text-3); text-align:center; padding:24px;">
        Loading sessions…
      </div>

      <div v-else-if="sessions.sessions.length === 0" class="rr-card" style="padding:24px; text-align:center;">
        <div class="rr-script rr-text-cyan" style="font-size:20px; margin-bottom:8px;">No sessions yet</div>
        <p style="font-size:12px; color:var(--text-2); margin-bottom:16px;">Start your first session to begin tracking.</p>
        <router-link to="/sessions/new" class="rr-btn rr-btn-primary">START SESSION →</router-link>
      </div>

      <div v-else>
        <div v-for="[key, group] in grouped" :key="key" style="margin-bottom:24px;">
          <div class="rr-marquee rr-text-pink" style="font-size:10px; padding:4px 0 10px; letter-spacing:0.08em;">
            ━━ {{ monthLabel(key) }} ━━
          </div>

          <div v-for="(s, i) in group" :key="s.id"
            class="rr-card"
            :style="i < group.length - 1 ? 'margin-bottom:8px;' : ''"
          >
            <router-link :to="`/sessions/${s.id}`" style="display:flex; align-items:center; gap:12px; text-decoration:none; padding:14px;">
              <!-- Date -->
              <div style="width:40px; text-align:center; flex-shrink:0; border-right:1px solid var(--line-soft); padding-right:10px;">
                <div class="rr-num rr-text-cyan" style="font-size:20px; line-height:1;">{{ formatDate(s.session_date).day }}</div>
                <div class="rr-mono" style="font-size:9px; color:var(--text-3); margin-top:2px;">{{ formatDate(s.session_date).mon }}</div>
              </div>
              <!-- Info -->
              <div style="flex:1; min-width:0;">
                <div class="rr-script" style="font-size:16px; color:var(--text-0); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                  {{ s.event_name || s.center_name || 'Session' }}
                </div>
                <div style="display:flex; gap:6px; margin-top:4px; flex-wrap:wrap; align-items:center;">
                  <span class="rr-chip" :style="eventChip[s.event_type]?.style || ''">
                    {{ eventChip[s.event_type]?.label || (s.event_type?.toUpperCase() || 'SESSION') }}
                  </span>
                  <span v-if="s.center_name" class="rr-mono" style="font-size:10px; color:var(--text-3);">{{ s.center_name }}</span>
                </div>
              </div>
              <!-- Score -->
              <div style="text-align:right; flex-shrink:0;">
                <div v-if="s.games?.some(g => g.final_score)">
                  <div class="rr-num rr-text-cyan" style="font-size:18px;">
                    {{ Math.max(...s.games.map(g => g.final_score || 0).filter(Boolean)) }}
                  </div>
                  <div class="rr-mono" style="font-size:9px; color:var(--text-3); text-transform:uppercase; letter-spacing:0.08em;">HIGH</div>
                </div>
                <span v-else style="font-size:18px; color:var(--text-3);">—</span>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sessions-root {
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

.sessions-scroll {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 0 16px 24px;
}

@media (min-width: 1024px) {
  .status-bar { display: none; }
  .sessions-scroll { padding: 0 28px 28px; }
}
</style>
