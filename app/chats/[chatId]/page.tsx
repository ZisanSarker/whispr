"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ChatHeader } from "@/components/chat-header"
import { MessageList } from "@/components/message-list"
import { MessageInput } from "@/components/message-input"
import { LoadingScreen } from "@/components/loading-screen"
import { useAuth } from "@/components/auth-provider"
import { useSocket } from "@/components/socket-provider"
import { fetchChatById, sendMessageApi } from "@/lib/mock-api"
import { useToast } from "@/hooks/use-toast"
import type { Chat, Message, Attachment } from "@/types"

export default function ChatPage() {
  const [chat, setChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { socket } = useSocket()
  const { toast } = useToast()

  const chatId = params.chatId as string

  useEffect(() => {
    if (chatId) {
      loadChat()
    }
  }, [chatId])

  useEffect(() => {
    // Join chat room
    socket.emit("join-chat", { chatId })

    // Listen for new messages
    const handleNewMessage = (message: Message) => {
      if (message.senderId !== user?.id) {
        setMessages((prev) => [...prev, message])
      }
    }

    // Listen for message status updates
    const handleMessageStatusUpdate = ({ messageId, status }: { messageId: string; status: string }) => {
      setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, status } : msg)))
    }

    socket.on("new-message", handleNewMessage)
    socket.on("message-status-update", handleMessageStatusUpdate)

    return () => {
      socket.off("new-message", handleNewMessage)
      socket.off("message-status-update", handleMessageStatusUpdate)
      socket.emit("leave-chat", { chatId })
    }
  }, [chatId, socket, user?.id])

  const loadChat = async () => {
    try {
      setIsLoading(true)
      const { chat: chatData, messages: messagesData } = await fetchChatById(chatId)
      setChat(chatData)
      setMessages(messagesData)
    } catch (error) {
      console.error("Failed to load chat:", error)
      toast({
        title: "Error",
        description: "Failed to load chat. Please try again.",
        variant: "destructive",
      })
      router.push("/chats")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    if (!chat || !user) return

    setIsSending(true)
    try {
      // Convert files to attachment objects
      const attachmentObjects: Attachment[] =
        attachments?.map((file) => ({
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file), // In a real app, this would be uploaded to a server
        })) || []

      const newMessage = await sendMessageApi(chatId, content, attachmentObjects)

      // Add message to local state immediately
      setMessages((prev) => [...prev, newMessage])

      // Emit to socket for real-time updates
      socket.emit("send-message", { chatId, message: newMessage })
    } catch (error) {
      console.error("Failed to send message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleTyping = (isTyping: boolean) => {
    if (user) {
      socket.emit("typing", {
        chatId,
        userId: user.id,
        username: user.name,
        isTyping,
      })
    }
  }

  const handleBack = () => {
    router.push("/chats")
  }

  const handleCall = () => {
    toast({
      title: "Voice Call",
      description: "Voice calling feature coming soon!",
    })
  }

  const handleVideoCall = () => {
    toast({
      title: "Video Call",
      description: "Video calling feature coming soon!",
    })
  }

  const handleSettings = () => {
    if (chat?.isGroup) {
      router.push(`/group-settings/${chatId}`)
    } else {
      toast({
        title: "Contact Info",
        description: "Contact info feature coming soon!",
      })
    }
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p>Chat not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <ChatHeader
        chat={chat}
        onBack={handleBack}
        onCall={handleCall}
        onVideoCall={handleVideoCall}
        onSettings={handleSettings}
      />

      <MessageList messages={messages} currentUserId={user?.id || ""} isLoading={false} />

      <MessageInput onSendMessage={handleSendMessage} onTyping={handleTyping} disabled={isSending} />
    </div>
  )
}
