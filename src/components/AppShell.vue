<script setup lang="ts">
import { useRoute } from 'vue-router'
import BottomNav from './BottomNav.vue'

const route = useRoute()
const hideNav = computed(() => !!route.meta.hideNav)

import { computed } from 'vue'
</script>

<template>
  <div class="flex flex-col h-full bg-slate-950 text-slate-100">
    <main class="flex-1 overflow-y-auto" :class="{ 'pb-16': !hideNav }">
      <router-view />
    </main>
    <BottomNav v-if="!hideNav" />
  </div>
</template>
