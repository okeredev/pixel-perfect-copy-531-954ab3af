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
  public: {
    Tables: {
      app_settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity: string
          entity_id: string | null
          id: string
          metadata: Json
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: string
          metadata?: Json
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: string
          metadata?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          affiliation: string | null
          bio: string | null
          country: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          orcid: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          affiliation?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          orcid?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          affiliation?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          orcid?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      submission_authors: {
        Row: {
          affiliation: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_corresponding: boolean
          orcid: string | null
          position: number
          submission_id: string
        }
        Insert: {
          affiliation?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_corresponding?: boolean
          orcid?: string | null
          position?: number
          submission_id: string
        }
        Update: {
          affiliation?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_corresponding?: boolean
          orcid?: string | null
          position?: number
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submission_authors_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          is_staff: boolean
          submission_id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          is_staff?: boolean
          submission_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          is_staff?: boolean
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submission_comments_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_files: {
        Row: {
          created_at: string
          filename: string
          id: string
          kind: Database["public"]["Enums"]["file_kind"]
          mime_type: string | null
          notes: string | null
          size_bytes: number | null
          storage_path: string
          submission_id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          filename: string
          id?: string
          kind: Database["public"]["Enums"]["file_kind"]
          mime_type?: string | null
          notes?: string | null
          size_bytes?: number | null
          storage_path: string
          submission_id: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          filename?: string
          id?: string
          kind?: Database["public"]["Enums"]["file_kind"]
          mime_type?: string | null
          notes?: string | null
          size_bytes?: number | null
          storage_path?: string
          submission_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "submission_files_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_reviewers: {
        Row: {
          assigned_by: string | null
          created_at: string
          id: string
          notes: string | null
          reviewer_id: string
          status: string
          submission_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          reviewer_id: string
          status?: string
          submission_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          reviewer_id?: string
          status?: string
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submission_reviewers_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          from_status: Database["public"]["Enums"]["submission_status"] | null
          id: string
          note: string | null
          submission_id: string
          to_status: Database["public"]["Enums"]["submission_status"]
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["submission_status"] | null
          id?: string
          note?: string | null
          submission_id: string
          to_status: Database["public"]["Enums"]["submission_status"]
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["submission_status"] | null
          id?: string
          note?: string | null
          submission_id?: string
          to_status?: Database["public"]["Enums"]["submission_status"]
        }
        Relationships: [
          {
            foreignKeyName: "submission_status_history_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          abstract: string
          conference_stage:
            | Database["public"]["Enums"]["conference_stage"]
            | null
          created_at: string
          decision_notes: string | null
          doi: string | null
          id: string
          issue: string | null
          keywords: string[]
          owner_id: string
          page_range: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          published_at: string | null
          status: Database["public"]["Enums"]["submission_status"]
          submitted_at: string | null
          title: string
          track: string | null
          type: Database["public"]["Enums"]["submission_type"]
          updated_at: string
          volume: string | null
        }
        Insert: {
          abstract: string
          conference_stage?:
            | Database["public"]["Enums"]["conference_stage"]
            | null
          created_at?: string
          decision_notes?: string | null
          doi?: string | null
          id?: string
          issue?: string | null
          keywords?: string[]
          owner_id: string
          page_range?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          published_at?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          submitted_at?: string | null
          title: string
          track?: string | null
          type: Database["public"]["Enums"]["submission_type"]
          updated_at?: string
          volume?: string | null
        }
        Update: {
          abstract?: string
          conference_stage?:
            | Database["public"]["Enums"]["conference_stage"]
            | null
          created_at?: string
          decision_notes?: string | null
          doi?: string | null
          id?: string
          issue?: string | null
          keywords?: string[]
          owner_id?: string
          page_range?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          published_at?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          submitted_at?: string | null
          title?: string
          track?: string | null
          type?: Database["public"]["Enums"]["submission_type"]
          updated_at?: string
          volume?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "editor" | "reviewer" | "author"
      conference_stage: "abstract" | "full_paper"
      file_kind:
        | "manuscript"
        | "cover_letter"
        | "payment_evidence"
        | "conference_abstract"
        | "conference_full_paper"
        | "revision"
        | "other"
        | "supplementary"
      payment_status: "pending" | "confirmed" | "rejected"
      submission_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "revisions_requested"
        | "accepted"
        | "rejected"
        | "withdrawn"
        | "published"
      submission_type: "journal" | "conference"
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
      app_role: ["admin", "editor", "reviewer", "author"],
      conference_stage: ["abstract", "full_paper"],
      file_kind: [
        "manuscript",
        "cover_letter",
        "payment_evidence",
        "conference_abstract",
        "conference_full_paper",
        "revision",
        "other",
        "supplementary",
      ],
      payment_status: ["pending", "confirmed", "rejected"],
      submission_status: [
        "draft",
        "submitted",
        "under_review",
        "revisions_requested",
        "accepted",
        "rejected",
        "withdrawn",
        "published",
      ],
      submission_type: ["journal", "conference"],
    },
  },
} as const
