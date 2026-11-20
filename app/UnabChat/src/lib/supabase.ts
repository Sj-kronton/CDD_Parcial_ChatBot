import { createClient } from '@supabase/supabase-js';

import type { Student } from '@/context/AuthContext';

type Database = {
  unab: {
    Tables: {
      estudiantes: {
        Row: Student;
        Insert: Partial<Student>;
        Update: Partial<Student>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const hasPublicSupabaseConfig =
  Boolean(supabaseUrl && supabaseAnonKey) &&
  !supabaseAnonKey?.startsWith('sb_secret_') &&
  !supabaseAnonKey?.startsWith('replace_with_');

export const supabase =
  hasPublicSupabaseConfig && supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
        db: { schema: 'unab' },
        auth: {
          autoRefreshToken: false,
          detectSessionInUrl: false,
          persistSession: false,
        },
      })
    : null;
