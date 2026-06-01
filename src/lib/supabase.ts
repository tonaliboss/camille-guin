import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const BUCKET_NAME = '2025-12-20_m_aurore_laurent';

export const FOLDERS = {
  GALERIE: 'galerie',
  AUDIO: 'audio',
  ECRIT: 'ecrit',
  GALERIE_MASQUEE: 'galerie masquee',
  AUDIO_MASQUE: 'audio masque',
  ECRIT_MASQUE: 'ecrit masque',
  PLANNING: 'planning',
} as const;