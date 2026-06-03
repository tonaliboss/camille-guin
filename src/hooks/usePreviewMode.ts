'use client'

import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

export function usePreviewMode() {
  const searchParams = useSearchParams()

  const isPreview = searchParams.get('preview') === '1'

  const executeIfNotPreview = (callback: () => void) => {
    if (isPreview) {
      toast.warning('Action indisponible en mode prévisualisation')
      return
    }

    callback()
  }

  return {
    isPreview,
    executeIfNotPreview,
  }
}