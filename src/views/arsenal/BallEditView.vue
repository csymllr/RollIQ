<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useArsenalStore } from '@/stores/arsenal'
import type { PerfCategory, RoleTag } from '@/stores/arsenal'
import { useBowlerStore } from '@/stores/bowler'
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
  // Correct brand if AI identified a different canonical manufacturer
  if (specs.canonical_brand && specs.canonical_brand !== form.value.brand) {
    form.value.brand = specs.canonical_brand
  }
  // Always overwrite all spec fields so a corrected brand/model does a full replace
  form.value.cover_type      = specs.cover_type      ?? ''
  form.value.cover_name      = specs.cover_name      ?? ''
  form.value.core_type       = specs.core_type       ?? ''
  form.value.finish_surface  = specs.finish_surface  ?? ''
  form.value.perf_category   = specs.perf_category   ?? ''
  form.value.role_tag        = specs.role_tag        ?? ''
  form.value.rg              = specs.rg              ?? null
  form.value.differential    = specs.differential    ?? null
  form.value.mass_bias       = specs.mass_bias       ?? null
  form.value.flare_potential = specs.flare_potential ?? ''
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
  cover_name: '',
  core_type: '',
  finish_surface: '',
  layout_text: '',
  perf_category: '' as PerfCategory | '',
  role_tag: '' as RoleTag | '',
  rg: null as number | null,
  differential: null as number | null,
  mass_bias: null as number | null,
  flare_potential: '',
  notes: '',
  status_active: true,
})

const usedLayouts = computed(() =>
  [...new Set(arsenal.balls.map((b) => b.layout_text).filter(Boolean))] as string[]
)

onMounted(async () => {
  await bowler.fetchMine()
  if (!arsenal.balls.length) await arsenal.fetchAll()
  if (isEdit.value) {
    const ball = arsenal.balls.find((b) => b.id === editId.value)
    if (ball) {
      form.value = {
        brand:          ball.brand,
        model:          ball.model,
        weight_lb:      ball.weight_lb,
        cover_type:     ball.cover_type     ?? '',
        cover_name:     ball.cover_name     ?? '',
        core_type:      ball.core_type      ?? '',
        finish_surface: ball.finish_surface ?? '',
        layout_text:    ball.layout_text    ?? '',
        perf_category:  ball.perf_category  ?? '',
        role_tag:       ball.role_tag       ?? '',
        rg:             ball.rg             ?? null,
        differential:   ball.differential   ?? null,
        mass_bias:      ball.mass_bias      ?? null,
        flare_potential: ball.flare_potential ?? '',
        notes:          ball.notes          ?? '',
        status_active:  ball.status_active,
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
    brand:           form.value.brand.trim(),
    model:           form.value.model.trim(),
    weight_lb:       form.value.weight_lb,
    cover_type:      form.value.cover_type      || null,
    cover_name:      form.value.cover_name      || null,
    core_type:       form.value.core_type       || null,
    finish_surface:  form.value.finish_surface  || null,
    layout_text:     form.value.layout_text     || null,
    perf_category:   form.value.perf_category   || null,
    role_tag:        form.value.role_tag        || null,
    rg:              form.value.rg              ?? null,
    differential:    form.value.differential    ?? null,
    mass_bias:       form.value.mass_bias       ?? null,
    flare_potential: form.value.flare_potential || null,
    notes:           form.value.notes           || null,
    status_active:   form.value.status_active,
  }
  const { error: err } = isEdit.value
    ? await arsenal.update(editId.value!, values)
    : await arsenal.create(values)
  saving.value = false
  if (err) { error.value = err.message; return }
  router.push('/arsenal')
}

const now = new Date()
</script>

<template>
  <div class="screen-root no-scrollbar" style="background: var(--bg-0); min-height: 100%; display: flex; flex-direction: column;">

    <!-- Status bar -->
    <div class="rr-mono" style="display: flex; justify-content: space-between; padding: 10px 20px 4px; font-size: 12px; color: var(--text-1); font-weight: 600; flex-shrink: 0;">
      <span>{{ now.getHours() }}:{{ String(now.getMinutes()).padStart(2,'0') }}</span>
      <span style="color: var(--text-2);">● ● ● ▮▮▮▮</span>
    </div>

    <!-- Header -->
    <div class="between" style="padding: 10px 16px 12px; border-bottom: 1px solid var(--line); flex-shrink: 0;">
      <button @click="router.back()"
        style="color: var(--text-2); font-size: 22px; background: none; border: none; cursor: pointer; line-height: 1; padding: 0 4px;">×</button>
      <div class="rr-script rr-text-cyan" style="font-size: 22px;">{{ isEdit ? 'Edit Ball' : 'Add Ball' }}</div>
      <div style="width: 32px;"/>
    </div>

    <!-- Scrollable form content -->
    <div style="flex: 1; overflow-y: auto; padding: 16px 16px 100px;" class="no-scrollbar">
      <form @submit.prevent="save">

        <!-- Brand & Model -->
        <div class="rr-marquee rr-text-pink" style="font-size: 10px; margin-bottom: 8px;">BRAND & MODEL</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px;">
          <div>
            <div class="rr-mono" style="font-size: 10px; color: var(--text-3); margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.10em;">Brand *</div>
            <input v-model="form.brand" type="text" list="brand-list" required placeholder="Storm, Roto Grip…"
              class="retro-input" style="width: 100%; box-sizing: border-box;" />
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
            <div class="rr-mono" style="font-size: 10px; color: var(--text-3); margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.10em;">Model *</div>
            <input v-model="form.model" type="text" list="model-list" required placeholder="Phaze II…"
              @change="onModelChange"
              class="retro-input" style="width: 100%; box-sizing: border-box;" />
            <datalist id="model-list">
              <option v-for="ball in brandModels" :key="ball.model" :value="ball.model" />
            </datalist>
          </div>
        </div>

        <!-- AI spec lookup — always visible when brand + model are filled -->
        <div v-if="form.brand.trim() && form.model.trim()" style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px; flex-wrap: wrap;">
          <button type="button" @click="fetchAndPopulate" :disabled="fetchingSpecs"
            class="rr-btn rr-btn-ghost" style="padding: 8px 12px; font-size: 10px;">
            {{ fetchingSpecs ? '✦ FINDING SPECS…' : '✦ FILL SPECS WITH AI' }}
          </button>
          <span v-if="specsError" class="rr-mono" style="font-size: 10px; color: var(--danger);">{{ specsError }}</span>
          <span v-if="!specsError && !fetchingSpecs" class="rr-mono" style="font-size: 9px; color: var(--text-3);">auto-fills cover, core, RG, diff &amp; type</span>
        </div>

        <!-- Weight, Equip Type & Bag Role -->
        <div class="rr-marquee rr-text-cyan" style="font-size: 10px; margin-bottom: 8px;">WEIGHT & CLASSIFICATION</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <div class="rr-mono" style="font-size: 10px; color: var(--text-3); margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.10em;">Weight (lb)</div>
            <input v-model.number="form.weight_lb" type="number" min="6" max="16" required
              class="retro-input" style="width: 100%; box-sizing: border-box;" />
          </div>
          <div>
            <div class="rr-mono" style="font-size: 10px; color: var(--text-3); margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.10em;">Equip Type</div>
            <select v-model="form.perf_category" class="retro-input" style="width: 100%; box-sizing: border-box;">
              <option value="">Select type</option>
              <option value="strong_asym">Strong Asym</option>
              <option value="strong_solid">Strong Solid</option>
              <option value="strong_pearl">Strong Pearl</option>
              <option value="strong_hybrid">Strong Hybrid</option>
              <option value="mid_solid">Mid Solid</option>
              <option value="mid_pearl">Mid Pearl</option>
              <option value="mid_hybrid">Mid Hybrid</option>
              <option value="entry">Entry</option>
              <option value="urethane">Urethane</option>
              <option value="spare">Spare / Plastic</option>
            </select>
          </div>
        </div>
        <div style="margin-bottom: 16px;">
          <div class="rr-mono" style="font-size: 10px; color: var(--text-3); margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.10em;">Bag Role <span style="font-size: 9px; opacity: 0.6;">— how you use it</span></div>
          <select v-model="form.role_tag" class="retro-input" style="width: 100%; box-sizing: border-box;">
            <option value="">Select role</option>
            <option value="benchmark">Benchmark</option>
            <option value="strong_asym">Strong Asym</option>
            <option value="transition">Transition</option>
            <option value="urethane">Urethane</option>
            <option value="spare">Spare</option>
            <option value="other">Other</option>
          </select>
        </div>

        <!-- Cover & Surface -->
        <div class="rr-marquee rr-text-pink" style="font-size: 10px; margin-bottom: 8px;">COVER & SURFACE</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div>
            <div class="rr-mono" style="font-size: 10px; color: var(--text-3); margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.10em;">Cover Type</div>
            <select v-model="form.cover_type" class="retro-input" style="width: 100%; box-sizing: border-box;">
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
            <div class="rr-mono" style="font-size: 10px; color: var(--text-3); margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.10em;">Cover Stock Name</div>
            <input v-model="form.cover_name" type="text" placeholder="R2S Pearl, NRG Hybrid…"
              class="retro-input" style="width: 100%; box-sizing: border-box;" />
          </div>
        </div>
        <div style="margin-bottom: 16px;">
          <div class="rr-mono" style="font-size: 10px; color: var(--text-3); margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.10em;">Surface / Finish</div>
          <input v-model="form.finish_surface" type="text" placeholder="500 / 2000 / polish"
            class="retro-input" style="width: 100%; box-sizing: border-box;" />
        </div>

        <!-- Core Specs -->
        <div class="rr-marquee rr-text-cyan" style="font-size: 10px; margin-bottom: 8px;">CORE SPECS</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px;">
          <div>
            <div class="rr-mono" style="font-size: 10px; color: var(--text-3); margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.10em;">RG</div>
            <input v-model.number="form.rg" type="number" step="0.001" min="2" max="3" placeholder="2.47"
              class="retro-input" style="width: 100%; box-sizing: border-box;" />
          </div>
          <div>
            <div class="rr-mono" style="font-size: 10px; color: var(--text-3); margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.10em;">Differential</div>
            <input v-model.number="form.differential" type="number" step="0.001" min="0" max="0.1" placeholder="0.050"
              class="retro-input" style="width: 100%; box-sizing: border-box;" />
          </div>
          <div>
            <div class="rr-mono" style="font-size: 10px; color: var(--text-3); margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.10em;">Mass Bias</div>
            <input v-model.number="form.mass_bias" type="number" step="0.001" min="0" max="0.1" placeholder="0.018"
              class="retro-input" style="width: 100%; box-sizing: border-box;" />
          </div>
          <div>
            <div class="rr-mono" style="font-size: 10px; color: var(--text-3); margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.10em;">Flare Potential</div>
            <select v-model="form.flare_potential" class="retro-input" style="width: 100%; box-sizing: border-box;">
              <option value="">Select</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="Medium-High">Medium-High</option>
              <option value="High">High</option>
              <option value="Very High">Very High</option>
            </select>
          </div>
        </div>

        <!-- Layout -->
        <div class="between" style="margin-bottom: 10px;">
          <div class="rr-marquee rr-text-cyan" style="font-size: 10px;">LAYOUT</div>
          <!-- Preset mode: full toggle -->
          <div v-if="layoutSystem !== 'custom'" style="display: flex; border-radius: 4px; overflow: hidden; border: 1px solid var(--line);">
            <button type="button" @click="layoutSystem = 'storm'"
              :style="{
                padding: '5px 10px', fontFamily: 'Bungee, sans-serif', fontSize: '9px', cursor: 'pointer', border: 'none',
                background: layoutSystem === 'storm' ? 'var(--accent)' : 'var(--bg-1)',
                color: layoutSystem === 'storm' ? '#FFF' : 'var(--text-2)',
                boxShadow: layoutSystem === 'storm' ? 'var(--neon-glow-pink)' : 'none',
              }">STORM</button>
            <button type="button" @click="layoutSystem = 'dual-angle'"
              :style="{
                padding: '5px 10px', fontFamily: 'Bungee, sans-serif', fontSize: '9px', cursor: 'pointer', border: 'none',
                background: layoutSystem === 'dual-angle' ? 'var(--accent)' : 'var(--bg-1)',
                color: layoutSystem === 'dual-angle' ? '#FFF' : 'var(--text-2)',
                boxShadow: layoutSystem === 'dual-angle' ? 'var(--neon-glow-pink)' : 'none',
              }">DUAL ANG</button>
            <button type="button" @click="layoutSystem = 'custom'"
              :style="{
                padding: '5px 10px', fontFamily: 'Bungee, sans-serif', fontSize: '9px', cursor: 'pointer', border: 'none',
                background: 'var(--bg-1)', color: 'var(--text-2)',
              }">CUSTOM</button>
          </div>
          <!-- Custom mode: just a link back to presets -->
          <button v-else type="button" @click="layoutSystem = 'storm'"
            class="rr-mono" style="font-size: 9px; color: var(--text-3); background: none; border: none; cursor: pointer; text-decoration: underline; text-underline-offset: 3px;">
            USE PRESETS
          </button>
        </div>

        <!-- 1H / 2H toggle (dual angle only) -->
        <div v-if="layoutSystem === 'dual-angle'" style="display: flex; gap: 6px; margin-bottom: 10px;">
          <button type="button" @click="layoutHand = '1H'"
            class="rr-chip" :class="layoutHand === '1H' ? 'rr-chip-accent' : ''"
            style="cursor: pointer; padding: 5px 12px; font-size: 10px;">1H</button>
          <button type="button" @click="layoutHand = '2H'"
            class="rr-chip" :class="layoutHand === '2H' ? 'rr-chip-accent' : ''"
            style="cursor: pointer; padding: 5px 12px; font-size: 10px;">2H</button>
        </div>

        <!-- Layout presets -->
        <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px;">
          <button v-for="preset in activePresets" :key="preset.value" type="button"
            @click="selectLayout(preset.value)"
            class="rr-card"
            :style="{
              padding: '8px 10px', cursor: 'pointer', border: '1px solid',
              borderColor: form.layout_text === preset.value ? 'var(--accent)' : 'var(--line)',
              background: form.layout_text === preset.value ? 'var(--accent-dim)' : 'var(--bg-1)',
              boxShadow: form.layout_text === preset.value ? 'var(--neon-glow-pink)' : 'none',
            }">
            <div class="rr-num" style="font-size: 11px; color: var(--text-0);">{{ preset.label }}</div>
            <div class="rr-mono" style="font-size: 9px; color: var(--text-3); margin-top: 2px;">{{ preset.desc }}</div>
          </button>
        </div>

        <input v-model="form.layout_text" type="text" list="layout-list"
          placeholder="Enter layout…"
          class="retro-input" style="width: 100%; box-sizing: border-box; margin-bottom: 16px;" />
        <datalist id="layout-list">
          <option v-for="layout in usedLayouts" :key="layout" :value="layout" />
        </datalist>

        <!-- Notes -->
        <div class="rr-marquee rr-text-pink" style="font-size: 10px; margin-bottom: 8px;">NOTES</div>
        <textarea v-model="form.notes" rows="3" placeholder="Any notes about this ball…"
          style="width: 100%; box-sizing: border-box; padding: 12px 14px; background: var(--bg-1); border: 1px solid var(--line); border-radius: 6px; color: var(--text-0); font-family: 'Kalnia', serif; font-style: italic; font-size: 13px; resize: none; margin-bottom: 16px;"/>

        <!-- Error -->
        <div v-if="error" class="rr-mono" style="font-size: 11px; color: var(--danger); margin-bottom: 12px;">{{ error }}</div>

      </form>
    </div>

    <!-- Sticky bottom CTA -->
    <div style="position: sticky; bottom: 0; background: #14091E; border-top: 1px solid var(--accent-line); padding: 12px 16px 28px; flex-shrink: 0;">
      <button type="button" @click="save" :disabled="saving"
        class="rr-btn rr-btn-primary" style="width: 100%; padding: 16px; font-size: 13px;">
        {{ saving ? 'SAVING…' : (isEdit ? 'SAVE CHANGES' : 'ADD BALL →') }}
      </button>
    </div>

  </div>
</template>

<style scoped>
.between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.screen-root {
  background: var(--bg-0);
  color: var(--text-0);
}
.retro-input {
  padding: 12px 14px;
  background: var(--bg-1);
  border: 1px solid var(--line);
  border-radius: 6px;
  color: var(--text-0);
  font-family: 'Kalnia', serif;
  font-style: italic;
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s;
}
.retro-input:focus {
  border-color: var(--accent-line);
}
select.retro-input {
  font-family: 'Bungee', sans-serif;
  font-style: normal;
  font-size: 11px;
  cursor: pointer;
}
</style>
