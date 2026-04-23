<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const success = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  const { error: err } = await auth.signUp(email.value, password.value)
  loading.value = false
  if (err) { error.value = err.message; return }
  success.value = true
  setTimeout(() => router.push('/dashboard'), 1500)
}
</script>

<template>
  <div data-theme="retro-dark" style="min-height: 100vh; background: var(--bg-0); display: flex; align-items: center; justify-content: center; padding: 24px;">
    <div style="width: 100%; max-width: 400px;">

      <!-- Logo -->
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-flex; align-items: center; gap: 6px; justify-content: center;">
          <span class="rr-script rr-text-cyan" style="font-size: 48px; line-height: 1;">Roll</span>
          <span class="rr-script rr-text-pink" style="font-size: 48px; line-height: 1;">IQ</span>
        </div>
        <div class="rr-mono" style="font-size: 10px; color: var(--text-3); margin-top: 8px; text-transform: uppercase; letter-spacing: 0.16em;">BOWLING INTELLIGENCE</div>
      </div>

      <!-- Success state -->
      <div v-if="success" class="rr-card" style="padding: 32px; text-align: center; border-color: var(--accent-line);">
        <div class="rr-marquee rr-text-cyan" style="font-size: 14px; margin-bottom: 8px;">✓ ACCOUNT CREATED</div>
        <div class="rr-script" style="font-size: 16px; color: var(--text-1);">Taking you in…</div>
      </div>

      <!-- Card -->
      <div v-else class="rr-card rr-scanlines" style="padding: 28px; border-color: var(--accent-line); background: linear-gradient(135deg, var(--bg-1), #261538); position: relative; overflow: hidden;">
        <div class="rr-marquee rr-text-cyan" style="font-size: 10px; margin-bottom: 20px; text-align: center;">━━ CREATE ACCOUNT ━━</div>

        <form @submit.prevent="submit" style="display: flex; flex-direction: column; gap: 14px;">
          <div>
            <div class="rr-mono" style="font-size: 10px; color: var(--text-3); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.12em;">Email</div>
            <input v-model="email" type="email" required autocomplete="email" placeholder="you@example.com"
              style="width: 100%; box-sizing: border-box; padding: 13px 14px; background: var(--bg-0); border: 1px solid var(--line); border-radius: 6px; color: var(--text-0); font-family: 'JetBrains Mono', monospace; font-size: 13px; outline: none; transition: border-color 0.15s;"
              @focus="($event.target as HTMLInputElement).style.borderColor = 'var(--accent-line)'"
              @blur="($event.target as HTMLInputElement).style.borderColor = 'var(--line)'" />
          </div>
          <div>
            <div class="rr-mono" style="font-size: 10px; color: var(--text-3); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.12em;">Password <span style="color: var(--text-3); font-size: 9px;">(min 8 chars)</span></div>
            <input v-model="password" type="password" required minlength="8" autocomplete="new-password" placeholder="••••••••"
              style="width: 100%; box-sizing: border-box; padding: 13px 14px; background: var(--bg-0); border: 1px solid var(--line); border-radius: 6px; color: var(--text-0); font-family: 'JetBrains Mono', monospace; font-size: 13px; outline: none; transition: border-color 0.15s;"
              @focus="($event.target as HTMLInputElement).style.borderColor = 'var(--accent-line)'"
              @blur="($event.target as HTMLInputElement).style.borderColor = 'var(--line)'" />
          </div>

          <div v-if="error" class="rr-mono" style="font-size: 11px; color: var(--danger); padding: 8px 10px; background: rgba(255,46,110,0.08); border: 1px solid var(--accent-line); border-radius: 4px;">
            {{ error }}
          </div>

          <button type="submit" :disabled="loading"
            class="rr-btn rr-btn-primary" style="width: 100%; padding: 16px; font-size: 13px; margin-top: 4px;">
            {{ loading ? 'CREATING…' : 'CREATE ACCOUNT →' }}
          </button>
        </form>
      </div>

      <!-- Footer link -->
      <div style="text-align: center; margin-top: 20px;">
        <span class="rr-mono" style="font-size: 11px; color: var(--text-3);">ALREADY HAVE AN ACCOUNT? </span>
        <router-link to="/login" class="rr-mono rr-text-pink" style="font-size: 11px;">SIGN IN</router-link>
      </div>

    </div>
  </div>
</template>
