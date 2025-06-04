import type { Chat, Contact, Group, Message, User } from "@/types"
import {
  mockCurrentUser,
  mockChats,
  mockContacts,
  mockGroups,
  simulateDelay,
  getChatById,
  getMessagesByChatId,
  addMessageToChat,
  getUserById,
} from "./mock-data"

// Authentication APIs
export async function loginApi(email: string, password: string): Promise<{ user: User; token: string }> {
  await simulateDelay(800) // Simulate network delay

  // For demo purposes, accept any email/password combination
  if (email && password) {
    return {
      user: mockCurrentUser,
      token: "mock-jwt-token-" + Date.now(),
    }
  }

  throw new Error("Invalid credentials")
}

export async function signupApi(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
  await simulateDelay(1000)

  if (name && email && password) {
    const newUser: User = {
      ...mockCurrentUser,
      name,
      email,
      id: "user-" + Date.now(),
    }

    return {
      user: newUser,
      token: "mock-jwt-token-" + Date.now(),
    }
  }

  throw new Error("Invalid registration data")
}

export async function logoutApi(): Promise<void> {
  await simulateDelay(300)
  return Promise.resolve()
}

export async function fetchCurrentUser(): Promise<User> {
  await simulateDelay(500)

  const token = localStorage.getItem("token")
  if (!token) {
    throw new Error("No authentication token")
  }

  return mockCurrentUser
}

// User APIs
export async function updateUserProfile(formData: FormData): Promise<User> {
  await simulateDelay(800)

  const name = formData.get("name") as string
  const about = formData.get("about") as string

  if (name) mockCurrentUser.name = name
  if (about) mockCurrentUser.about = about

  return mockCurrentUser
}

export async function updateUserSettings(settings: any): Promise<User> {
  await simulateDelay(600)

  mockCurrentUser.settings = { ...mockCurrentUser.settings, ...settings }
  return mockCurrentUser
}

// Chat APIs
export async function fetchChats(): Promise<Chat[]> {
  await simulateDelay(700)
  return [...mockChats]
}

export async function fetchChatById(chatId: string): Promise<{ chat: Chat; messages: Message[] }> {
  await simulateDelay(600)

  const chat = getChatById(chatId)
  if (!chat) {
    throw new Error("Chat not found")
  }

  const messages = getMessagesByChatId(chatId)

  return { chat, messages }
}

export async function createChat(participantId: string): Promise<{ chatId: string }> {
  await simulateDelay(800)

  // Check if chat already exists
  const existingChat = mockChats.find((chat) => !chat.isGroup && chat.participants?.some((p) => p.id === participantId))

  if (existingChat) {
    return { chatId: existingChat.id }
  }

  // Create new chat
  const participant = getUserById(participantId)
  if (!participant) {
    throw new Error("User not found")
  }

  const newChatId = "chat-" + Date.now()
  const newChat: Chat = {
    id: newChatId,
    name: participant.name,
    avatar: participant.avatar || "/placeholder.svg?height=40&width=40",
    lastMessage: "",
    lastMessageTime: new Date().toISOString(),
    unreadCount: 0,
    isGroup: false,
    participants: [
      { id: "current-user", name: "John Doe", role: "member" },
      { id: participantId, name: participant.name, role: "member" },
    ],
    isOnline: participant.status === "online",
  }

  mockChats.unshift(newChat)
  return { chatId: newChatId }
}

export async function sendMessageApi(chatId: string, content: string, attachments: any[] = []): Promise<Message> {
  await simulateDelay(400)

  const newMessage: Message = {
    id: "msg-" + Date.now(),
    content,
    senderId: "current-user",
    senderName: "John Doe",
    timestamp: new Date().toISOString(),
    status: "sent",
    attachments: attachments.length > 0 ? attachments : undefined,
  }

  addMessageToChat(chatId, newMessage)

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
  await simulateDelay(600)
  return [...mockContacts]
}

// Group APIs
export async function createNewGroup(formData: FormData): Promise<Group> {
  await simulateDelay(1000)

  const name = formData.get("name") as string
  const description = formData.get("description") as string

  if (!name) {
    throw new Error("Group name is required")
  }

  const newGroup: Group = {
    id: "group-" + Date.now(),
    name,
    description: description || "",
    avatar: "/placeholder.svg?height=40&width=40",
    participants: [{ id: "current-user", name: "John Doe", role: "admin" }],
    createdBy: "current-user",
    createdAt: new Date().toISOString(),
    settings: {
      onlyAdminsCanMessage: false,
      onlyAdminsCanEditInfo: true,
      disappearingMessages: false,
    },
  }

  mockGroups.push(newGroup)

  // Also add to chats
  const newChat: Chat = {
    id: newGroup.id,
    name: newGroup.name,
    avatar: newGroup.avatar,
    lastMessage: "Group created",
    lastMessageTime: new Date().toISOString(),
    unreadCount: 0,
    isGroup: true,
    participants: newGroup.participants,
    description: newGroup.description,
    createdBy: newGroup.createdBy,
    createdAt: newGroup.createdAt,
  }

  mockChats.unshift(newChat)

  return newGroup
}

export async function fetchGroupById(groupId: string): Promise<Group> {
  await simulateDelay(500)

  const group = mockGroups.find((g) => g.id === groupId)
  if (!group) {
    throw new Error("Group not found")
  }

  return group
}

export async function updateGroupSettings(groupId: string, formData: FormData): Promise<Group> {
  await simulateDelay(800)

  const group = mockGroups.find((g) => g.id === groupId)
  if (!group) {
    throw new Error("Group not found")
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string

  if (name) group.name = name
  if (description !== null) group.description = description

  // Update corresponding chat
  const chat = getChatById(groupId)
  if (chat) {
    if (name) chat.name = name
    if (description !== null) chat.description = description
  }

  return group
}

export async function removeGroupParticipant(groupId: string, participantId: string): Promise<void> {
  await simulateDelay(600)

  const group = mockGroups.find((g) => g.id === groupId)
  if (!group) {
    throw new Error("Group not found")
  }

  group.participants = group.participants.filter((p) => p.id !== participantId)

  // Update corresponding chat
  const chat = getChatById(groupId)
  if (chat) {
    chat.participants = chat.participants?.filter((p) => p.id !== participantId)
  }
}

export async function makeGroupAdmin(groupId: string, participantId: string): Promise<void> {
  await simulateDelay(500)

  const group = mockGroups.find((g) => g.id === groupId)
  if (!group) {
    throw new Error("Group not found")
  }

  const participant = group.participants.find((p) => p.id === participantId)
  if (participant) {
    participant.role = "admin"
  }

  // Update corresponding chat
  const chat = getChatById(groupId)
  if (chat) {
    const chatParticipant = chat.participants?.find((p) => p.id === participantId)
    if (chatParticipant) {
      chatParticipant.role = "admin"
    }
  }
}

export async function deleteGroup(groupId: string): Promise<void> {
  await simulateDelay(800)

  const groupIndex = mockGroups.findIndex((g) => g.id === groupId)
  if (groupIndex !== -1) {
    mockGroups.splice(groupIndex, 1)
  }

  const chatIndex = mockChats.findIndex((c) => c.id === groupId)
  if (chatIndex !== -1) {
    mockChats.splice(chatIndex, 1)
  }
}
