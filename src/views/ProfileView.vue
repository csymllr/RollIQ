<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useBowlerStore } from '@/stores/bowler'
import TapButton from '@/components/TapButton.vue'

const bowler = useBowlerStore()
const saving = ref(false)
const saved = ref(false)
const error = ref('')
const showAdvanced = ref(false)

const form = ref({
  display_name: '',
  handedness: '' as 'right' | 'left' | '',
  style_type: '' as 'one_handed' | 'two_handed' | '',
  rev_profile: '',
  speed_profile: '',
  average_band: '',
  typical_miss: '',
  experience_level: '',
  pap: '',
  axis_tilt: '' as string,
  axis_rotation: '' as string,
})

onMounted(async () => {
  await bowler.fetchMine()
  if (bowler.profile) {
    const p = bowler.profile
    form.value = {
      display_name: p.display_name ?? '',
      handedness: p.handedness ?? '',
      style_type: p.style_type ?? '',
      rev_profile: p.rev_profile ?? '',
      speed_profile: p.speed_profile ?? '',
      average_band: p.average_band ?? '',
      typical_miss: p.typical_miss ?? '',
      experience_level: p.experience_level ?? '',
      pap: p.pap ?? '',
      axis_tilt: p.axis_tilt != null ? String(p.axis_tilt) : '',
      axis_rotation: p.axis_rotation != null ? String(p.axis_rotation) : '',
    }
  }
})

async function save() {
  if (!form.value.display_name.trim()) { error.value = 'Display name is required'; return }
  error.value = ''
  saving.value = true
  const { error: err } = await bowler.upsertMine({
    display_name: form.value.display_name.trim(),
    handedness: form.value.handedness || null,
    style_type: form.value.style_type || null,
    rev_profile: form.value.rev_profile || null,
    speed_profile: form.value.speed_profile || null,
    average_band: form.value.average_band || null,
    typical_miss: form.value.typical_miss || null,
    experience_level: form.value.experience_level || null,
    pap: form.value.pap || null,
    axis_tilt: form.value.axis_tilt ? parseFloat(form.value.axis_tilt) : null,
    axis_rotation: form.value.axis_rotation ? parseFloat(form.value.axis_rotation) : null,
  })
  saving.value = false
  if (err) { error.value = err.message; return }
  saved.value = true
  setTimeout(() => { saved.value = false }, 2000)
}
</script>

<template>
  <div class="p-4 pb-6 max-w-lg mx-auto">
    <h1 class="text-xl font-bold text-white mb-6">Bowler Profile</h1>

    <form @submit.prevent="save" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-slate-300 mb-1">Display Name *</label>
        <input v-model="form.display_name" type="text" required
          class="w-full rounded-lg bg-slate-800 border-slate-700 text-white" />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1">Handedness</label>
          <select v-model="form.handedness" class="w-full rounded-lg bg-slate-800 border-slate-700 text-white">
            <option value="">Unknown</option>
            <option value="right">Right</option>
            <option value="left">Left</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1">Style</label>
          <select v-model="form.style_type" class="w-full rounded-lg bg-slate-800 border-slate-700 text-white">
            <option value="">Unknown</option>
            <option value="one_handed">One-handed</option>
            <option value="two_handed">Two-handed</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1">Rev Profile</label>
          <input v-model="form.rev_profile" type="text" placeholder="e.g. Medium"
            class="w-full rounded-lg bg-slate-800 border-slate-700 text-white placeholder-slate-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1">Speed Profile</label>
          <input v-model="form.speed_profile" type="text" placeholder="e.g. 17–18 mph"
            class="w-full rounded-lg bg-slate-800 border-slate-700 text-white placeholder-slate-500" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1">Average Band</label>
          <input v-model="form.average_band" type="text" placeholder="e.g. 190–200"
            class="w-full rounded-lg bg-slate-800 border-slate-700 text-white placeholder-slate-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1">Typical Miss</label>
          <input v-model="form.typical_miss" type="text" placeholder="e.g. Left"
            class="w-full rounded-lg bg-slate-800 border-slate-700 text-white placeholder-slate-500" />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-300 mb-1">Experience Level</label>
        <select v-model="form.experience_level" class="w-full rounded-lg bg-slate-800 border-slate-700 text-white">
          <option value="">Not specified</option>
          <option value="recreational">Recreational</option>
          <option value="league">League</option>
          <option value="competitive">Competitive</option>
          <option value="tournament">Tournament</option>
          <option value="professional">Professional</option>
        </select>
      </div>

      <!-- Advanced fields toggle -->
      <button type="button" @click="showAdvanced = !showAdvanced"
        class="tap-target text-indigo-400 text-sm flex items-center gap-1">
        <svg class="w-4 h-4 transition-transform" :class="showAdvanced ? 'rotate-90' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        {{ showAdvanced ? 'Hide' : 'Show' }} advanced fields
      </button>

      <div v-if="showAdvanced" class="space-y-3 pt-1">
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1">PAP (Positive Axis Point)</label>
          <input v-model="form.pap" type="text" placeholder="e.g. 4⅝ over, ½ up"
            class="w-full rounded-lg bg-slate-800 border-slate-700 text-white placeholder-slate-500" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1">Axis Tilt (°)</label>
            <input v-model="form.axis_tilt" type="number" step="0.5" min="0" max="90" placeholder="0–90"
              class="w-full rounded-lg bg-slate-800 border-slate-700 text-white placeholder-slate-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1">Axis Rotation (°)</label>
            <input v-model="form.axis_rotation" type="number" step="5" min="0" max="90" placeholder="0–90"
              class="w-full rounded-lg bg-slate-800 border-slate-700 text-white placeholder-slate-500" />
          </div>
        </div>
      </div>

      <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>
      <p v-if="saved" class="text-green-400 text-sm">Saved!</p>

      <TapButton type="submit" :loading="saving" class="w-full">Save Profile</TapButton>
    </form>
  </div>
</template>
