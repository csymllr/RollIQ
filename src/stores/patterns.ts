import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export interface Pattern {
  id: string
  name: string
  source: string
  category: 'short' | 'medium' | 'long' | 'sport' | 'custom'
  length_ft: number | null
  volume_ml: number | null
  ratio: number | null
  notes: string | null
  created_at: string
}

export const usePatternsStore = defineStore('patterns', () => {
  const patterns = ref<Pattern[]>([])
  const loaded = ref(false)

  async function fetchAll() {
    if (loaded.value) return { data: patterns.value, error: null }
    const { data, error } = await supabase.from('patterns').select('*').order('name')
    if (error) return { data: null, error }
    patterns.value = (data as Pattern[]) ?? []
    loaded.value = true
    return { data, error: null }
  }

  return { patterns, loaded, fetchAll }
})
