import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './auth'

export interface BowlerProfile {
  id: string
  user_id: string
  display_name: string
  handedness: 'right' | 'left' | null
  style_type: 'one_handed' | 'two_handed' | null
  rev_profile: string | null
  speed_profile: string | null
  average_band: string | null
  typical_miss: string | null
  experience_level: string | null
  pap: string | null
  axis_tilt: number | null
  axis_rotation: number | null
  created_at: string
  updated_at: string
}

export const useBowlerStore = defineStore('bowler', () => {
  const profile = ref<BowlerProfile | null>(null)
  const loading = ref(false)

  async function fetchMine() {
    loading.value = true
    const { data, error } = await supabase.from('bowlers').select('*').maybeSingle()
    loading.value = false
    if (error) return { data: null, error }
    profile.value = data as BowlerProfile | null
    return { data, error: null }
  }

  async function upsertMine(
    values: { display_name: string } & Partial<Omit<BowlerProfile, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'display_name'>>
  ) {
    const auth = useAuthStore()
    const payload = { ...values, user_id: auth.user!.id }
    const { data, error } = await supabase
      .from('bowlers')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single()
    if (!error && data) profile.value = data as BowlerProfile
    return { data, error }
  }

  return { profile, loading, fetchMine, upsertMine }
})
