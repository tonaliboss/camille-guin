import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const BUCKET_NAME = process.env.NEXT_PUBLIC_BUCKET_NAME!;

export const FOLDERS = {
  GALERIE: 'galerie',
  AUDIO: 'audio',
  ECRIT: 'ecrit',
  PLANNING: 'planning',
} as const;