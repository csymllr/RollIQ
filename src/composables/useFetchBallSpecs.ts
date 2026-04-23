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
        fetchError.value = 'Spec lookup failed — try again or fill in manually'
        return null
      }

      if (!data?.found) {
        fetchError.value = 'Ball not recognized — fill in specs manually'
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
