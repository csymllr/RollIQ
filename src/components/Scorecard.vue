<script setup lang="ts">
import type { FrameResult } from '@/lib/scoring'

defineProps<{
  results: FrameResult[]
  currentFrame: number // 1-based
}>()
</script>

<template>
  <div class="overflow-x-auto">
    <div class="flex min-w-max border border-slate-700 rounded-xl overflow-hidden">
      <div v-for="(_, i) in 10" :key="i"
        class="flex flex-col border-r border-slate-700 last:border-r-0 transition-colors"
        :class="currentFrame === i + 1 ? 'bg-slate-700' : 'bg-slate-800'"
        :style="i === 9 ? 'min-width:72px' : 'min-width:52px'">
        <div class="text-center text-xs text-slate-500 py-0.5 border-b border-slate-700">{{ i + 1 }}</div>
        <div class="flex justify-end gap-0.5 px-1 pt-1 pb-0.5 text-xs font-mono min-h-[20px]"></div>
        <div class="text-center text-sm font-bold pb-1 min-h-[20px]"
          :class="results[i]?.cumulative != null ? 'text-white' : 'text-slate-600'">
          {{ results[i]?.cumulative ?? '' }}
        </div>
      </div>
    </div>
  </div>
</template>
