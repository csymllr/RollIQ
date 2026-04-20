// Manually maintained until: supabase gen types typescript --linked > src/types/db.ts
// Run that command after linking the Supabase project to replace this file.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      bowlers: {
        Row: {
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
        Insert: {
          id?: string
          user_id: string
          display_name: string
          handedness?: 'right' | 'left' | null
          style_type?: 'one_handed' | 'two_handed' | null
          rev_profile?: string | null
          speed_profile?: string | null
          average_band?: string | null
          typical_miss?: string | null
          experience_level?: string | null
          pap?: string | null
          axis_tilt?: number | null
          axis_rotation?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          display_name?: string
          handedness?: 'right' | 'left' | null
          style_type?: 'one_handed' | 'two_handed' | null
          rev_profile?: string | null
          speed_profile?: string | null
          average_band?: string | null
          typical_miss?: string | null
          experience_level?: string | null
          pap?: string | null
          axis_tilt?: number | null
          axis_rotation?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      balls: {
        Row: {
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
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          bowler_id: string
          brand: string
          model: string
          weight_lb: number
          cover_type?: string | null
          core_type?: string | null
          finish_surface?: string | null
          layout_text?: string | null
          role_tag?: 'benchmark' | 'strong_asym' | 'transition' | 'urethane' | 'spare' | 'other' | null
          status_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          bowler_id?: string
          brand?: string
          model?: string
          weight_lb?: number
          cover_type?: string | null
          core_type?: string | null
          finish_surface?: string | null
          layout_text?: string | null
          role_tag?: 'benchmark' | 'strong_asym' | 'transition' | 'urethane' | 'spare' | 'other' | null
          status_active?: boolean
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      patterns: {
        Row: {
          id: string
          name: string
          source: string | null
          category: 'short' | 'medium' | 'long' | 'sport' | 'custom' | null
          length_ft: number | null
          volume_ml: number | null
          ratio: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          source?: string | null
          category?: 'short' | 'medium' | 'long' | 'sport' | 'custom' | null
          length_ft?: number | null
          volume_ml?: number | null
          ratio?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          source?: string | null
          category?: 'short' | 'medium' | 'long' | 'sport' | 'custom' | null
          length_ft?: number | null
          volume_ml?: number | null
          ratio?: number | null
          notes?: string | null
        }
        Relationships: []
      }
      sessions: {
        Row: {
          id: string
          bowler_id: string
          event_type: 'practice' | 'league' | 'tournament'
          center_name: string
          lane_pair: string | null
          pattern_id: string | null
          pattern_snapshot: Json | null
          session_date: string
          session_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          bowler_id: string
          event_type: 'practice' | 'league' | 'tournament'
          center_name: string
          lane_pair?: string | null
          pattern_id?: string | null
          pattern_snapshot?: Json | null
          session_date: string
          session_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          bowler_id?: string
          event_type?: 'practice' | 'league' | 'tournament'
          center_name?: string
          lane_pair?: string | null
          pattern_id?: string | null
          pattern_snapshot?: Json | null
          session_date?: string
          session_notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      games: {
        Row: {
          id: string
          session_id: string
          game_number: number
          final_score: number | null
          clean_game: boolean | null
          strike_count: number
          spare_count: number
          open_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          game_number: number
          final_score?: number | null
          clean_game?: boolean | null
          strike_count?: number
          spare_count?: number
          open_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          game_number?: number
          final_score?: number | null
          clean_game?: boolean | null
          strike_count?: number
          spare_count?: number
          open_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      frames: {
        Row: {
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
        Insert: {
          id?: string
          game_id: string
          frame_number: number
          roll1_pins?: number | null
          roll2_pins?: number | null
          roll3_pins?: number | null
          frame_score?: number | null
          cumulative_score?: number | null
          result_type?: string | null
          leave_type?: string | null
          converted?: boolean | null
          ball_id?: string | null
          frame_note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          frame_number?: number
          roll1_pins?: number | null
          roll2_pins?: number | null
          roll3_pins?: number | null
          frame_score?: number | null
          cumulative_score?: number | null
          result_type?: string | null
          leave_type?: string | null
          converted?: boolean | null
          ball_id?: string | null
          frame_note?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
