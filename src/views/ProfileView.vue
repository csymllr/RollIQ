<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useBowlerStore } from '@/stores/bowler'

const bowler = useBowlerStore()
const auth = useAuthStore()
const router = useRouter()
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
    handedness: (form.value.handedness || null) as 'right' | 'left' | null,
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

async function signOut() {
  await auth.signOut()
  router.push('/login')
}
</script>

<template>
  <div class="profile-root no-scrollbar">
    <!-- Status bar (mobile) -->
    <div class="status-bar rr-mono">
      <span>{{ new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }}</span>
      <span style="color:var(--text-2);">● ● ● ▮▮▮▮</span>
    </div>

    <!-- Header -->
    <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 16px 12px; flex-shrink:0;">
      <div class="rr-script rr-text-cyan" style="font-size:26px;">More</div>
      <button class="rr-btn rr-btn-ghost" style="padding:6px 12px; font-size:10px;" @click="signOut">SIGN OUT</button>
    </div>

    <!-- Content -->
    <div class="profile-scroll no-scrollbar">

      <!-- Profile card -->
      <div class="rr-card" style="padding:16px; margin-bottom:14px;">
        <div class="rr-marquee rr-text-pink" style="font-size:10px; margin-bottom:12px;">━━ BOWLER PROFILE ━━</div>

        <form @submit.prevent="save">
          <!-- Name -->
          <div style="margin-bottom:14px;">
            <div class="rr-marquee" style="font-size:9px; color:var(--text-3); letter-spacing:0.08em; text-transform:uppercase; margin-bottom:6px;">DISPLAY NAME *</div>
            <input v-model="form.display_name" type="text" required placeholder="Your name"
              class="rr-script profile-input" style="font-style:italic; font-size:16px;" />
          </div>

          <!-- Hand + Style -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px;">
            <div>
              <div class="rr-marquee" style="font-size:9px; color:var(--text-3); letter-spacing:0.08em; text-transform:uppercase; margin-bottom:6px;">HANDEDNESS</div>
              <select v-model="form.handedness" class="profile-select">
                <option value="">—</option>
                <option value="right">Right</option>
                <option value="left">Left</option>
              </select>
            </div>
            <div>
              <div class="rr-marquee" style="font-size:9px; color:var(--text-3); letter-spacing:0.08em; text-transform:uppercase; margin-bottom:6px;">STYLE</div>
              <select v-model="form.style_type" class="profile-select">
                <option value="">—</option>
                <option value="one_handed">1-Handed</option>
                <option value="two_handed">2-Handed</option>
              </select>
            </div>
          </div>

          <!-- Rev + Speed -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px;">
            <div>
              <div class="rr-marquee" style="font-size:9px; color:var(--text-3); letter-spacing:0.08em; text-transform:uppercase; margin-bottom:6px;">REV PROFILE</div>
              <input v-model="form.rev_profile" type="text" placeholder="Medium" class="profile-input rr-mono" style="font-size:12px;" />
            </div>
            <div>
              <div class="rr-marquee" style="font-size:9px; color:var(--text-3); letter-spacing:0.08em; text-transform:uppercase; margin-bottom:6px;">BALL SPEED</div>
              <input v-model="form.speed_profile" type="text" placeholder="17–18 mph" class="profile-input rr-mono" style="font-size:12px;" />
            </div>
          </div>

          <!-- Average + Miss -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px;">
            <div>
              <div class="rr-marquee" style="font-size:9px; color:var(--text-3); letter-spacing:0.08em; text-transform:uppercase; margin-bottom:6px;">AVG BAND</div>
              <input v-model="form.average_band" type="text" placeholder="190–200" class="profile-input rr-mono" style="font-size:12px;" />
            </div>
            <div>
              <div class="rr-marquee" style="font-size:9px; color:var(--text-3); letter-spacing:0.08em; text-transform:uppercase; margin-bottom:6px;">TYPICAL MISS</div>
              <input v-model="form.typical_miss" type="text" placeholder="Left" class="profile-input rr-mono" style="font-size:12px;" />
            </div>
          </div>

          <!-- Experience -->
          <div style="margin-bottom:14px;">
            <div class="rr-marquee" style="font-size:9px; color:var(--text-3); letter-spacing:0.08em; text-transform:uppercase; margin-bottom:6px;">EXPERIENCE</div>
            <select v-model="form.experience_level" class="profile-select">
              <option value="">Not specified</option>
              <option value="recreational">Recreational</option>
              <option value="league">League</option>
              <option value="competitive">Competitive</option>
              <option value="tournament">Tournament</option>
              <option value="professional">Professional</option>
            </select>
          </div>

          <!-- Advanced toggle -->
          <button type="button" class="rr-marquee" style="font-size:10px; color:var(--accent-2); background:none; border:none; cursor:pointer; padding:4px 0; margin-bottom:10px;"
            @click="showAdvanced = !showAdvanced">
            {{ showAdvanced ? '▲' : '▼' }} ADVANCED (PAP / AXIS)
          </button>

          <div v-if="showAdvanced" style="margin-bottom:14px;">
            <div style="margin-bottom:10px;">
              <div class="rr-marquee" style="font-size:9px; color:var(--text-3); letter-spacing:0.08em; text-transform:uppercase; margin-bottom:6px;">PAP</div>
              <input v-model="form.pap" type="text" placeholder="5¾ × ¾↑" class="profile-input rr-mono" style="font-size:12px;" />
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
              <div>
                <div class="rr-marquee" style="font-size:9px; color:var(--text-3); letter-spacing:0.08em; text-transform:uppercase; margin-bottom:6px;">AXIS TILT °</div>
                <input v-model="form.axis_tilt" type="number" step="0.5" min="0" max="90" placeholder="0–90" class="profile-input rr-mono" style="font-size:12px;" />
              </div>
              <div>
                <div class="rr-marquee" style="font-size:9px; color:var(--text-3); letter-spacing:0.08em; text-transform:uppercase; margin-bottom:6px;">AXIS ROTATION °</div>
                <input v-model="form.axis_rotation" type="number" step="5" min="0" max="90" placeholder="0–90" class="profile-input rr-mono" style="font-size:12px;" />
              </div>
            </div>
          </div>

          <p v-if="error" class="rr-mono" style="font-size:11px; color:var(--danger); margin-bottom:10px;">{{ error }}</p>
          <p v-if="saved" class="rr-marquee" style="font-size:10px; color:var(--success); margin-bottom:10px;">SAVED ✓</p>

          <button type="submit" class="rr-btn rr-btn-primary" style="width:100%; padding:14px;" :disabled="saving">
            {{ saving ? 'SAVING…' : 'SAVE PROFILE' }}
          </button>
        </form>
      </div>

      <!-- Account info -->
      <div class="rr-card" style="padding:16px;">
        <div class="rr-marquee rr-text-cyan" style="font-size:10px; margin-bottom:12px;">━━ ACCOUNT ━━</div>
        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid var(--line-soft);">
          <span class="rr-mono" style="font-size:11px; color:var(--text-2);">Email</span>
          <span class="rr-mono" style="font-size:11px; color:var(--text-0);">{{ auth.user?.email }}</span>
        </div>
        <div style="padding:8px 0;">
          <span class="rr-mono" style="font-size:10px; color:var(--text-3);">RollIQ · Personal bowling tracker</span>
        </div>
      </div>

      <div style="height:20px;" />
    </div>
  </div>
</template>

<style scoped>
.profile-root {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-0);
}

.status-bar {
  display: flex;
  justify-content: space-between;
  padding: 10px 20px 4px;
  font-size: 12px;
  color: var(--text-1);
  font-weight: 600;
  flex-shrink: 0;
}

.profile-scroll {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 0 16px 24px;
}

.profile-input {
  width: 100%;
  padding: 11px 13px;
  background: var(--bg-2);
  border: 1px solid var(--line);
  border-radius: 5px;
  color: var(--text-0);
  outline: none;
  font-size: 13px;
  font-family: 'Inter', sans-serif;
}
.profile-input:focus { border-color: var(--accent-line); }
.profile-input::placeholder { color: var(--text-3); }

.profile-select {
  width: 100%;
  padding: 11px 13px;
  background: var(--bg-2);
  border: 1px solid var(--line);
  border-radius: 5px;
  color: var(--text-0);
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236E5F75' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 14px;
}
.profile-select:focus { border-color: var(--accent-line); }
.profile-select option { background: var(--bg-1); }

@media (min-width: 1024px) {
  .status-bar { display: none; }
  .profile-scroll { padding: 0 28px 28px; max-width: 600px; }
}
</style>
