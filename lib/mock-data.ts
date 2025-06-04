import type { User, Chat, Message, Contact, Group } from "@/types"

// Current user
const currentUser: User = {
  id: "user-1",
  name: "John Doe",
  email: "john@example.com",
  avatar: "/placeholder.svg?height=40&width=40",
  status: "online",
  lastSeen: new Date().toISOString(),
  phone: "+1234567890",
  about: "Hey there! I am using WhatsApp.",
  settings: {
    notifications: true,
    darkMode: false,
    readReceipts: true,
    lastSeen: true,
    profilePhoto: "everyone",
    about: "everyone",
    status: "contacts",
  },
}

// Contacts
const contacts: Contact[] = [
  {
    id: "user-2",
    name: "Alice Smith",
    phone: "+1234567891",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
    about: "Busy with work",
  },
  {
    id: "user-3",
    name: "Bob Johnson",
    phone: "+1234567892",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "offline",
    about: "Love coding!",
  },
  {
    id: "user-4",
    name: "Carol Williams",
    phone: "+1234567893",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
    about: "Available",
  },
  {
    id: "user-5",
    name: "David Brown",
    phone: "+1234567894",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "away",
    about: "In a meeting",
  },
]

// Chats
const chats: Chat[] = [
  {
    id: "chat-1",
    name: "Alice Smith",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Looking forward to it! 🚀",
    lastMessageTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    unreadCount: 0,
    isGroup: false,
    participants: [
      { id: "user-1", name: "John Doe", role: "member" },
      { id: "user-2", name: "Alice Smith", role: "member" },
    ],
    isOnline: true,
  },
  {
    id: "chat-2",
    name: "Bob Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Yes! They look amazing. Great work on the UI improvements.",
    lastMessageTime: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
    unreadCount: 0,
    isGroup: false,
    participants: [
      { id: "user-1", name: "John Doe", role: "member" },
      { id: "user-3", name: "Bob Johnson", role: "member" },
    ],
    isOnline: false,
  },
  {
    id: "group-1",
    name: "Team Project",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Let's have a great collaboration! 💪",
    lastMessageTime: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    unreadCount: 2,
    isGroup: true,
    participants: [
      { id: "user-1", name: "John Doe", role: "admin" },
      { id: "user-2", name: "Alice Smith", role: "member" },
      { id: "user-4", name: "Carol Williams", role: "member" },
      { id: "user-5", name: "David Brown", role: "member" },
    ],
    description: "Project collaboration group",
    createdBy: "user-1",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "chat-3",
    name: "Carol Williams",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "See you tomorrow!",
    lastMessageTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    unreadCount: 1,
    isGroup: false,
    participants: [
      { id: "user-1", name: "John Doe", role: "member" },
      { id: "user-4", name: "Carol Williams", role: "member" },
    ],
    isOnline: true,
  },
]

// Messages
const messages: Record<string, Message[]> = {
  "chat-1": [
    {
      id: "msg-1-1",
      content: "Hey! How are you doing?",
      senderId: "user-2",
      senderName: "Alice Smith",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: "read",
    },
    {
      id: "msg-1-2",
      content: "I'm doing great! Just finished a project. How about you?",
      senderId: "user-1",
      senderName: "John Doe",
      timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
      status: "read",
    },
    {
      id: "msg-1-3",
      content: "That's awesome! I'm working on something exciting too. Can't wait to share it with you.",
      senderId: "user-2",
      senderName: "Alice Smith",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      status: "read",
    },
    {
      id: "msg-1-4",
      content: "Looking forward to it! 🚀",
      senderId: "user-1",
      senderName: "John Doe",
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      status: "read",
    },
  ],
  "chat-2": [
    {
      id: "msg-2-1",
      content: "Did you see the latest updates?",
      senderId: "user-3",
      senderName: "Bob Johnson",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      status: "read",
    },
    {
      id: "msg-2-2",
      content: "Yes! They look amazing. Great work on the UI improvements.",
      senderId: "user-1",
      senderName: "John Doe",
      timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
      status: "read",
    },
  ],
  "group-1": [
    {
      id: "msg-3-1",
      content: "Welcome everyone to the team chat!",
      senderId: "user-1",
      senderName: "John Doe",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      status: "read",
    },
    {
      id: "msg-3-2",
      content: "Thanks for adding me! Excited to work with everyone.",
      senderId: "user-2",
      senderName: "Alice Smith",
      timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
      status: "read",
    },
    {
      id: "msg-3-3",
      content: "Let's have a great collaboration! 💪",
      senderId: "user-4",
      senderName: "Carol Williams",
      timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
      status: "read",
    },
  ],
  "chat-3": [
    {
      id: "msg-4-1",
      content: "Hi John, are we still meeting tomorrow?",
      senderId: "user-4",
      senderName: "Carol Williams",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      status: "read",
    },
    {
      id: "msg-4-2",
      content: "Yes, 10 AM at the coffee shop works for me.",
      senderId: "user-1",
      senderName: "John Doe",
      timestamp: new Date(Date.now() - 5.5 * 60 * 60 * 1000).toISOString(),
      status: "read",
    },
    {
      id: "msg-4-3",
      content: "See you tomorrow!",
      senderId: "user-4",
      senderName: "Carol Williams",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      status: "delivered",
    },
  ],
}

// Groups
const groups: Group[] = [
  {
    id: "group-1",
    name: "Team Project",
    description: "Project collaboration group",
    avatar: "/placeholder.svg?height=40&width=40",
    participants: [
      {
        id: "user-1",
        name: "John Doe",
        role: "admin",
        avatar: "/placeholder.svg?height=40&width=40",
        status: "Hey there! I am using WhatsApp.",
      },
      {
        id: "user-2",
        name: "Alice Smith",
        role: "member",
        avatar: "/placeholder.svg?height=40&width=40",
        status: "Busy with work",
      },
      {
        id: "user-4",
        name: "Carol Williams",
        role: "member",
        avatar: "/placeholder.svg?height=40&width=40",
        status: "Available",
      },
      {
        id: "user-5",
        name: "David Brown",
        role: "member",
        avatar: "/placeholder.svg?height=40&width=40",
        status: "In a meeting",
      },
    ],
    createdBy: "user-1",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    settings: {
      onlyAdminsCanMessage: false,
      onlyAdminsCanEditInfo: true,
      disappearingMessages: false,
    },
  },
]

// Online users for socket simulation
const onlineUsers = ["user-1", "user-2", "user-4"]

// Export all mock data
export default {
  currentUser,
  contacts,
  chats,
  messages,
  groups,
  onlineUsers,
}
