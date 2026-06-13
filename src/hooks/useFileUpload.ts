'use client'

import { useState, useCallback } from 'react'
import { supabase, BUCKET_NAME } from '@/lib/supabase'
import { isHeic, convertHeicToJpeg } from '@/lib/fileOptimization'

export interface UploadProgress {
  fileName: string
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  originalSize?: number
  error?: string
}

const uploadWithProgress = (
  bucketPath: string,
  file: File,
  cacheControl: string,
  onProgress: (percent: number) => void
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${bucketPath}`

    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    xhr.setRequestHeader('Authorization', `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`)
    xhr.setRequestHeader('Content-Type', file.type)
    xhr.setRequestHeader('cache-control', cacheControl)
    xhr.setRequestHeader('x-upsert', 'false')

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress((e.loaded / e.total) * 100)
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(new Error(`Upload failed: ${xhr.status} ${xhr.responseText}`))
    }
    xhr.onerror = () => reject(new Error('Upload failed'))
    xhr.send(file)
  })
}

export const useFileUpload = (folderName: string, hidden: boolean = false) => {
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
      updateProgress(file.name, { status: 'uploading', progress: 0 })

      let processedFile = file
      if (isHeic(file)) {
        processedFile = await convertHeicToJpeg(file)
      }

      const fileExt = processedFile.name.split('.').pop()?.toLowerCase() || 'unknown'
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const bucketPath = `${folderName}/${fileName}`

      await uploadWithProgress(bucketPath, processedFile, '31536000', (percent) => {
        updateProgress(file.name, { progress: Math.round(percent) })
      })

      const type = processedFile.type.startsWith('audio/')
        ? 'audio'
        : processedFile.type.startsWith('video/')
        ? 'video'
        : 'image'

      const res = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bucket_path: bucketPath, type, folder: folderName, hidden }),
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
  }, [folderName, updateProgress, hidden])

  const uploadFiles = useCallback(async (files: File[]): Promise<{ success: number; failed: number }> => {
    if (!files.length) return { success: 0, failed: 0 }

    setIsUploading(true)
    setUploadProgress({})

    let successCount = 0
    let failedCount = 0

    const photos = files.filter(f => !f.type.startsWith('video/'))
    const videos = files.filter(f => f.type.startsWith('video/'))

    const runBatch = async (batch: File[], concurrency: number) => {
      for (let i = 0; i < batch.length; i += concurrency) {
        const chunk = batch.slice(i, i + concurrency)
        const results = await Promise.all(chunk.map(uploadFile))
        results.forEach(success => success ? successCount++ : failedCount++)
      }
    }

    const CONCURRENT_PHOTO_UPLOADS = 5
    const CONCURRENT_VIDEO_UPLOADS = 2
    await Promise.all([
      runBatch(photos, CONCURRENT_PHOTO_UPLOADS),
      runBatch(videos, CONCURRENT_VIDEO_UPLOADS),
    ])

    setIsUploading(false)
    return { success: successCount, failed: failedCount }
  }, [uploadFile, hidden])

  const resetProgress = useCallback(() => setUploadProgress({}), [])

  return { uploadFiles, uploadProgress, isUploading, resetProgress }
}