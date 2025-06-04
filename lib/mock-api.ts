import type { User, Chat, Message, Contact, Group, Attachment } from "@/types"

// Mock data
import mockData from "./mock-data"

// Helper function to simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Authentication APIs
export async function loginApi(email: string, password: string): Promise<{ user: User; token: string }> {
  await delay(800)

  // For demo purposes, accept any email/password
  if (!email || !password) {
    throw new Error("Email and password are required")
  }

  return {
    user: mockData.currentUser,
    token: `mock-token-${Date.now()}`,
  }
}

export async function signupApi(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
  await delay(1000)

  if (!name || !email || !password) {
    throw new Error("Name, email, and password are required")
  }

  // Create a new user based on the current user
  const newUser = {
    ...mockData.currentUser,
    name,
    email,
  }

  return {
    user: newUser,
    token: `mock-token-${Date.now()}`,
  }
}

export async function logoutApi(): Promise<void> {
  await delay(500)
  return Promise.resolve()
}

export async function fetchCurrentUser(): Promise<User> {
  await delay(700)
  return mockData.currentUser
}

// User APIs
export async function updateUserProfile(formData: FormData): Promise<User> {
  await delay(800)

  const name = formData.get("name") as string
  const about = formData.get("about") as string

  // Update mock user data
  if (name) mockData.currentUser.name = name
  if (about) mockData.currentUser.about = about

  return mockData.currentUser
}

export async function updateUserSettings(settings: any): Promise<User> {
  await delay(600)

  mockData.currentUser.settings = {
    ...mockData.currentUser.settings,
    ...settings,
  }

  return mockData.currentUser
}

// Chat APIs
export async function fetchChats(): Promise<Chat[]> {
  await delay(700)
  return mockData.chats
}

export async function fetchChatById(chatId: string): Promise<{ chat: Chat; messages: Message[] }> {
  await delay(600)

  const chat = mockData.chats.find((c) => c.id === chatId)
  if (!chat) {
    throw new Error("Chat not found")
  }

  const messages = mockData.messages[chatId] || []

  return { chat, messages }
}

export async function createChat(participantId: string): Promise<{ chatId: string }> {
  await delay(800)

  // Check if chat already exists
  const existingChat = mockData.chats.find(
    (chat) => !chat.isGroup && chat.participants?.some((p) => p.id === participantId),
  )

  if (existingChat) {
    return { chatId: existingChat.id }
  }

  // Create new chat
  const participant = mockData.contacts.find((c) => c.id === participantId)
  if (!participant) {
    throw new Error("Contact not found")
  }

  const newChatId = `chat-${Date.now()}`
  const newChat: Chat = {
    id: newChatId,
    name: participant.name,
    avatar: participant.avatar,
    lastMessage: "",
    lastMessageTime: new Date().toISOString(),
    unreadCount: 0,
    isGroup: false,
    participants: [
      { id: mockData.currentUser.id, name: mockData.currentUser.name, role: "member" },
      { id: participant.id, name: participant.name, role: "member" },
    ],
    isOnline: participant.status === "online",
  }

  // Add to mock data
  mockData.chats.unshift(newChat)
  mockData.messages[newChatId] = []

  return { chatId: newChatId }
}

export async function sendMessageApi(
  chatId: string,
  content: string,
  attachments: Attachment[] = [],
): Promise<Message> {
  await delay(400)

  const chat = mockData.chats.find((c) => c.id === chatId)
  if (!chat) {
    throw new Error("Chat not found")
  }

  const newMessage: Message = {
    id: `msg-${Date.now()}`,
    content,
    senderId: mockData.currentUser.id,
    senderName: mockData.currentUser.name,
    timestamp: new Date().toISOString(),
    status: "sent",
    attachments: attachments.length > 0 ? attachments : undefined,
  }

  // Add to mock data
  if (!mockData.messages[chatId]) {
    mockData.messages[chatId] = []
  }
  mockData.messages[chatId].push(newMessage)

  // Update chat last message
  chat.lastMessage = content
  chat.lastMessageTime = newMessage.timestamp
  chat.unreadCount = 0

  // Simulate message status updates
  setTimeout(() => {
    newMessage.status = "delivered"
  }, 1000)

  setTimeout(() => {
    newMessage.status = "read"
  }, 3000)

  return newMessage
}

// Contact APIs
export async function fetchContacts(): Promise<Contact[]> {
  await delay(600)
  return mockData.contacts
}

// Group APIs
export async function createNewGroup(formData: FormData): Promise<Group> {
  await delay(1000)

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const participantsJson = formData.get("participants") as string

  if (!name) {
    throw new Error("Group name is required")
  }

  let participants = []
  try {
    const participantIds = JSON.parse(participantsJson || "[]")
    participants = participantIds.map((id: string) => {
      const contact = mockData.contacts.find((c) => c.id === id)
      return {
        id: contact?.id || id,
        name: contact?.name || "Unknown",
        role: "member",
        avatar: contact?.avatar,
        status: contact?.status,
      }
    })
  } catch (error) {
    console.error("Failed to parse participants:", error)
  }

  // Add current user as admin
  participants.unshift({
    id: mockData.currentUser.id,
    name: mockData.currentUser.name,
    role: "admin",
    avatar: mockData.currentUser.avatar,
    status: mockData.currentUser.status,
  })

  const newGroupId = `group-${Date.now()}`
  const newGroup: Group = {
    id: newGroupId,
    name,
    description: description || "",
    avatar: "/placeholder.svg?height=40&width=40",
    participants,
    createdBy: mockData.currentUser.id,
    createdAt: new Date().toISOString(),
    settings: {
      onlyAdminsCanMessage: false,
      onlyAdminsCanEditInfo: true,
      disappearingMessages: false,
    },
  }

  // Add to mock data
  mockData.groups.push(newGroup)

  // Also add to chats
  const newChat: Chat = {
    id: newGroupId,
    name,
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Group created",
    lastMessageTime: new Date().toISOString(),
    unreadCount: 0,
    isGroup: true,
    participants,
    description: description || "",
    createdBy: mockData.currentUser.id,
    createdAt: new Date().toISOString(),
  }

  mockData.chats.unshift(newChat)
  mockData.messages[newGroupId] = [
    {
      id: `msg-${Date.now()}`,
      content: "Group created",
      senderId: mockData.currentUser.id,
      senderName: mockData.currentUser.name,
      timestamp: new Date().toISOString(),
      status: "sent",
    },
  ]

  return newGroup
}

export async function fetchGroupById(groupId: string): Promise<Group> {
  await delay(500)

  const group = mockData.groups.find((g) => g.id === groupId)
  if (!group) {
    throw new Error("Group not found")
  }

  return group
}

export async function updateGroupSettings(groupId: string, formData: FormData): Promise<Group> {
  await delay(800)

  const group = mockData.groups.find((g) => g.id === groupId)
  if (!group) {
    throw new Error("Group not found")
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const settingsJson = formData.get("settings") as string

  if (name) group.name = name
  if (description !== null) group.description = description

  if (settingsJson) {
    try {
      const settings = JSON.parse(settingsJson)
      group.settings = {
        ...group.settings,
        ...settings,
      }
    } catch (error) {
      console.error("Failed to parse settings:", error)
    }
  }

  // Update corresponding chat
  const chat = mockData.chats.find((c) => c.id === groupId)
  if (chat) {
    if (name) chat.name = name
    if (description !== null) chat.description = description
  }

  return group
}

export async function removeGroupParticipant(groupId: string, participantId: string): Promise<void> {
  await delay(600)

  const group = mockData.groups.find((g) => g.id === groupId)
  if (!group) {
    throw new Error("Group not found")
  }

  group.participants = group.participants.filter((p) => p.id !== participantId)

  // Update corresponding chat
  const chat = mockData.chats.find((c) => c.id === groupId)
  if (chat && chat.participants) {
    chat.participants = chat.participants.filter((p) => p.id !== participantId)
  }
}

export async function makeGroupAdmin(groupId: string, participantId: string): Promise<void> {
  await delay(500)

  const group = mockData.groups.find((g) => g.id === groupId)
  if (!group) {
    throw new Error("Group not found")
  }

  const participant = group.participants.find((p) => p.id === participantId)
  if (participant) {
    participant.role = "admin"
  }

  // Update corresponding chat
  const chat = mockData.chats.find((c) => c.id === groupId)
  if (chat && chat.participants) {
    const chatParticipant = chat.participants.find((p) => p.id === participantId)
    if (chatParticipant) {
      chatParticipant.role = "admin"
    }
  }
}

export async function deleteGroup(groupId: string): Promise<void> {
  await delay(800)

  const groupIndex = mockData.groups.findIndex((g) => g.id === groupId)
  if (groupIndex !== -1) {
    mockData.groups.splice(groupIndex, 1)
  }

  const chatIndex = mockData.chats.findIndex((c) => c.id === groupId)
  if (chatIndex !== -1) {
    mockData.chats.splice(chatIndex, 1)
  }

  delete mockData.messages[groupId]
}
