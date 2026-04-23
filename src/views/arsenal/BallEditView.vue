<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useArsenalStore } from '@/stores/arsenal'
import { useBowlerStore } from '@/stores/bowler'
import TapButton from '@/components/TapButton.vue'
import { ballCatalog } from '@/data/ballCatalog'
import { useFetchBallSpecs } from '@/composables/useFetchBallSpecs'

const route = useRoute()
const router = useRouter()
const arsenal = useArsenalStore()
const bowler = useBowlerStore()
const { fetching: fetchingSpecs, fetchError: specsError, fetchSpecs } = useFetchBallSpecs()

const editId = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => !!editId.value)
const saving = ref(false)
const error = ref('')

const brandModels = computed(() => ballCatalog[form.value.brand] ?? [])

const isNotInCatalog = computed(() => {
  const b = form.value.brand.trim()
  const m = form.value.model.trim()
  if (!b || !m) return false
  const entries = ballCatalog[b] ?? []
  return !entries.some((e) => e.model.toLowerCase() === m.toLowerCase())
})

function onModelChange() {
  const entry = brandModels.value.find((b) => b.model === form.value.model)
  if (!entry) return
  if (!form.value.cover_type)     form.value.cover_type     = entry.cover_type     ?? ''
  if (!form.value.role_tag)       form.value.role_tag       = entry.role_tag       ?? ''
  if (!form.value.finish_surface) form.value.finish_surface = entry.finish_surface ?? ''
}

async function fetchAndPopulate() {
  const specs = await fetchSpecs(form.value.brand.trim(), form.value.model.trim())
  if (!specs) return
  if (specs.cover_type)     form.value.cover_type     = specs.cover_type
  if (specs.core_type)      form.value.core_type      = specs.core_type
  if (specs.finish_surface) form.value.finish_surface = specs.finish_surface
  if (specs.role_tag)       form.value.role_tag       = specs.role_tag
}

type LayoutSystem = 'storm' | 'dual-angle' | 'custom'
type HandStyle   = '1H' | '2H'
interface LayoutPreset { label: string; value: string; desc: string }

const layoutSystem = ref<LayoutSystem>('storm')
const layoutHand   = ref<HandStyle>('1H')

const stormPresets: LayoutPreset[] = [
  { label: '3×4.5×2',  value: '3×4.5×2',  desc: 'Very strong / high flare'            },
  { label: '4×4×1',    value: '4×4×1',    desc: 'Strong midlane / controlled backend'  },
  { label: '4.5×3×2',  value: '4.5×3×2',  desc: 'Strong benchmark / early midlane'    },
  { label: '5×4×2',    value: '5×4×2',    desc: 'Universal benchmark'                  },
  { label: '5×5×4',    value: '5×5×4',    desc: 'Clean front / smooth downlane'        },
  { label: '6×5×3',    value: '6×5×3',    desc: 'Weak / max length'                    },
  { label: '2×6×1',    value: '2×6×1',    desc: 'Low RG control / difficult lanes'     },
]

const dualAnglePresets: Record<HandStyle, LayoutPreset[]> = {
  '1H': [
    { label: '45°×5×45°', value: '45°×5×45°', desc: 'Control'       },
    { label: '45°×4×45°', value: '45°×4×45°', desc: 'Length / clean' },
    { label: '50°×5×50°', value: '50°×5×50°', desc: 'Benchmark'      },
    { label: '55°×5×55°', value: '55°×5×55°', desc: 'Mid hook'       },
    { label: '60°×5×60°', value: '60°×5×60°', desc: 'Strong hook'    },
    { label: '65°×5×60°', value: '65°×5×60°', desc: 'Strong / angular'},
    { label: '70°×5×65°', value: '70°×5×65°', desc: 'Max hook'       },
  ],
  '2H': [
    { label: '50°×4.5×45°', value: '50°×4.5×45°', desc: 'Control'    },
    { label: '60°×4.5×45°', value: '60°×4.5×45°', desc: 'Benchmark'  },
    { label: '70°×4.5×45°', value: '70°×4.5×45°', desc: 'Mid hook'   },
    { label: '80°×4.5×45°', value: '80°×4.5×45°', desc: 'Strong hook'},
    { label: '90°×4.5×45°', value: '90°×4.5×45°', desc: 'Max hook'   },
  ],
}

const activePresets = computed<LayoutPreset[]>(() => {
  if (layoutSystem.value === 'storm')       return stormPresets
  if (layoutSystem.value === 'dual-angle')  return dualAnglePresets[layoutHand.value]
  return []
})

function selectLayout(value: string) {
  form.value.layout_text = value
}

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
          <input v-model="form.brand" type="text" list="brand-list" required placeholder="Storm, Roto Grip…"
            class="w-full rounded-lg bg-slate-800 border-slate-700 text-white placeholder-slate-500" />
          <datalist id="brand-list">
            <option value="900 Global" />
            <option value="Brunswick" />
            <option value="Columbia 300" />
            <option value="DV8" />
            <option value="Ebonite" />
            <option value="Hammer" />
            <option value="Lane #1" />
            <option value="Motiv" />
            <option value="Pyramid" />
            <option value="Radical" />
            <option value="Roto Grip" />
            <option value="Storm" />
            <option value="Track" />
          </datalist>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1">Model *</label>
          <input v-model="form.model" type="text" list="model-list" required placeholder="Phaze II…"
            @change="onModelChange"
            class="w-full rounded-lg bg-slate-800 border-slate-700 text-white placeholder-slate-500" />
          <datalist id="model-list">
            <option v-for="ball in brandModels" :key="ball.model" :value="ball.model" />
          </datalist>
        </div>
      </div>

      <!-- AI spec lookup — shown when brand+model are set but not in our seeded catalog -->
      <div v-if="isNotInCatalog" class="flex items-center gap-3 -mt-1">
        <button type="button" @click="fetchAndPopulate" :disabled="fetchingSpecs"
          class="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 disabled:opacity-50 transition-colors">
          <svg v-if="!fetchingSpecs" class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          <svg v-else class="w-4 h-4 shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ fetchingSpecs ? 'Finding specs…' : 'Find specs with AI' }}
        </button>
        <span v-if="specsError" class="text-xs text-red-400">{{ specsError }}</span>
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
          <select v-model="form.cover_type" class="w-full rounded-lg bg-slate-800 border-slate-700 text-white">
            <option value="">Select cover</option>
            <option value="Solid Reactive">Solid Reactive</option>
            <option value="Pearl Reactive">Pearl Reactive</option>
            <option value="Hybrid Reactive">Hybrid Reactive</option>
            <option value="Urethane">Urethane</option>
            <option value="Polyester">Polyester</option>
            <option value="Particle">Particle</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1">Surface / Finish</label>
          <input v-model="form.finish_surface" type="text" placeholder="500 / 2000 / polish"
            class="w-full rounded-lg bg-slate-800 border-slate-700 text-white placeholder-slate-500" />
        </div>
      </div>

      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="text-sm font-medium text-slate-300">Layout</label>
          <!-- System toggle -->
          <div class="flex rounded-lg overflow-hidden border border-slate-700 text-xs">
            <button type="button" @click="layoutSystem = 'storm'"
              :class="layoutSystem === 'storm' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'"
              class="px-3 py-1 transition-colors">Storm</button>
            <button type="button" @click="layoutSystem = 'dual-angle'"
              :class="layoutSystem === 'dual-angle' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'"
              class="px-3 py-1 transition-colors">Dual Angle</button>
            <button type="button" @click="layoutSystem = 'custom'"
              :class="layoutSystem === 'custom' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'"
              class="px-3 py-1 transition-colors">Custom</button>
          </div>
        </div>

        <!-- 1H / 2H toggle — only for Dual Angle -->
        <div v-if="layoutSystem === 'dual-angle'" class="flex gap-2 mb-2">
          <button type="button" @click="layoutHand = '1H'"
            :class="layoutHand === '1H' ? 'bg-slate-600 text-white border-slate-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'"
            class="px-3 py-1 rounded-md border text-xs transition-colors">1H</button>
          <button type="button" @click="layoutHand = '2H'"
            :class="layoutHand === '2H' ? 'bg-slate-600 text-white border-slate-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'"
            class="px-3 py-1 rounded-md border text-xs transition-colors">2H</button>
        </div>

        <!-- Preset chips -->
        <div v-if="layoutSystem !== 'custom'" class="flex flex-wrap gap-2 mb-2">
          <button v-for="preset in activePresets" :key="preset.value" type="button"
            @click="selectLayout(preset.value)"
            :class="form.layout_text === preset.value ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'"
            class="px-2.5 py-1 rounded-md border text-xs transition-colors text-left">
            <div class="font-mono font-semibold">{{ preset.label }}</div>
            <div class="text-[10px] leading-tight" :class="form.layout_text === preset.value ? 'text-blue-200' : 'text-slate-400'">{{ preset.desc }}</div>
          </button>
        </div>

        <input v-model="form.layout_text" type="text"
          :placeholder="layoutSystem === 'custom' ? 'Enter layout…' : 'or type a custom layout…'"
          class="w-full rounded-lg bg-slate-800 border-slate-700 text-white placeholder-slate-500 text-sm" />
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
