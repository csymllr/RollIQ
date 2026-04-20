<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useArsenalStore } from '@/stores/arsenal'
import { useBowlerStore } from '@/stores/bowler'
import TapButton from '@/components/TapButton.vue'

const route = useRoute()
const router = useRouter()
const arsenal = useArsenalStore()
const bowler = useBowlerStore()

const editId = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => !!editId.value)
const saving = ref(false)
const error = ref('')

const form = ref({
  brand: '',
  model: '',
  weight_lb: 15,
  cover_type: '',
  core_type: '',
  finish_surface: '',
  layout_text: '',
  role_tag: '' as 'benchmark' | 'strong_asym' | 'transition' | 'urethane' | 'spare' | 'other' | '',
  notes: '',
  status_active: true,
})

onMounted(async () => {
  await bowler.fetchMine()
  if (isEdit.value) {
    if (!arsenal.balls.length) await arsenal.fetchAll()
    const ball = arsenal.balls.find((b) => b.id === editId.value)
    if (ball) {
      form.value = {
        brand: ball.brand,
        model: ball.model,
        weight_lb: ball.weight_lb,
        cover_type: ball.cover_type ?? '',
        core_type: ball.core_type ?? '',
        finish_surface: ball.finish_surface ?? '',
        layout_text: ball.layout_text ?? '',
        role_tag: ball.role_tag ?? '',
        notes: ball.notes ?? '',
        status_active: ball.status_active,
      }
    }
  }
})

async function save() {
  if (!form.value.brand.trim() || !form.value.model.trim()) {
    error.value = 'Brand and model are required'
    return
  }
  error.value = ''
  saving.value = true
  const values = {
    brand: form.value.brand.trim(),
    model: form.value.model.trim(),
    weight_lb: form.value.weight_lb,
    cover_type: form.value.cover_type || null,
    core_type: form.value.core_type || null,
    finish_surface: form.value.finish_surface || null,
    layout_text: form.value.layout_text || null,
    role_tag: form.value.role_tag || null,
    notes: form.value.notes || null,
    status_active: form.value.status_active,
  }
  const { error: err } = isEdit.value
    ? await arsenal.update(editId.value!, values)
    : await arsenal.create(values)
  saving.value = false
  if (err) { error.value = err.message; return }
  router.push('/arsenal')
}
</script>

<template>
  <div class="p-4 pb-6 max-w-lg mx-auto">
    <div class="flex items-center gap-3 mb-6">
      <button @click="router.back()" class="tap-target text-slate-400 hover:text-white">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 class="text-xl font-bold text-white">{{ isEdit ? 'Edit Ball' : 'Add Ball' }}</h1>
    </div>

    <form @submit.prevent="save" class="space-y-4">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1">Brand *</label>
          <input v-model="form.brand" type="text" required placeholder="Storm, Roto Grip…"
            class="w-full rounded-lg bg-slate-800 border-slate-700 text-white placeholder-slate-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1">Model *</label>
          <input v-model="form.model" type="text" required placeholder="Phaze II…"
            class="w-full rounded-lg bg-slate-800 border-slate-700 text-white placeholder-slate-500" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1">Weight (lb) *</label>
          <input v-model.number="form.weight_lb" type="number" min="6" max="16" required
            class="w-full rounded-lg bg-slate-800 border-slate-700 text-white" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1">Role *</label>
          <select v-model="form.role_tag" class="w-full rounded-lg bg-slate-800 border-slate-700 text-white">
            <option value="">Select role</option>
            <option value="benchmark">Benchmark</option>
            <option value="strong_asym">Strong Asym</option>
            <option value="transition">Transition</option>
            <option value="urethane">Urethane</option>
            <option value="spare">Spare</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1">Cover Type</label>
          <input v-model="form.cover_type" type="text" placeholder="Hybrid Reactive…"
            class="w-full rounded-lg bg-slate-800 border-slate-700 text-white placeholder-slate-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1">Surface / Finish</label>
          <input v-model="form.finish_surface" type="text" placeholder="500 / 2000 / polish"
            class="w-full rounded-lg bg-slate-800 border-slate-700 text-white placeholder-slate-500" />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-300 mb-1">Layout</label>
        <input v-model="form.layout_text" type="text" placeholder="45×5×45"
          class="w-full rounded-lg bg-slate-800 border-slate-700 text-white placeholder-slate-500" />
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-300 mb-1">Notes</label>
        <textarea v-model="form.notes" rows="2" placeholder="Any notes about this ball…"
          class="w-full rounded-lg bg-slate-800 border-slate-700 text-white placeholder-slate-500 resize-none" />
      </div>

      <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>

      <TapButton type="submit" :loading="saving" class="w-full">
        {{ isEdit ? 'Save Changes' : 'Add Ball' }}
      </TapButton>
    </form>
  </div>
</template>
