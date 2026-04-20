<script setup lang="ts">
import { useRoute } from 'vue-router'
const route = useRoute()

const tabs = [
  { to: '/dashboard', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/sessions', label: 'Sessions', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { to: '/arsenal', label: 'Arsenal', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
  { to: '/profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
]

function isActive(path: string) {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>

<template>
  <nav class="fixed bottom-0 inset-x-0 bg-slate-900 border-t border-slate-800 safe-area-pb z-50">
    <div class="flex">
      <router-link
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="flex-1 flex flex-col items-center justify-center tap-target py-2 text-xs transition-colors"
        :class="isActive(tab.to) ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'"
      >
        <svg class="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" :d="tab.icon" />
        </svg>
        <span>{{ tab.label }}</span>
      </router-link>
    </div>
  </nav>
</template>
