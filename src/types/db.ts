export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      balls_catalog: {
        Row: {
          id:              string
          brand:           string
          model:           string
          cover_type:      string | null
          core_name:       string | null
          cover_name:      string | null
          factory_finish:  string | null
          role_tag:        string | null
          core_symmetry:   string | null
          release_year:    number | null
          is_discontinued: boolean
          ai_verified:     boolean
          created_at:      string
          updated_at:      string
        }
        Insert: {
          id?:              string
          brand:            string
          model:            string
          cover_type?:      string | null
          core_name?:       string | null
          cover_name?:      string | null
          factory_finish?:  string | null
          role_tag?:        string | null
          core_symmetry?:   string | null
          release_year?:    number | null
          is_discontinued?: boolean
          ai_verified?:     boolean
          created_at?:      string
          updated_at?:      string
        }
        Update: {
          id?:              string
          brand?:           string
          model?:           string
          cover_type?:      string | null
          core_name?:       string | null
          cover_name?:      string | null
          factory_finish?:  string | null
          role_tag?:        string | null
          core_symmetry?:   string | null
          release_year?:    number | null
          is_discontinued?: boolean
          ai_verified?:     boolean
          created_at?:      string
          updated_at?:      string
        }
        Relationships: []
      }
      balls: {
        Row: {
          bowler_id: string
          brand: string
          core_type: string | null
          cover_type: string | null
          created_at: string
          finish_surface: string | null
          id: string
          layout_text: string | null
          model: string
          notes: string | null
          role_tag: string | null
          status_active: boolean
          updated_at: string
          weight_lb: number
        }
        Insert: {
          bowler_id: string
          brand: string
          core_type?: string | null
          cover_type?: string | null
          created_at?: string
          finish_surface?: string | null
          id?: string
          layout_text?: string | null
          model: string
          notes?: string | null
          role_tag?: string | null
          status_active?: boolean
          updated_at?: string
          weight_lb: number
        }
        Update: {
          bowler_id?: string
          brand?: string
          core_type?: string | null
          cover_type?: string | null
          created_at?: string
          finish_surface?: string | null
          id?: string
          layout_text?: string | null
          model?: string
          notes?: string | null
          role_tag?: string | null
          status_active?: boolean
          updated_at?: string
          weight_lb?: number
        }
        Relationships: [
          {
            foreignKeyName: "balls_bowler_id_fkey"
            columns: ["bowler_id"]
            isOneToOne: false
            referencedRelation: "bowlers"
            referencedColumns: ["id"]
          },
        ]
      }
      bowlers: {
        Row: {
          analytics_consent: boolean
          analytics_consent_at: string | null
          average_band: string | null
          axis_rotation: number | null
          axis_tilt: number | null
          created_at: string
          display_name: string
          experience_level: string | null
          handedness: string | null
          id: string
          pap: string | null
          rev_profile: string | null
          speed_profile: string | null
          style_type: string | null
          typical_miss: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          analytics_consent?: boolean
          analytics_consent_at?: string | null
          average_band?: string | null
          axis_rotation?: number | null
          axis_tilt?: number | null
          created_at?: string
          display_name: string
          experience_level?: string | null
          handedness?: string | null
          id?: string
          pap?: string | null
          rev_profile?: string | null
          speed_profile?: string | null
          style_type?: string | null
          typical_miss?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          analytics_consent?: boolean
          analytics_consent_at?: string | null
          average_band?: string | null
          axis_rotation?: number | null
          axis_tilt?: number | null
          created_at?: string
          display_name?: string
          experience_level?: string | null
          handedness?: string | null
          id?: string
          pap?: string | null
          rev_profile?: string | null
          speed_profile?: string | null
          style_type?: string | null
          typical_miss?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      frames: {
        Row: {
          ball_id: string | null
          converted: boolean | null
          created_at: string
          cumulative_score: number | null
          frame_detail: Json | null
          frame_note: string | null
          frame_number: number
          frame_score: number | null
          game_id: string
          id: string
          leave_type: string | null
          result_type: string | null
          roll1_pins: number | null
          roll2_pins: number | null
          roll3_pins: number | null
          updated_at: string
        }
        Insert: {
          ball_id?: string | null
          converted?: boolean | null
          created_at?: string
          cumulative_score?: number | null
          frame_detail?: Json | null
          frame_note?: string | null
          frame_number: number
          frame_score?: number | null
          game_id: string
          id?: string
          leave_type?: string | null
          result_type?: string | null
          roll1_pins?: number | null
          roll2_pins?: number | null
          roll3_pins?: number | null
          updated_at?: string
        }
        Update: {
          ball_id?: string | null
          converted?: boolean | null
          created_at?: string
          cumulative_score?: number | null
          frame_detail?: Json | null
          frame_note?: string | null
          frame_number?: number
          frame_score?: number | null
          game_id?: string
          id?: string
          leave_type?: string | null
          result_type?: string | null
          roll1_pins?: number | null
          roll2_pins?: number | null
          roll3_pins?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "frames_ball_id_fkey"
            columns: ["ball_id"]
            isOneToOne: false
            referencedRelation: "balls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "frames_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          clean_game: boolean | null
          created_at: string
          final_score: number | null
          game_number: number
          id: string
          open_count: number | null
          session_id: string
          spare_count: number | null
          strike_count: number | null
          updated_at: string
        }
        Insert: {
          clean_game?: boolean | null
          created_at?: string
          final_score?: number | null
          game_number: number
          id?: string
          open_count?: number | null
          session_id: string
          spare_count?: number | null
          strike_count?: number | null
          updated_at?: string
        }
        Update: {
          clean_game?: boolean | null
          created_at?: string
          final_score?: number | null
          game_number?: number
          id?: string
          open_count?: number | null
          session_id?: string
          spare_count?: number | null
          strike_count?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "games_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      patterns: {
        Row: {
          category: string | null
          created_at: string
          id: string
          length_ft: number | null
          name: string
          notes: string | null
          ratio: number | null
          source: string | null
          volume_ml: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          length_ft?: number | null
          name: string
          notes?: string | null
          ratio?: number | null
          source?: string | null
          volume_ml?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          length_ft?: number | null
          name?: string
          notes?: string | null
          ratio?: number | null
          source?: string | null
          volume_ml?: number | null
        }
        Relationships: []
      }
      sessions: {
        Row: {
          bowler_id: string
          center_name: string
          created_at: string
          event_type: string
          id: string
          lane_pair: string | null
          pattern_id: string | null
          pattern_snapshot: Json | null
          session_date: string
          session_notes: string | null
          updated_at: string
        }
        Insert: {
          bowler_id: string
          center_name: string
          created_at?: string
          event_type: string
          id?: string
          lane_pair?: string | null
          pattern_id?: string | null
          pattern_snapshot?: Json | null
          session_date?: string
          session_notes?: string | null
          updated_at?: string
        }
        Update: {
          bowler_id?: string
          center_name?: string
          created_at?: string
          event_type?: string
          id?: string
          lane_pair?: string | null
          pattern_id?: string | null
          pattern_snapshot?: Json | null
          session_date?: string
          session_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_bowler_id_fkey"
            columns: ["bowler_id"]
            isOneToOne: false
            referencedRelation: "bowlers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_pattern_id_fkey"
            columns: ["pattern_id"]
            isOneToOne: false
            referencedRelation: "patterns"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
