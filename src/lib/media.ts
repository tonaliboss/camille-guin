import { supabase, BUCKET_NAME } from '@/lib/supabase'
import type { MediaItem, AudioMessage, Message } from '@/types'

function getPublicUrl(bucketPath: string): string {
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(bucketPath)
  return data.publicUrl
}

export async function getGalerieMedia(hidden: boolean = false): Promise<MediaItem[]> {
  const { data, error } = await supabase
    .from('media_items')
    .select('*')
    .eq('folder', 'galerie')
    .eq('hidden', hidden)
    .order('created_at', { ascending: true })

  if (error || !data) return []

  return data.map(item => ({
    id: item.id,
    name: item.bucket_path.split('/').pop() || item.bucket_path,
    url: getPublicUrl(item.bucket_path),
    type: item.type as MediaItem['type'],
    folder: item.folder,
  }))
}

export async function getAudioMessages(hidden: boolean = false): Promise<AudioMessage[]> {
  const { data, error } = await supabase
    .from('media_items')
    .select('*')
    .eq('folder', 'audio')
    .eq('hidden', hidden)
    .order('created_at', { ascending: true })

  if (error || !data) return []

  return data.map(item => ({
    id: item.id,
    name: item.bucket_path.split('/').pop() || item.bucket_path,
    url: getPublicUrl(item.bucket_path),
    metadata: item.metadata,
  }))
}

export async function getMessages(hidden: boolean = false): Promise<(Message & { _id: string })[]> {
  const { data, error } = await supabase
    .from('media_items')
    .select('*')
    .eq('folder', 'ecrit')
    .eq('hidden', hidden)
    .order('created_at', { ascending: true })

  if (error || !data) return []

  return data
    .filter(item => item.metadata)
    .map(item => ({
      ...(item.metadata as Message),
      _id: item.id,
    }))
}

export async function toggleMediaVisibility(id: string, hidden: boolean): Promise<void> {
  const res = await fetch('/api/media', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, hidden }),
  })
  if (!res.ok) throw new Error('Erreur lors de la mise à jour')
}

export async function saveMessage(message: string, author: string, hidden: boolean = false): Promise<void> {
  const res = await fetch('/api/media', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'message',
      hidden,
      metadata: { message, author, date: new Date().toISOString() },
    }),
  })
  if (!res.ok) throw new Error('Erreur lors de l\'enregistrement du message')
}