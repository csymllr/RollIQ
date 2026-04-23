<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BottomNav from './BottomNav.vue'
import RetroSidebar from './RetroSidebar.vue'

const route = useRoute()
const hideNav = computed(() => !!route.meta.hideNav)
</script>

<template>
  <div data-theme="retro-dark" class="retro-shell">
    <!-- Desktop: sidebar + content -->
    <div class="retro-desktop-layout">
      <RetroSidebar v-if="!hideNav" />
      <main class="retro-main-desktop no-scrollbar">
        <router-view />
      </main>
    </div>

    <!-- Mobile: content + bottom nav -->
    <div class="retro-mobile-layout">
      <main class="retro-main-mobile no-scrollbar" :class="{ 'pb-[86px]': !hideNav }">
        <router-view />
      </main>
      <BottomNav v-if="!hideNav" />
    </div>
  </div>
</template>

<style scoped>
.retro-shell {
  width: 100%;
  height: 100%;
  background: var(--bg-0);
  color: var(--text-1);
  font-family: 'Inter', -apple-system, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  position: relative;
  overflow: hidden;
}

/* Desktop layout — hidden on mobile */
.retro-desktop-layout {
  display: none;
  height: 100%;
}

/* Mobile layout — shown on mobile */
.retro-mobile-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.retro-main-desktop {
  overflow-y: auto;
  height: 100%;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.retro-main-desktop::-webkit-scrollbar { display: none; }

.retro-main-mobile {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

@media (min-width: 1024px) {
  .retro-desktop-layout {
    display: grid;
    grid-template-columns: 236px 1fr;
  }
  .retro-mobile-layout {
    display: none;
  }
}
</style>
