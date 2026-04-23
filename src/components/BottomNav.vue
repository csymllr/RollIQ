<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const tabs = [
  { to: '/dashboard', icon: '◉', label: 'PULSE' },
  { to: '/sessions',  icon: '▶', label: 'PLAY'  },
  { to: '/arsenal',   icon: '◐', label: 'GEAR'  },
  { to: '/analytics', icon: '△', label: 'STATS' },
  { to: '/profile',   icon: '≡', label: 'MORE'  },
]

function isActive(path: string) {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>

<template>
  <nav class="bottom-nav">
    <!-- Floating FAB -->
    <router-link to="/sessions/new" class="fab rr-marquee rr-glow-pink" aria-label="New session">＋</router-link>

    <router-link
      v-for="tab in tabs"
      :key="tab.to"
      :to="tab.to"
      class="nav-tab"
      :class="{ 'nav-tab-active': isActive(tab.to) }"
    >
      <span class="tab-icon">{{ tab.icon }}</span>
      <span class="tab-label rr-marquee">{{ tab.label }}</span>
    </router-link>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--sidebar-bg);
  border-top: 1px solid var(--accent-line);
  padding: 10px 8px calc(10px + env(safe-area-inset-bottom, 0px));
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  z-index: 50;
}

.fab {
  position: absolute;
  right: 16px;
  top: -26px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--accent);
  color: #FFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  text-decoration: none;
  box-shadow: var(--neon-glow-pink), 0 8px 24px rgba(255, 46, 110, 0.45);
  transition: filter 0.15s;
}
.fab:hover { filter: brightness(1.15); }

.nav-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  text-decoration: none;
  color: var(--text-3);
  transition: color 0.12s, text-shadow 0.12s;
  flex: 1;
  padding: 2px 0;
}

.nav-tab-active {
  color: var(--accent);
  text-shadow: var(--neon-glow-pink);
}

.tab-icon {
  font-size: 16px;
  line-height: 1;
}

.tab-label {
  font-size: 8px;
  letter-spacing: 0.08em;
}
</style>
