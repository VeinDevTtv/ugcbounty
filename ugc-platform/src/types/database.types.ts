export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          user_id: string
          email: string
          username: string
          total_earnings: number
          role: 'creator' | 'business' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id?: string
          email: string
          username: string
          total_earnings?: number
          role?: 'creator' | 'business' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          email?: string
          username?: string
          total_earnings?: number
          role?: 'creator' | 'business' | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      bounties: {
        Row: {
          id: string
          name: string
          description: string
          instructions: string | null
          total_bounty: number
          rate_per_1k_views: number
          claimed_bounty: number
          creator_id: string | null
          logo_url: string | null
          company_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          instructions?: string | null
          total_bounty: number
          rate_per_1k_views: number
          claimed_bounty?: number
          creator_id?: string | null
          logo_url?: string | null
          company_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          instructions?: string | null
          total_bounty?: number
          rate_per_1k_views?: number
          claimed_bounty?: number
          creator_id?: string | null
          logo_url?: string | null
          company_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bounties_creator_id_fkey"
            columns: ["creator_id"]
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      submissions: {
        Row: {
          id: string
          bounty_id: string | null
          user_id: string | null
          video_url: string
          view_count: number
          earned_amount: number
          status: string
          validation_explanation: string | null
          title: string | null
          description: string | null
          cover_image_url: string | null
          author: string | null
          platform: 'youtube' | 'tiktok' | 'instagram' | 'other' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          bounty_id?: string | null
          user_id?: string | null
          video_url: string
          view_count?: number
          earned_amount?: number
          status?: string
          validation_explanation?: string | null
          title?: string | null
          description?: string | null
          cover_image_url?: string | null
          author?: string | null
          platform?: 'youtube' | 'tiktok' | 'instagram' | 'other' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          bounty_id?: string | null
          user_id?: string | null
          video_url?: string
          view_count?: number
          earned_amount?: number
          status?: string
          validation_explanation?: string | null
          title?: string | null
          description?: string | null
          cover_image_url?: string | null
          author?: string | null
          platform?: 'youtube' | 'tiktok' | 'instagram' | 'other' | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_bounty_id_fkey"
            columns: ["bounty_id"]
            referencedRelation: "bounties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          }
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

