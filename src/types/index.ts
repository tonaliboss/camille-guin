export type UserRole = 'guest' | 'admin'

export type MediaType = 'image' | 'video' | 'audio'

export interface MediaItem {
  name: string
  url: string
  type: MediaType
  folder: string
}

export interface AudioMessage {
  name: string
  url: string
}

export interface Message {
  message: string
  author: string
  date: string
}

export interface Page {
  message: string
  author: string
  pageNumber: number
  totalPages: number
  originalIndex: number
  originalMessage: Message & { _filename: string }
}

export interface UploadProgress {
  [fileName: string]: {
    progress: number
    status: 'pending' | 'uploading' | 'success' | 'error'
  }
}

export interface DepotSettings {
  bannerType: 'image' | 'solid' | 'custom'
  bannerColor: string
  bannerImageUrl: string | null
  themeColor: string
  titleColor: string
  buttonTextColor: string
  guestMessage: string
}