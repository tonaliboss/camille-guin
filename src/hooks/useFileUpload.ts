'use client'

import { useState, useCallback } from 'react'
import { supabase, BUCKET_NAME } from '@/lib/supabase'

export interface UploadProgress {
  fileName: string
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  originalSize?: number
  error?: string
}

export const useFileUpload = (folderName: string) => {
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: UploadProgress }>({})
  const [isUploading, setIsUploading] = useState(false)

  const updateProgress = useCallback((fileName: string, update: Partial<UploadProgress>) => {
    setUploadProgress(prev => ({
      ...prev,
      [fileName]: { ...prev[fileName], ...update }
    }))
  }, [])

  const uploadFile = useCallback(async (file: File): Promise<boolean> => {
    updateProgress(file.name, {
      fileName: file.name,
      progress: 0,
      status: 'pending',
      originalSize: file.size
    })

    try {
      updateProgress(file.name, { status: 'uploading', progress: 30 })

      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'unknown'
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const bucketPath = `${folderName}/${fileName}`

      updateProgress(file.name, { progress: 50 })

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(bucketPath, file)

      if (uploadError) throw uploadError

      // Déterminer le type
      const type = file.type.startsWith('audio/')
        ? 'audio'
        : file.type.startsWith('video/')
        ? 'video'
        : 'image'

      const res = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bucket_path: bucketPath, type, folder: folderName }),
      })

      if (!res.ok) throw new Error('Erreur lors de l\'enregistrement en BDD')

      updateProgress(file.name, { status: 'completed', progress: 100 })
      return true
    } catch (error) {
      updateProgress(file.name, {
        status: 'error',
        progress: 0,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      })
      return false
    }
  }, [folderName, updateProgress])

  const uploadFiles = useCallback(async (files: File[]): Promise<{ success: number; failed: number }> => {
    if (!files.length) return { success: 0, failed: 0 }

    setIsUploading(true)
    setUploadProgress({})

    let successCount = 0
    let failedCount = 0

    const CONCURRENT_UPLOADS = 3
    for (let i = 0; i < files.length; i += CONCURRENT_UPLOADS) {
      const chunk = files.slice(i, i + CONCURRENT_UPLOADS)
      const results = await Promise.all(chunk.map(uploadFile))
      results.forEach(success => success ? successCount++ : failedCount++)
    }

    setIsUploading(false)
    return { success: successCount, failed: failedCount }
  }, [uploadFile])

  const resetProgress = useCallback(() => setUploadProgress({}), [])

  return { uploadFiles, uploadProgress, isUploading, resetProgress }
}