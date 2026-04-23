<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useBowlerStore } from '@/stores/bowler'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const bowler = useBowlerStore()

const navItems = [
  { icon: '◉', label: 'PULSE',    to: '/dashboard' },
  { icon: '▶', label: 'PLAY',     to: '/sessions' },
  { icon: '◐', label: 'ARSENAL',  to: '/arsenal' },
  { icon: '△', label: 'ANALYTICS',to: '/analytics' },
  { icon: '◎', label: 'MORE',     to: '/profile' },
]

function isActive(to: string) {
  return route.path === to || route.path.startsWith(to + '/')
}

async function signOut() {
  await auth.signOut()
  router.push('/login')
}

const initials = computed(() => {
  const name = bowler.profile?.display_name || auth.user?.email || 'U'
  return name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
})
</script>

<template>
  <aside class="sidebar no-scrollbar">
    <!-- Logo -->
    <div class="logo-wrap">
      <span class="rr-script rr-text-cyan" style="font-size: 32px; line-height: 1;">Roll</span>
      <span class="rr-script rr-text-pink" style="font-size: 32px; line-height: 1;">IQ</span>
    </div>

    <!-- Nav links -->
    <nav class="nav-links">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-item rr-marquee"
        :class="{ 'nav-item-active': isActive(item.to) }"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </router-link>
    </nav>

    <div style="flex: 1;" />

    <!-- Profile footer -->
    <div class="profile-row" style="border-top: 1px solid var(--line-soft); padding-top: 12px;">
      <div
        class="avatar rr-marquee rr-glow-pink"
        style="width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; color:#FFF; background: var(--grad-accent); flex-shrink:0;"
      >{{ initials }}</div>
      <div style="flex:1; min-width:0;">
        <div class="rr-script" style="font-size:14px; color:var(--text-0); line-height:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
          {{ bowler.profile?.display_name || auth.user?.email || 'Bowler' }}
        </div>
        <button
          class="rr-mono"
          style="font-size:10px; color:var(--text-3); margin-top:2px; background:none; border:none; cursor:pointer; padding:0; text-align:left;"
          @click="signOut"
        >sign out</button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  background: var(--sidebar-bg);
  border-right: 1px solid var(--line);
  padding: 20px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
  height: 100%;
}

.logo-wrap {
  padding: 0 6px 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
}

.nav-links {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--text-2);
  background: transparent;
  border: 1px solid transparent;
  text-decoration: none;
  transition: color 0.12s, background 0.12s;
}

.nav-item-active {
  background: var(--accent-dim);
  border-color: var(--accent-line);
  color: var(--accent);
  box-shadow: inset 0 0 12px rgba(255, 46, 110, 0.15);
}

.nav-icon {
  font-size: 13px;
  width: 16px;
  flex-shrink: 0;
}

.profile-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 6px 0;
  margin-top: 8px;
}
</style>
