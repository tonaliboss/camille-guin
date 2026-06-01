'use client'

import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import type { UploadProgress } from '@/hooks/useFileUpload'

interface Props {
  progress: { [key: string]: UploadProgress }
}

export default function FileUploadProgress({ progress }: Props) {
  const entries = Object.values(progress)
  if (entries.length === 0) return null

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      <h4 className="font-medium text-brown text-sm">Progression de l'upload</h4>
      {entries.map((item) => (
        <div key={item.fileName} className="bg-white p-3 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="flex-shrink-0">
                {item.status === 'completed' && <CheckCircle size={16} className="text-green-500" />}
                {item.status === 'error' && <AlertCircle size={16} className="text-red-500" />}
                {(item.status === 'uploading' || item.status === 'pending') && (
                  <Loader2 size={16} className="text-blue-500 animate-spin" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-brown/80 truncate">{item.fileName}</p>
                {item.originalSize && (
                  <p className="text-xs text-brown/60">{(item.originalSize / 1024 / 1024).toFixed(2)} Mo</p>
                )}
              </div>
            </div>
            <div className="text-xs text-brown/60 flex-shrink-0">
              {item.status === 'uploading' && 'Upload...'}
              {item.status === 'completed' && 'Terminé'}
              {item.status === 'error' && 'Erreur'}
            </div>
          </div>

          {item.status !== 'completed' && item.status !== 'error' && (
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full transition-all duration-300 bg-blue-500"
                style={{ width: `${item.progress}%` }}
              />
            </div>
          )}

          {item.error && <p className="text-xs text-red-600 mt-1">{item.error}</p>}
        </div>
      ))}
    </div>
  )
}