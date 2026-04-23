import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useBowlerStore } from './bowler'

export interface Ball {
  id: string
  bowler_id: string
  brand: string
  model: string
  weight_lb: number
  cover_type: string | null
  core_type: string | null
  finish_surface: string | null
  layout_text: string | null
  role_tag: 'benchmark' | 'strong_asym' | 'transition' | 'urethane' | 'spare' | 'other' | null
  status_active: boolean
  in_bag: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export const useArsenalStore = defineStore('arsenal', () => {
  const balls = ref<Ball[]>([])
  const loading = ref(false)

  async function fetchAll() {
    loading.value = true
    const { data, error } = await supabase.from('balls').select('*').order('created_at')
    loading.value = false
    if (error) return { data: null, error }
    balls.value = (data as Ball[]) ?? []
    return { data, error: null }
  }

  async function create(values: Omit<Ball, 'id' | 'bowler_id' | 'created_at' | 'updated_at'>) {
    const bowler = useBowlerStore()
    if (!bowler.profile) return { data: null, error: new Error('No bowler profile') }
    const { data, error } = await supabase
      .from('balls')
      .insert({ ...values, bowler_id: bowler.profile.id })
      .select()
      .single()
    if (!error && data) balls.value.push(data as Ball)
    return { data, error }
  }

  async function update(id: string, values: Partial<Omit<Ball, 'id' | 'bowler_id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase.from('balls').update(values).eq('id', id).select().single()
    if (!error && data) {
      const idx = balls.value.findIndex((b) => b.id === id)
      if (idx !== -1) balls.value[idx] = data as Ball
    }
    return { data, error }
  }

  async function toggleInBag(id: string) {
    const ball = balls.value.find((b) => b.id === id)
    if (!ball) return
    // Optimistic update
    ball.in_bag = !ball.in_bag
    const { error } = await supabase.from('balls').update({ in_bag: ball.in_bag }).eq('id', id)
    if (error) ball.in_bag = !ball.in_bag // revert on error
  }

  async function softDeactivate(id: string) {
    return update(id, { status_active: false })
  }

  const activeBalls = () => balls.value.filter((b) => b.status_active)
  const inBagBalls = () => balls.value.filter((b) => b.status_active && b.in_bag)

  return { balls, loading, fetchAll, create, update, toggleInBag, softDeactivate, activeBalls, inBagBalls }
})
