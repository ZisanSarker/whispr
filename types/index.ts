export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  status?: string
  lastSeen?: string
  phone?: string
  about?: string
  settings?: UserSettings
}

export interface UserSettings {
  notifications?: boolean
  darkMode?: boolean
  readReceipts?: boolean
  lastSeen?: boolean
  profilePhoto?: "everyone" | "contacts" | "nobody"
  about?: "everyone" | "contacts" | "nobody"
  status?: "everyone" | "contacts" | "nobody"
}

export interface Chat {
  id: string
  name: string
  avatar?: string
  lastMessage?: string
  lastMessageTime?: string
  unreadCount: number
  isGroup: boolean
  participants?: Participant[]
  description?: string
  createdBy?: string
  createdAt?: string
  isOnline?: boolean
}

export interface Participant {
  id: string
  name: string
  role: "admin" | "member"
  avatar?: string
  status?: string
}

export interface Message {
  id: string
  content: string
  senderId: string
  senderName: string
  timestamp: string
  status?: "sending" | "sent" | "delivered" | "read" | "failed"
  attachments?: Attachment[]
  replyTo?: {
    id: string
    content: string
    senderId: string
    senderName: string
  }
}

export interface Attachment {
  name: string
  type: string
  size: number
  url: string
}

export interface Contact {
  id: string
  name: string
  phone: string
  avatar?: string
  status?: string
  about?: string
}

export interface Group {
  id: string
  name: string
  description?: string
  avatar?: string
  participants: Participant[]
  createdBy: string
  createdAt: string
  settings?: GroupSettings
}

export interface GroupSettings {
  onlyAdminsCanMessage: boolean
  onlyAdminsCanEditInfo: boolean
  disappearingMessages: boolean
}

export interface ApiResponse<T> {
  data: T
  status: number
  message?: string
}
