export type UserRole = 'guest' | 'admin'

export type MediaType = 'image' | 'video' | 'audio'

export type FontFamily = 'Lora' | 'Playfair_Display' | 'Cormorant_Garamond' | 'Great_Vibes' | 'Montserrat' | 'EB_Garamond'

export interface MediaItem {
  id: string
  name: string
  url: string
  type: MediaType
  folder: string
}

export interface AudioMessage {
  id: string
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
  originalMessage: Message & { _id: string }
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
  menuUrl: string | null
  planningUrl: string | null
  fontFamily: FontFamily
}