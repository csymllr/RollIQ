import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useBowlerStore } from './bowler'

export interface Session {
  id: string
  bowler_id: string
  event_type: 'practice' | 'league' | 'tournament'
  center_name: string
  lane_pair: string | null
  pattern_id: string | null
  pattern_snapshot: unknown
  session_date: string
  session_notes: string | null
  // migration 0014 fields
  event_name: string | null
  planned_games: number | null
  entering_average: number | null
  handicap: number | null
  is_handicap: boolean
  tournament_id: string | null
  round_type: string | null
  round_number: number | null
  // inline games for list view
  games?: Array<{ final_score: number | null }>
  created_at: string
  updated_at: string
}

export interface Game {
  id: string
  session_id: string
  game_number: number
  final_score: number | null
  clean_game: boolean | null
  strike_count: number
  spare_count: number
  open_count: number
  opponent_score: number | null
  match_result: 'win' | 'loss' | 'push' | null
  created_at: string
  updated_at: string
}

export interface Frame {
  id: string
  game_id: string
  frame_number: number
  roll1_pins: number | null
  roll2_pins: number | null
  roll3_pins: number | null
  frame_score: number | null
  cumulative_score: number | null
  result_type: string | null
  leave_type: string | null
  converted: boolean | null
  ball_id: string | null
  frame_note: string | null
  created_at: string
  updated_at: string
}

export const useSessionsStore = defineStore('sessions', () => {
  const sessions = ref<Session[]>([])
  const loading = ref(false)

  async function fetchAll() {
    loading.value = true
    const { data, error } = await supabase
      .from('sessions')
      .select('*, games(final_score)')
      .order('session_date', { ascending: false })
    loading.value = false
    if (error) return { data: null, error }
    sessions.value = (data as Session[]) ?? []
    return { data, error: null }
  }

  async function fetchOne(id: string) {
    const { data: session, error: sErr } = await supabase.from('sessions').select('*').eq('id', id).single()
    if (sErr) return { data: null, error: sErr }
    const { data: games, error: gErr } = await supabase
      .from('games').select('*').eq('session_id', id).order('game_number')
    if (gErr) return { data: null, error: gErr }
    const gameIds = (games as Game[]).map((g) => g.id)
    const { data: frames, error: fErr } = gameIds.length
      ? await supabase.from('frames').select('*').in('game_id', gameIds).order('frame_number')
      : { data: [] as Frame[], error: null }
    if (fErr) return { data: null, error: fErr }
    return { data: { session: session as Session, games: games as Game[], frames: frames as Frame[] }, error: null }
  }

  async function createSession(values: Omit<Session, 'id' | 'bowler_id' | 'created_at' | 'updated_at' | 'games'>) {
    const bowler = useBowlerStore()
    if (!bowler.profile) return { data: null, error: new Error('No bowler profile') }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('sessions') as any)
      .insert({ ...values, bowler_id: bowler.profile.id })
      .select()
      .single()
    if (!error && data) sessions.value.unshift(data as Session)
    return { data: data as Session | null, error }
  }

  async function createGame(sessionId: string, gameNumber: number) {
    const { data, error } = await supabase
      .from('games')
      .insert({ session_id: sessionId, game_number: gameNumber })
      .select()
      .single()
    return { data, error }
  }

  async function upsertFrame(frame: Omit<Frame, 'id' | 'created_at' | 'updated_at'> & { id?: string }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('frames') as any)
      .upsert(frame, { onConflict: 'game_id,frame_number' })
      .select()
      .single()
    return { data: data as Frame | null, error }
  }

  async function updateGame(id: string, values: Partial<Omit<Game, 'id' | 'session_id' | 'created_at' | 'updated_at'>>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('games') as any).update(values).eq('id', id).select().single()
    return { data: data as Game | null, error }
  }

  async function deleteSession(id: string) {
    const { error } = await supabase.from('sessions').delete().eq('id', id)
    if (!error) sessions.value = sessions.value.filter((s) => s.id !== id)
    return { error }
  }

  return { sessions, loading, fetchAll, fetchOne, createSession, createGame, upsertFrame, updateGame, deleteSession }
})
