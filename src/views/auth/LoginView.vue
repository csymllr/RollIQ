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
const oauthLoading = ref<'google' | 'facebook' | null>(null)

async function submit() {
  error.value = ''
  loading.value = true
  const { error: err } = await auth.signInWithPassword(email.value, password.value)
  loading.value = false
  if (err) { error.value = err.message; return }
  router.push('/dashboard')
}

async function signInWith(provider: 'google' | 'facebook') {
  error.value = ''
  oauthLoading.value = provider
  const { error: err } = await auth.signInWithOAuth(provider)
  if (err) { error.value = err.message; oauthLoading.value = null }
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

      <!-- Card -->
      <div class="rr-card rr-scanlines" style="padding: 28px; border-color: var(--accent-line); background: linear-gradient(135deg, var(--bg-1), #261538); position: relative; overflow: hidden;">
        <div class="rr-marquee rr-text-pink" style="font-size: 10px; margin-bottom: 20px; text-align: center;">━━ SIGN IN ━━</div>

        <form @submit.prevent="submit" style="display: flex; flex-direction: column; gap: 14px;">
          <div>
            <div class="rr-mono" style="font-size: 10px; color: var(--text-3); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.12em;">Email</div>
            <input v-model="email" type="email" required autocomplete="email" placeholder="you@example.com"
              style="width: 100%; box-sizing: border-box; padding: 13px 14px; background: var(--bg-0); border: 1px solid var(--line); border-radius: 6px; color: var(--text-0); font-family: 'JetBrains Mono', monospace; font-size: 13px; outline: none; transition: border-color 0.15s;"
              @focus="($event.target as HTMLInputElement).style.borderColor = 'var(--accent-line)'"
              @blur="($event.target as HTMLInputElement).style.borderColor = 'var(--line)'" />
          </div>
          <div>
            <div class="rr-mono" style="font-size: 10px; color: var(--text-3); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.12em;">Password</div>
            <input v-model="password" type="password" required autocomplete="current-password" placeholder="••••••••"
              style="width: 100%; box-sizing: border-box; padding: 13px 14px; background: var(--bg-0); border: 1px solid var(--line); border-radius: 6px; color: var(--text-0); font-family: 'JetBrains Mono', monospace; font-size: 13px; outline: none; transition: border-color 0.15s;"
              @focus="($event.target as HTMLInputElement).style.borderColor = 'var(--accent-line)'"
              @blur="($event.target as HTMLInputElement).style.borderColor = 'var(--line)'" />
          </div>

          <div v-if="error" class="rr-mono" style="font-size: 11px; color: var(--danger); padding: 8px 10px; background: rgba(255,46,110,0.08); border: 1px solid var(--accent-line); border-radius: 4px;">
            {{ error }}
          </div>

          <button type="submit" :disabled="loading || !!oauthLoading"
            class="rr-btn rr-btn-primary" style="width: 100%; padding: 16px; font-size: 13px; margin-top: 4px;">
            {{ loading ? 'SIGNING IN…' : 'SIGN IN →' }}
          </button>
        </form>

        <!-- Divider -->
        <div style="display: flex; align-items: center; gap: 10px; margin: 20px 0;">
          <div style="flex: 1; height: 1px; background: var(--line);"/>
          <span class="rr-mono" style="font-size: 9px; color: var(--text-3); letter-spacing: 0.12em;">OR CONTINUE WITH</span>
          <div style="flex: 1; height: 1px; background: var(--line);"/>
        </div>

        <!-- OAuth buttons -->
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button @click="signInWith('google')" :disabled="loading || !!oauthLoading"
            class="rr-btn" style="width: 100%; padding: 13px; font-size: 11px; border-color: var(--line); gap: 10px;">
            <svg width="16" height="16" viewBox="0 0 24 24" style="flex-shrink:0;"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            {{ oauthLoading === 'google' ? 'REDIRECTING…' : 'GOOGLE' }}
          </button>
          <button @click="signInWith('facebook')" :disabled="loading || !!oauthLoading"
            class="rr-btn" style="width: 100%; padding: 13px; font-size: 11px; border-color: var(--line); gap: 10px;">
            <svg width="16" height="16" viewBox="0 0 24 24" style="flex-shrink:0;"><path fill="#1877F2" d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.428c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
            {{ oauthLoading === 'facebook' ? 'REDIRECTING…' : 'FACEBOOK' }}
          </button>
        </div>

      </div>

      <!-- Footer link -->
      <div style="text-align: center; margin-top: 20px;">
        <span class="rr-mono" style="font-size: 11px; color: var(--text-3);">NO ACCOUNT? </span>
        <router-link to="/signup" class="rr-mono rr-text-cyan" style="font-size: 11px;">SIGN UP</router-link>
      </div>

    </div>
  </div>
</template>
