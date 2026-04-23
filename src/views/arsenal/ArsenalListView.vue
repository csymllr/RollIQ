<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useArsenalStore } from '@/stores/arsenal'
import { useBowlerStore } from '@/stores/bowler'

const arsenal = useArsenalStore()
const bowler = useBowlerStore()
const router = useRouter()
const showAll = ref(false)

const roleLabel: Record<string, string> = {
  benchmark:   'BENCHMARK',
  strong_asym: 'STRONG ASYM',
  transition:  'TRANSITION',
  urethane:    'URETHANE',
  spare:       'SPARE',
  other:       'OTHER',
}

onMounted(async () => {
  await bowler.fetchMine()
  await arsenal.fetchAll()
})

const displayBalls = computed(() => {
  const balls = arsenal.activeBalls()
  if (showAll.value) return balls
  return balls.filter((b) => b.in_bag)
})

const inBagCount = computed(() => arsenal.activeBalls().filter((b) => b.in_bag).length)
const allCount = computed(() => arsenal.activeBalls().length)

// Fallback color map by role
const roleColor: Record<string, string> = {
  benchmark:   '#FF2E6E',
  strong_asym: '#00E0FF',
  transition:  '#FFD83D',
  urethane:    '#B8A88A',
  spare:       '#8A4BE8',
  other:       '#6E5F75',
}

function ballColor(ball: { role_tag?: string | null }) {
  return roleColor[ball.role_tag || ''] || '#FF2E6E'
}
</script>

<template>
  <div class="arsenal-root no-scrollbar">
    <!-- Status bar (mobile) -->
    <div class="status-bar rr-mono">
      <span>{{ new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }}</span>
      <span style="color:var(--text-2);">● ● ● ▮▮▮▮</span>
    </div>

    <!-- Header -->
    <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 16px 12px; flex-shrink:0;">
      <div class="rr-script rr-text-pink" style="font-size:26px;">The Arsenal</div>
      <router-link to="/arsenal/new" class="rr-btn rr-btn-primary" style="padding:8px 12px; font-size:10px;">＋ ADD</router-link>
    </div>

    <!-- Content -->
    <div class="arsenal-scroll no-scrollbar">
      <!-- In-bag / All toggle -->
      <div class="seg-control">
        <button
          class="rr-marquee seg-item"
          :class="{ 'seg-active': !showAll }"
          @click="showAll = false"
        >IN BAG ({{ inBagCount }})</button>
        <button
          class="rr-marquee seg-item"
          :class="{ 'seg-active': showAll }"
          @click="showAll = true"
        >ALL ({{ allCount }})</button>
      </div>

      <!-- Loading -->
      <div v-if="arsenal.loading" class="rr-mono" style="font-size:11px; color:var(--text-3); text-align:center; padding:24px;">
        Loading arsenal…
      </div>

      <!-- Empty -->
      <div v-else-if="displayBalls.length === 0" class="rr-card" style="padding:24px; text-align:center; margin-top:12px;">
        <div class="rr-script rr-text-cyan" style="font-size:20px; margin-bottom:8px;">No balls here yet</div>
        <p style="font-size:12px; color:var(--text-2); margin-bottom:16px;">
          {{ showAll ? 'Add your first ball to your arsenal.' : 'Mark balls as "in bag" from the All view.' }}
        </p>
        <router-link v-if="showAll" to="/arsenal/new" class="rr-btn rr-btn-primary">＋ ADD BALL</router-link>
        <button v-else class="rr-btn rr-btn-ghost" @click="showAll = true">VIEW ALL →</button>
      </div>

      <!-- Ball cards -->
      <div v-else>
        <div
          v-for="ball in displayBalls"
          :key="ball.id"
          class="rr-card ball-card"
          :style="!ball.in_bag && showAll ? 'opacity:0.55;' : ''"
        >
          <!-- Ball row -->
          <div style="display:flex; align-items:center; gap:12px;">
            <!-- Avatar -->
            <div class="ball-avatar"
              :style="`background:radial-gradient(circle at 30% 30%, ${ballColor(ball)}, ${ballColor(ball)}33 70%); border:1px solid ${ballColor(ball)}; box-shadow:0 0 12px ${ballColor(ball)}66;`"
              @click="router.push(`/arsenal/${ball.id}`)"
            />
            <!-- Info -->
            <div style="flex:1; min-width:0; cursor:pointer;" @click="router.push(`/arsenal/${ball.id}`)">
              <div style="display:flex; justify-content:space-between; align-items:baseline; gap:8px;">
                <span class="rr-script" style="font-size:17px; color:var(--text-0); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                  {{ ball.brand }} {{ ball.model }}
                </span>
                <span class="rr-mono" style="font-size:11px; color:var(--text-3); flex-shrink:0;">
                  {{ ball.weight_lb ? ball.weight_lb + ' LB' : '' }}
                </span>
              </div>
              <div style="display:flex; gap:6px; margin-top:4px; flex-wrap:wrap; align-items:center;">
                <span class="rr-chip"
                  :style="`background:${ballColor(ball)}22; border-color:${ballColor(ball)}66; color:${ballColor(ball)};`">
                  {{ roleLabel[ball.role_tag || ''] || 'BALL' }}
                </span>
                <span v-if="ball.weight_lb" class="rr-chip">{{ ball.weight_lb }} LB</span>
              </div>
            </div>
          </div>

          <!-- Specs row -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:12px; padding-top:10px; border-top:1px solid var(--line-soft);">
            <div>
              <div class="rr-mono" style="font-size:9px; color:var(--text-3); text-transform:uppercase; letter-spacing:0.08em;">LAYOUT</div>
              <div class="rr-mono" style="font-size:11px; color:var(--text-1); margin-top:2px;">{{ ball.layout_text || '—' }}</div>
            </div>
            <div>
              <div class="rr-mono" style="font-size:9px; color:var(--text-3); text-transform:uppercase; letter-spacing:0.08em;">SURFACE</div>
              <div class="rr-mono" style="font-size:11px; color:var(--text-1); margin-top:2px;">{{ ball.finish_surface || '—' }}</div>
            </div>
          </div>

          <!-- Actions -->
          <div style="display:flex; gap:8px; margin-top:10px;">
            <button class="rr-btn rr-btn-ghost" style="flex:1; padding:7px; font-size:9px;" @click="router.push(`/arsenal/${ball.id}/edit`)">EDIT</button>
            <button class="rr-btn" style="flex:1; padding:7px; font-size:9px;"
              :style="ball.in_bag ? 'background:var(--accent-dim); border-color:var(--accent-line); color:var(--accent);' : 'background:var(--bg-2); border-color:var(--line); color:var(--text-2);'"
              @click="arsenal.toggleInBag(ball.id)"
            >{{ ball.in_bag ? '◉ IN BAG' : '○ ADD TO BAG' }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.arsenal-root {
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

.arsenal-scroll {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 0 16px 24px;
}

.seg-control {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  padding: 4px;
  background: var(--bg-1);
  border: 1px solid var(--line);
  border-radius: 6px;
  margin-bottom: 14px;
}

.seg-item {
  padding: 8px;
  text-align: center;
  border-radius: 4px;
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--text-2);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.12s, color 0.12s, box-shadow 0.12s;
}

.seg-active {
  background: var(--accent);
  color: #FFF;
  box-shadow: var(--neon-glow-pink);
}

.ball-card {
  padding: 14px;
  margin-bottom: 10px;
}

.ball-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  flex-shrink: 0;
  cursor: pointer;
}

@media (min-width: 1024px) {
  .status-bar { display: none; }
  .arsenal-scroll { padding: 0 28px 28px; }
}
</style>
