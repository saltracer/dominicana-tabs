import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase configuration missing. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY environment variables.');
}

// Create Supabase client with AsyncStorage for session persistence
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types based on your actual Supabase schema
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'anonymous' | 'user' | 'friar' | 'admin';
          preferences: any;
          subscription: any;
          created_at: string;
          last_login: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role?: 'anonymous' | 'user' | 'friar' | 'admin';
          preferences?: any;
          subscription?: any;
          created_at?: string;
          last_login?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'anonymous' | 'user' | 'friar' | 'admin';
          preferences?: any;
          subscription?: any;
          created_at?: string;
          last_login?: string;
          updated_at?: string;
        };
      };
      books: {
        Row: {
          id: number;
          title: string;
          author: string;
          year: string | null;
          category: string;
          cover_image: string | null;
          description: string;
          epub_path: string | null;
          epub_sample_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          title: string;
          author: string;
          year?: string | null;
          category: string;
          cover_image?: string | null;
          description: string;
          epub_path?: string | null;
          epub_sample_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          title?: string;
          author?: string;
          year?: string | null;
          category?: string;
          cover_image?: string | null;
          description?: string;
          epub_path?: string | null;
          epub_sample_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          book_id: number;
          position: number;
          note?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          book_id: number;
          position: number;
          note?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          book_id?: number;
          position?: number;
          note?: string;
          created_at?: string;
        };
      };
      reading_progress: {
        Row: {
          id: string;
          user_id: string;
          book_id: number;
          current_position: number;
          total_pages: number;
          last_read: string;
          time_spent: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          book_id: number;
          current_position: number;
          total_pages: number;
          last_read: string;
          time_spent?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          book_id?: number;
          current_position?: number;
          total_pages?: number;
          last_read?: string;
          time_spent?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Type-safe Supabase client
export type SupabaseClient = typeof supabase;
