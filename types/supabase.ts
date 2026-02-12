export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      artifacts: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: string
          memory_refs: string[] | null
          source_url: string | null
          status: string | null
          summary: string | null
          tags: string[] | null
          title: string
          type: string
          updated_at: string | null
          user_note: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: string
          memory_refs?: string[] | null
          source_url?: string | null
          status?: string | null
          summary?: string | null
          tags?: string[] | null
          title: string
          type: string
          updated_at?: string | null
          user_note?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: string
          memory_refs?: string[] | null
          source_url?: string | null
          status?: string | null
          summary?: string | null
          tags?: string[] | null
          title?: string
          type?: string
          updated_at?: string | null
          user_note?: string | null
        }
        Relationships: []
      }
      memory_file_versions: {
        Row: {
          content: string
          created_at: string | null
          id: string
          memory_file_id: string | null
          version: number
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          memory_file_id?: string | null
          version: number
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          memory_file_id?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "memory_file_versions_memory_file_id_fkey"
            columns: ["memory_file_id"]
            isOneToOne: false
            referencedRelation: "memory_files"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_files: {
        Row: {
          content: string
          description: string
          filename: string
          id: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          content: string
          description: string
          filename: string
          id?: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          content?: string
          description?: string
          filename?: string
          id?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: []
      }
      pending_memory_updates: {
        Row: {
          created_at: string | null
          id: string
          memory_file_id: string | null
          proposed_diff: string
          reasoning: string
          source_artifact_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          memory_file_id?: string | null
          proposed_diff: string
          reasoning: string
          source_artifact_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          memory_file_id?: string | null
          proposed_diff?: string
          reasoning?: string
          source_artifact_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pending_memory_updates_memory_file_id_fkey"
            columns: ["memory_file_id"]
            isOneToOne: false
            referencedRelation: "memory_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_memory_updates_source_artifact_id_fkey"
            columns: ["source_artifact_id"]
            isOneToOne: false
            referencedRelation: "artifacts"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          artifact_id: string | null
          command: string
          completed_at: string | null
          created_at: string | null
          id: string
          memory_files_used: string[] | null
          result: string | null
          status: string | null
        }
        Insert: {
          artifact_id?: string | null
          command: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          memory_files_used?: string[] | null
          result?: string | null
          status?: string | null
        }
        Update: {
          artifact_id?: string | null
          command?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          memory_files_used?: string[] | null
          result?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_artifact_id_fkey"
            columns: ["artifact_id"]
            isOneToOne: false
            referencedRelation: "artifacts"
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

