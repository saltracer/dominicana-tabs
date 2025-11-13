import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase configuration missing. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY environment variables.');
}

// Create a storage adapter that works on both web and native
const supabaseStorage = Platform.OS === 'web' 
  ? {
      getItem: (key: string) => {
        if (typeof window === 'undefined') return null;
        return Promise.resolve(window.localStorage.getItem(key));
      },
      setItem: (key: string, value: string) => {
        if (typeof window === 'undefined') return Promise.resolve();
        window.localStorage.setItem(key, value);
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        if (typeof window === 'undefined') return Promise.resolve();
        window.localStorage.removeItem(key);
        return Promise.resolve();
      },
    }
  : AsyncStorage;

// Create Supabase client with platform-appropriate storage for session persistence
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: supabaseStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
    // Enable debug mode to see token refresh attempts in logs (development only)
    debug: __DEV__,
    // Use a more reliable flow type for better compatibility
    flowType: 'pkce',
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
      book_bookmarks: {
        Row: {
          id: string;
          user_id: string;
          book_id: number;
          location: string;
          cfi: string | null;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          book_id: number;
          location: string;
          cfi?: string | null;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          book_id?: number;
          location?: string;
          cfi?: string | null;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      book_highlights: {
        Row: {
          id: string;
          user_id: string;
          book_id: number;
          location: string;
          cfi_range: string | null;
          highlighted_text: string;
          color: string;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          book_id: number;
          location: string;
          cfi_range?: string | null;
          highlighted_text: string;
          color: string;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          book_id?: number;
          location?: string;
          cfi_range?: string | null;
          highlighted_text?: string;
          color?: string;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      bible_bookmarks: {
        Row: {
          id: string;
          user_id: string;
          book_code: string;
          chapter: number;
          verse: number;
          version: string;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          book_code: string;
          chapter: number;
          verse: number;
          version: string;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          book_code?: string;
          chapter?: number;
          verse?: number;
          version?: string;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      bible_highlights: {
        Row: {
          id: string;
          user_id: string;
          book_code: string;
          chapter: number;
          verse_start: number;
          verse_end: number;
          version: string;
          highlighted_text: string;
          color: string;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          book_code: string;
          chapter: number;
          verse_start: number;
          verse_end: number;
          version: string;
          highlighted_text: string;
          color: string;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          book_code?: string;
          chapter?: number;
          verse_start?: number;
          verse_end?: number;
          version?: string;
          highlighted_text?: string;
          color?: string;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
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
