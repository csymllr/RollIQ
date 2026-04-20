<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
}>()
</script>

<template>
  <button
    :type="type ?? 'button'"
    :disabled="disabled || loading"
    class="tap-target inline-flex items-center justify-center rounded-xl px-5 py-3 text-base font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50"
    :class="{
      'bg-indigo-600 hover:bg-indigo-500 text-white focus:ring-indigo-500': !variant || variant === 'primary',
      'bg-slate-700 hover:bg-slate-600 text-white focus:ring-slate-500': variant === 'secondary',
      'bg-transparent hover:bg-slate-800 text-slate-300 focus:ring-slate-500': variant === 'ghost',
      'bg-red-600 hover:bg-red-500 text-white focus:ring-red-500': variant === 'danger',
    }"
  >
    <slot />
    <span v-if="loading" class="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
  </button>
</template>
