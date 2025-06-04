// Enhanced authentication service with profile management

interface User {
  id: string
  name: string
  phone: string
  avatar?: string
  status?: string
  lastSeen?: string
}

// Mock user data
const MOCK_USER: User = {
  id: "current-user",
  name: "John Doe",
  phone: "+1234567890",
  avatar: "/placeholder.svg?height=40&width=40",
  status: "Hey there! I'm using WhatsApp Enterprise.",
  lastSeen: new Date().toISOString(),
}

// Mock session storage
let currentSession: User | null = null

export function getSession(): User | null {
  return currentSession
}

export function getCurrentUser(): User | null {
  return currentSession
}

export async function login(phone: string, password: string): Promise<User> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // For demo purposes, accept specific credentials or any non-empty values
      if ((phone === "+1234567890" && password === "password123") || (phone && password)) {
        currentSession = { ...MOCK_USER, phone }
        resolve(currentSession)
      } else {
        reject(new Error("Invalid credentials"))
      }
    }, 800)
  })
}

export async function signup(name: string, phone: string, password: string): Promise<User> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newUser: User = {
        id: "current-user",
        name,
        phone,
        avatar: "/placeholder.svg?height=40&width=40",
        status: "Hey there! I'm using WhatsApp Enterprise.",
        lastSeen: new Date().toISOString(),
      }
      currentSession = newUser
      resolve(newUser)
    }, 800)
  })
}

export async function updateProfile(profileData: Partial<User>): Promise<User> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (currentSession) {
        currentSession = { ...currentSession, ...profileData }
        resolve(currentSession)
      } else {
        reject(new Error("No active session"))
      }
    }, 500)
  })
}

export async function logout(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      currentSession = null
      resolve()
    }, 300)
  })
}
