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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      certificates: {
        Row: {
          certificate_id: string
          final_score: number
          id: string
          is_valid: boolean | null
          issued_at: string | null
          rank: number | null
          session_id: string
          skills: string[] | null
          trust_score: number
          user_id: string
        }
        Insert: {
          certificate_id: string
          final_score: number
          id?: string
          is_valid?: boolean | null
          issued_at?: string | null
          rank?: number | null
          session_id: string
          skills?: string[] | null
          trust_score: number
          user_id: string
        }
        Update: {
          certificate_id?: string
          final_score?: number
          id?: string
          is_valid?: boolean | null
          issued_at?: string | null
          rank?: number | null
          session_id?: string
          skills?: string[] | null
          trust_score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "test_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      coding_challenges: {
        Row: {
          category: string
          created_at: string | null
          description: string
          difficulty: string
          hidden_test_cases: Json | null
          id: string
          starter_code: Json | null
          test_cases: Json
          time_limit_seconds: number | null
          title: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          difficulty?: string
          hidden_test_cases?: Json | null
          id?: string
          starter_code?: Json | null
          test_cases: Json
          time_limit_seconds?: number | null
          title: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          difficulty?: string
          hidden_test_cases?: Json | null
          id?: string
          starter_code?: Json | null
          test_cases?: Json
          time_limit_seconds?: number | null
          title?: string
        }
        Relationships: []
      }
      mcq_questions: {
        Row: {
          category: string
          correct_answer: number
          created_at: string | null
          difficulty: string
          id: string
          negative_marks: number | null
          options: Json
          question: string
        }
        Insert: {
          category: string
          correct_answer: number
          created_at?: string | null
          difficulty?: string
          id?: string
          negative_marks?: number | null
          options: Json
          question: string
        }
        Update: {
          category?: string
          correct_answer?: number
          created_at?: string | null
          difficulty?: string
          id?: string
          negative_marks?: number | null
          options?: Json
          question?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          experience_years: number | null
          full_name: string
          github_url: string | null
          id: string
          location: string | null
          phone: string | null
          portfolio_url: string | null
          previous_companies: string[] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          experience_years?: number | null
          full_name?: string
          github_url?: string | null
          id: string
          location?: string | null
          phone?: string | null
          portfolio_url?: string | null
          previous_companies?: string[] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          experience_years?: number | null
          full_name?: string
          github_url?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          portfolio_url?: string | null
          previous_companies?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      test_answers: {
        Row: {
          code_submission: string | null
          created_at: string | null
          id: string
          is_correct: boolean | null
          question_id: string | null
          question_type: string
          score: number | null
          session_id: string
          time_spent_seconds: number | null
          user_answer: string | null
        }
        Insert: {
          code_submission?: string | null
          created_at?: string | null
          id?: string
          is_correct?: boolean | null
          question_id?: string | null
          question_type: string
          score?: number | null
          session_id: string
          time_spent_seconds?: number | null
          user_answer?: string | null
        }
        Update: {
          code_submission?: string | null
          created_at?: string | null
          id?: string
          is_correct?: boolean | null
          question_id?: string | null
          question_type?: string
          score?: number | null
          session_id?: string
          time_spent_seconds?: number | null
          user_answer?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "test_answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "test_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      test_sessions: {
        Row: {
          ai_verdict: Json | null
          cheat_probability: number | null
          cheat_status: Database["public"]["Enums"]["cheat_status"] | null
          completed_at: string | null
          created_at: string | null
          current_difficulty: string | null
          id: string
          started_at: string | null
          status: Database["public"]["Enums"]["test_status"] | null
          total_score: number | null
          trust_score: number | null
          user_id: string
        }
        Insert: {
          ai_verdict?: Json | null
          cheat_probability?: number | null
          cheat_status?: Database["public"]["Enums"]["cheat_status"] | null
          completed_at?: string | null
          created_at?: string | null
          current_difficulty?: string | null
          id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["test_status"] | null
          total_score?: number | null
          trust_score?: number | null
          user_id: string
        }
        Update: {
          ai_verdict?: Json | null
          cheat_probability?: number | null
          cheat_status?: Database["public"]["Enums"]["cheat_status"] | null
          completed_at?: string | null
          created_at?: string | null
          current_difficulty?: string | null
          id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["test_status"] | null
          total_score?: number | null
          trust_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_skills: {
        Row: {
          created_at: string | null
          id: string
          skill_category: string
          skill_level: Database["public"]["Enums"]["skill_level"]
          skill_name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          skill_category: string
          skill_level?: Database["public"]["Enums"]["skill_level"]
          skill_name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          skill_category?: string
          skill_level?: Database["public"]["Enums"]["skill_level"]
          skill_name?: string
          user_id?: string
        }
        Relationships: []
      }
      violations: {
        Row: {
          created_at: string | null
          details: Json | null
          id: string
          session_id: string
          severity: string | null
          user_id: string
          violation_type: string
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          id?: string
          session_id: string
          severity?: string | null
          user_id: string
          violation_type: string
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          id?: string
          session_id?: string
          severity?: string | null
          user_id?: string
          violation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "violations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "test_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "candidate" | "recruiter"
      cheat_status: "clean" | "suspicious" | "cheated"
      skill_level: "beginner" | "intermediate" | "expert"
      test_status:
        | "not_started"
        | "in_progress"
        | "completed"
        | "auto_submitted"
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
  public: {
    Enums: {
      app_role: ["admin", "candidate", "recruiter"],
      cheat_status: ["clean", "suspicious", "cheated"],
      skill_level: ["beginner", "intermediate", "expert"],
      test_status: [
        "not_started",
        "in_progress",
        "completed",
        "auto_submitted",
      ],
    },
  },
} as const
