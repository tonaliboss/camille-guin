// hooks/useRecapVideo.ts
'use client'

import { useEffect, useState } from 'react'
import { supabase, BUCKET_NAME, FOLDERS } from '@/lib/supabase'

export function useRecapVideo() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadVideo = async () => {
      setLoading(true)
      try {
        const { data: files, error } = await supabase.storage
          .from(BUCKET_NAME)
          .list(FOLDERS.RECAP, { sortBy: { column: 'created_at', order: 'desc' } })
        if (error) { console.error('Error fetching recap video:', error); return }
        const latest = files?.find(f => !f.name.startsWith('.'))
        if (latest) {
          const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(`${FOLDERS.RECAP}/${latest.name}`)
          setVideoUrl(data.publicUrl)
        }
      } finally {
        setLoading(false)
      }
    }
    loadVideo()
  }, [])

  return { videoUrl, loading }
}