// Enhanced chat service with real-time features

import type { Message } from "@/types"

// Enhanced mock data with unread counts and online status
const MOCK_CHATS = [
  {
    id: "1",
    name: "Alice Smith",
    avatar: "/placeholder.svg?height=40&width=40",
    isGroup: false,
    online: true,
    unreadCount: 2,
    contact: { id: "alice", name: "Alice Smith", status: "At work" },
    lastMessage: {
      content: "Hey, how are you doing?",
      timestamp: "2024-01-15T14:30:00Z",
      senderId: "alice",
    },
  },
  {
    id: "2",
    name: "Bob Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    isGroup: false,
    online: false,
    unreadCount: 0,
    contact: { id: "bob", name: "Bob Johnson", status: "Available" },
    lastMessage: {
      content: "Can we meet tomorrow?",
      timestamp: "2024-01-15T10:15:00Z",
      senderId: "current-user",
    },
  },
  {
    id: "3",
    name: "Family Group",
    avatar: "/placeholder.svg?height=40&width=40",
    isGroup: true,
    unreadCount: 5,
    participants: [
      { id: "mom", name: "Mom", isAdmin: true },
      { id: "dad", name: "Dad", isAdmin: false },
      { id: "sister", name: "Sister", isAdmin: false },
    ],
    lastMessage: {
      content: "Mom: Don't forget the family dinner on Sunday!",
      timestamp: "2024-01-14T18:45:00Z",
      senderId: "mom",
    },
  },
  {
    id: "4",
    name: "Work Team",
    avatar: "/placeholder.svg?height=40&width=40",
    isGroup: true,
    unreadCount: 1,
    participants: [
      { id: "manager", name: "Manager", isAdmin: true },
      { id: "colleague1", name: "Colleague 1", isAdmin: false },
      { id: "colleague2", name: "Colleague 2", isAdmin: false },
    ],
    lastMessage: {
      content: "Manager: Please submit your reports by EOD",
      timestamp: "2024-01-14T15:20:00Z",
      senderId: "manager",
    },
  },
  {
    id: "5",
    name: "Charlie Brown",
    avatar: "/placeholder.svg?height=40&width=40",
    isGroup: false,
    online: true,
    unreadCount: 0,
    contact: { id: "charlie", name: "Charlie Brown", status: "In a meeting" },
    lastMessage: {
      content: "I'll send you the files soon",
      timestamp: "2024-01-13T09:10:00Z",
      senderId: "charlie",
    },
  },
]

const MOCK_CONTACTS = [
  {
    id: "alice",
    name: "Alice Smith",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "At work",
    phone: "+1234567891",
  },
  {
    id: "bob",
    name: "Bob Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "Available",
    phone: "+1234567892",
  },
  {
    id: "charlie",
    name: "Charlie Brown",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "In a meeting",
    phone: "+1234567893",
  },
  {
    id: "dave",
    name: "Dave Wilson",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "Hey there! I'm using WhatsApp Enterprise.",
    phone: "+1234567894",
  },
  {
    id: "emma",
    name: "Emma Davis",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "Busy",
    phone: "+1234567895",
  },
]

const MOCK_MESSAGES: Record<string, Message[]> = {
  "1": [
    {
      id: "1-1",
      content: "Hey there! How's your day going?",
      senderId: "alice",
      timestamp: "2024-01-15T14:25:00Z",
      status: "read",
    },
    {
      id: "1-2",
      content: "I wanted to catch up and see how you're doing",
      senderId: "alice",
      timestamp: "2024-01-15T14:30:00Z",
      status: "delivered",
    },
    {
      id: "1-3",
      content: "I'm doing well, thanks for asking! Just been busy with work lately.",
      senderId: "current-user",
      timestamp: "2024-01-15T14:32:00Z",
      status: "read",
    },
    {
      id: "1-4",
      content: "That's great to hear! Work can be overwhelming sometimes.",
      senderId: "alice",
      timestamp: "2024-01-15T14:35:00Z",
      status: "sent",
    },
  ],
  "2": [
    {
      id: "2-1",
      content: "Hi Bob, do you have time to meet tomorrow?",
      senderId: "current-user",
      timestamp: "2024-01-15T10:10:00Z",
      status: "read",
    },
    {
      id: "2-2",
      content: "Sure, what time works for you?",
      senderId: "bob",
      timestamp: "2024-01-15T10:12:00Z",
      status: "read",
    },
    {
      id: "2-3",
      content: "How about 2pm at the coffee shop downtown?",
      senderId: "current-user",
      timestamp: "2024-01-15T10:15:00Z",
      status: "delivered",
    },
  ],
  "3": [
    {
      id: "3-1",
      content: "Hey everyone, how's your week going?",
      senderId: "current-user",
      timestamp: "2024-01-14T18:30:00Z",
      status: "read",
    },
    {
      id: "3-2",
      content: "Pretty good! Just busy with work as usual.",
      senderId: "sister",
      timestamp: "2024-01-14T18:35:00Z",
      status: "read",
    },
    {
      id: "3-3",
      content: "Don't forget about our family dinner this Sunday at 6pm!",
      senderId: "mom",
      timestamp: "2024-01-14T18:45:00Z",
      status: "read",
    },
    {
      id: "3-4",
      content: "I'll be there! Should I bring anything?",
      senderId: "dad",
      timestamp: "2024-01-14T18:50:00Z",
      status: "read",
    },
  ],
  "4": [
    {
      id: "4-1",
      content: "Good morning team! Hope everyone had a great weekend.",
      senderId: "manager",
      timestamp: "2024-01-14T09:00:00Z",
      status: "read",
    },
    {
      id: "4-2",
      content: "Morning! Yes, it was relaxing. Ready for the week ahead.",
      senderId: "colleague1",
      timestamp: "2024-01-14T09:05:00Z",
      status: "read",
    },
    {
      id: "4-3",
      content: "Hello everyone! Looking forward to our project updates today.",
      senderId: "current-user",
      timestamp: "2024-01-14T09:10:00Z",
      status: "read",
    },
    {
      id: "4-4",
      content: "Please remember to submit your weekly reports by end of day. Thanks!",
      senderId: "manager",
      timestamp: "2024-01-14T15:20:00Z",
      status: "delivered",
    },
  ],
  "5": [
    {
      id: "5-1",
      content: "Hi Charlie, do you have those project files ready?",
      senderId: "current-user",
      timestamp: "2024-01-13T09:00:00Z",
      status: "read",
    },
    {
      id: "5-2",
      content: "I'm still working on them, almost finished!",
      senderId: "charlie",
      timestamp: "2024-01-13T09:05:00Z",
      status: "read",
    },
    {
      id: "5-3",
      content: "I'll send you the files as soon as they're ready",
      senderId: "charlie",
      timestamp: "2024-01-13T09:10:00Z",
      status: "read",
    },
  ],
}

export function getChats() {
  return MOCK_CHATS
}

export function getContacts() {
  return MOCK_CONTACTS
}

export async function getChatById(chatId: string) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const chat = MOCK_CHATS.find((c) => c.id === chatId)
      if (chat) {
        resolve({
          chat,
          messages: MOCK_MESSAGES[chatId] || [],
        })
      } else {
        reject(new Error("Chat not found"))
      }
    }, 300)
  })
}

export async function sendMessage(chatId: string, content: string): Promise<Message> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newMessage: Message = {
        id: `${chatId}-${Date.now()}`,
        content,
        senderId: "current-user",
        timestamp: new Date().toISOString(),
        status: "sent",
      }

      // Update mock data
      if (MOCK_MESSAGES[chatId]) {
        MOCK_MESSAGES[chatId].push(newMessage)
      } else {
        MOCK_MESSAGES[chatId] = [newMessage]
      }

      // Update last message in chat list
      const chatIndex = MOCK_CHATS.findIndex((c) => c.id === chatId)
      if (chatIndex !== -1) {
        MOCK_CHATS[chatIndex].lastMessage = {
          content,
          timestamp: new Date().toISOString(),
          senderId: "current-user",
        }
      }

      resolve(newMessage)
    }, 200)
  })
}
