"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import mockData from "@/lib/mock-data"

// Mock socket events
type SocketEvent =
  | "connect"
  | "disconnect"
  | "join-chat"
  | "leave-chat"
  | "send-message"
  | "new-message"
  | "typing"
  | "user-typing"
  | "message-received"
  | "message-status-update"
  | "user-online"
  | "user-offline"

interface SocketContextType {
  isConnected: boolean
  onlineUsers: string[]
  socket: {
    on: (event: SocketEvent, callback: (...args: any[]) => void) => void
    off: (event: SocketEvent, callback: (...args: any[]) => void) => void
    emit: (event: SocketEvent, data: any) => void
  }
}

const SocketContext = createContext<SocketContextType>({
  isConnected: false,
  onlineUsers: [],
  socket: {
    on: () => {},
    off: () => {},
    emit: () => {},
  },
})

export const useSocket = () => useContext(SocketContext)

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<string[]>(mockData.onlineUsers)

  // Event listeners storage
  const eventListeners: Record<string, ((...args: any[]) => void)[]> = {}

  // Mock socket implementation
  const mockSocket = {
    on: (event: SocketEvent, callback: (...args: any[]) => void) => {
      if (!eventListeners[event]) {
        eventListeners[event] = []
      }
      eventListeners[event].push(callback)
    },

    off: (event: SocketEvent, callback: (...args: any[]) => void) => {
      if (eventListeners[event]) {
        eventListeners[event] = eventListeners[event].filter((cb) => cb !== callback)
      }
    },

    emit: (event: SocketEvent, data: any) => {
      console.log(`Socket emit: ${event}`, data)

      // Handle specific events
      switch (event) {
        case "join-chat":
          // Nothing to do for mock
          break

        case "leave-chat":
          // Nothing to do for mock
          break

        case "send-message":
          // Simulate receiving a message after a delay
          setTimeout(() => {
            const { chatId, message } = data
            triggerEvent("new-message", message)

            // Simulate message status updates
            setTimeout(() => {
              triggerEvent("message-status-update", {
                messageId: message.id,
                status: "delivered",
              })

              setTimeout(() => {
                triggerEvent("message-status-update", {
                  messageId: message.id,
                  status: "read",
                })
              }, 2000)
            }, 1000)
          }, 500)
          break

        case "typing":
          // Simulate typing indicator
          const { chatId, userId, username, isTyping } = data
          triggerEvent("user-typing", { userId, username, isTyping })
          break
      }
    },
  }

  // Helper to trigger events
  const triggerEvent = (event: SocketEvent, data: any) => {
    if (eventListeners[event]) {
      eventListeners[event].forEach((callback) => callback(data))
    }
  }

  // Simulate connection
  useEffect(() => {
    const connectTimeout = setTimeout(() => {
      setIsConnected(true)
      triggerEvent("connect", {})

      // Simulate random user online/offline events
      const interval = setInterval(() => {
        const randomUser = mockData.contacts[Math.floor(Math.random() * mockData.contacts.length)]
        const isOnline = Math.random() > 0.5

        if (isOnline && !onlineUsers.includes(randomUser.id)) {
          setOnlineUsers((prev) => [...prev, randomUser.id])
          triggerEvent("user-online", { userId: randomUser.id })
        } else if (!isOnline && onlineUsers.includes(randomUser.id)) {
          setOnlineUsers((prev) => prev.filter((id) => id !== randomUser.id))
          triggerEvent("user-offline", { userId: randomUser.id })
        }
      }, 30000) // Every 30 seconds

      return () => {
        clearInterval(interval)
        setIsConnected(false)
        triggerEvent("disconnect", {})
      }
    }, 1000)

    return () => clearTimeout(connectTimeout)
  }, [])

  return (
    <SocketContext.Provider value={{ isConnected, onlineUsers, socket: mockSocket }}>{children}</SocketContext.Provider>
  )
}
