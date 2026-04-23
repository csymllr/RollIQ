import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

interface BallSpecs {
  cover_type?: string
  core_type?: string
  finish_surface?: string
  role_tag?: 'benchmark' | 'strong_asym' | 'transition' | 'urethane' | 'spare' | 'other'
  found: boolean
  source?: 'catalog' | 'ai'
}

export function useFetchBallSpecs() {
  const fetching  = ref(false)
  const fetchError = ref('')

  async function fetchSpecs(brand: string, model: string): Promise<BallSpecs | null> {
    fetching.value  = true
    fetchError.value = ''

    try {
      const { data, error } = await supabase.functions.invoke<BallSpecs>('fetch-ball-specs', {
        body: { brand, model },
      })

      if (error) {
        const msg = (error as any)?.message ?? ''
        if (msg.includes('503') || msg.includes('not configured')) {
          fetchError.value = 'AI lookup unavailable — fill in specs manually'
        } else {
          fetchError.value = 'Lookup failed — check connection and try again'
        }
        return null
      }

      if (!data?.found) {
        fetchError.value = 'Ball not found in database — fill in specs manually'
        return null
      }

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
