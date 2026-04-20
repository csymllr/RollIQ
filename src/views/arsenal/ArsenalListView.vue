<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useArsenalStore } from '@/stores/arsenal'
import { useBowlerStore } from '@/stores/bowler'

const arsenal = useArsenalStore()
const bowler = useBowlerStore()
const router = useRouter()
const menuOpenId = ref<string | null>(null)

const roleTags: Record<string, string> = {
  benchmark: 'Benchmark',
  strong_asym: 'Strong Asym',
  transition: 'Transition',
  urethane: 'Urethane',
  spare: 'Spare',
  other: 'Other',
}

const tagColors: Record<string, string> = {
  benchmark: 'bg-indigo-700 text-indigo-100',
  strong_asym: 'bg-red-800 text-red-100',
  transition: 'bg-amber-700 text-amber-100',
  urethane: 'bg-teal-700 text-teal-100',
  spare: 'bg-slate-600 text-slate-100',
  other: 'bg-slate-700 text-slate-200',
}

onMounted(async () => {
  await bowler.fetchMine()
  await arsenal.fetchAll()
})

async function deactivate(id: string) {
  await arsenal.softDeactivate(id)
  menuOpenId.value = null
}

function toggleMenu(id: string) {
  menuOpenId.value = menuOpenId.value === id ? null : id
}
</script>

<template>
  <div class="p-4 pb-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-bold text-white">My Arsenal</h1>
      <router-link to="/arsenal/new"
        class="tap-target inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl px-4 py-2">
        + Add Ball
      </router-link>
    </div>

    <div v-if="arsenal.loading" class="text-slate-400 text-sm">Loading…</div>

    <div v-else-if="arsenal.activeBalls().length === 0" class="text-slate-400 text-sm">
      No balls in your arsenal yet. Add your first one above.
    </div>

    <div v-else class="space-y-3">
      <div v-for="ball in arsenal.activeBalls()" :key="ball.id"
        class="bg-slate-800 rounded-2xl p-4 flex items-start justify-between">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-semibold text-white">{{ ball.brand }} {{ ball.model }}</span>
            <span v-if="ball.role_tag"
              class="text-xs font-medium px-2 py-0.5 rounded-full"
              :class="tagColors[ball.role_tag] ?? tagColors['other']">
              {{ roleTags[ball.role_tag] ?? ball.role_tag }}
            </span>
          </div>
          <p class="text-slate-400 text-sm mt-0.5">{{ ball.weight_lb }} lb
            <span v-if="ball.cover_type"> · {{ ball.cover_type }}</span>
            <span v-if="ball.finish_surface"> · {{ ball.finish_surface }}</span>
          </p>
          <p v-if="ball.layout_text" class="text-slate-500 text-xs mt-0.5">{{ ball.layout_text }}</p>
        </div>

        <div class="relative ml-2">
          <button @click="toggleMenu(ball.id)"
            class="tap-target w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white rounded-lg">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          <div v-if="menuOpenId === ball.id"
            class="absolute right-0 mt-1 w-36 bg-slate-700 rounded-xl shadow-xl py-1 z-10">
            <button @click="router.push(`/arsenal/${ball.id}/edit`)"
              class="tap-target w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-600">
              Edit
            </button>
            <button @click="deactivate(ball.id)"
              class="tap-target w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-600">
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
