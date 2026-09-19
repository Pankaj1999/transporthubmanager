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
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          role?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string
        }
        Relationships: []
      }
      ratings: {
        Row: {
          feedback_text: string | null
          id: string
          rated_at: string
          rated_by: string | null
          rating_value: number
          truck_id: string
          visit_id: string
        }
        Insert: {
          feedback_text?: string | null
          id?: string
          rated_at?: string
          rated_by?: string | null
          rating_value: number
          truck_id: string
          visit_id: string
        }
        Update: {
          feedback_text?: string | null
          id?: string
          rated_at?: string
          rated_by?: string | null
          rating_value?: number
          truck_id?: string
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_truck_id_fkey"
            columns: ["truck_id"]
            isOneToOne: false
            referencedRelation: "trucks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: true
            referencedRelation: "truck_visits"
            referencedColumns: ["id"]
          },
        ]
      }
      requirements: {
        Row: {
          assigned_visit_id: string | null
          client_name: string
          client_phone: string | null
          created_at: string
          created_by: string | null
          destination: string
          goods_description: string | null
          id: string
          price_amount: number
          status: string
        }
        Insert: {
          assigned_visit_id?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string
          created_by?: string | null
          destination: string
          goods_description?: string | null
          id?: string
          price_amount?: number
          status?: string
        }
        Update: {
          assigned_visit_id?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string
          created_by?: string | null
          destination?: string
          goods_description?: string | null
          id?: string
          price_amount?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "requirements_assigned_visit_fk"
            columns: ["assigned_visit_id"]
            isOneToOne: false
            referencedRelation: "truck_visits"
            referencedColumns: ["id"]
          },
        ]
      }
      truck_visits: {
        Row: {
          arrival_date: string
          created_at: string
          created_by: string | null
          departure_date: string | null
          id: string
          requirement_id: string | null
          status: string
          truck_id: string
        }
        Insert: {
          arrival_date?: string
          created_at?: string
          created_by?: string | null
          departure_date?: string | null
          id?: string
          requirement_id?: string | null
          status?: string
          truck_id: string
        }
        Update: {
          arrival_date?: string
          created_at?: string
          created_by?: string | null
          departure_date?: string | null
          id?: string
          requirement_id?: string | null
          status?: string
          truck_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "truck_visits_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "requirements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "truck_visits_truck_id_fkey"
            columns: ["truck_id"]
            isOneToOne: false
            referencedRelation: "trucks"
            referencedColumns: ["id"]
          },
        ]
      }
      trucks: {
        Row: {
          created_at: string
          created_by: string | null
          driver_name: string
          driver_phone: string | null
          driver_photo_url: string | null
          id: string
          owner_name: string
          owner_phone: string | null
          truck_number: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          driver_name: string
          driver_phone?: string | null
          driver_photo_url?: string | null
          id?: string
          owner_name: string
          owner_phone?: string | null
          truck_number: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          driver_name?: string
          driver_phone?: string | null
          driver_photo_url?: string | null
          id?: string
          owner_name?: string
          owner_phone?: string | null
          truck_number?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_requirement: {
        Args: { p_requirement_id: string }
        Returns: undefined
      }
      delete_truck: { Args: { p_truck_id: string }; Returns: undefined }
      mark_delivered: { Args: { p_requirement_id: string }; Returns: undefined }
      match_requirement: {
        Args: { p_requirement_id: string; p_visit_id: string }
        Returns: undefined
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
