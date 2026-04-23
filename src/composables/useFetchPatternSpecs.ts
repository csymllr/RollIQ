import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export interface PatternSpecs {
  found: boolean
  source_db?: boolean
  length_ft: number | null
  volume_ml: number | null
  ratio: number | null
  category: 'short' | 'medium' | 'long' | 'sport' | 'custom' | null
  source: string | null
  notes: string | null
}

export function useFetchPatternSpecs() {
  const fetching = ref(false)
  const fetchError = ref('')

  async function fetchSpecs(name: string): Promise<PatternSpecs | null> {
    fetching.value = true
    fetchError.value = ''
    try {
      const { data, error } = await supabase.functions.invoke<PatternSpecs>('fetch-pattern-specs', {
        body: { name },
      })
      if (error) { fetchError.value = 'Spec lookup failed — try again'; return null }
      if (!data?.found) { fetchError.value = 'Pattern not recognized'; return null }
      return data
    } catch {
      fetchError.value = 'Network error — check connection'
      return null
    } finally {
      fetching.value = false
    }
  }

  return { fetching, fetchError, fetchSpecs }
}
