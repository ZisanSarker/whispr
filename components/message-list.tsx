"use client"

import { useEffect, useRef, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Check, CheckCheck, Clock, MoreVertical, Reply, Copy, Trash2, Forward } from "lucide-react"
import { cn, formatTime, formatDate, getInitials } from "@/lib/utils"
import type { Message } from "@/types"

interface MessageListProps {
  messages: Message[]
  currentUserId: string
  isLoading?: boolean
  onReply?: (message: Message) => void
  onForward?: (message: Message) => void
  onDelete?: (messageId: string) => void
}

export function MessageList({
  messages,
  currentUserId,
  isLoading = false,
  onReply,
  onForward,
  onDelete,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "sending":
        return <Clock className="h-3 w-3 text-gray-400" />
      case "sent":
        return <Check className="h-3 w-3 text-gray-400" />
      case "delivered":
        return <CheckCheck className="h-3 w-3 text-gray-400" />
      case "read":
        return <CheckCheck className="h-3 w-3 text-blue-500" />
      case "failed":
        return <Clock className="h-3 w-3 text-red-500" />
      default:
        return null
    }
  }

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = []
    let currentDate = ""

    messages.forEach((message) => {
      const messageDate = formatDate(message.timestamp)
      if (messageDate !== currentDate) {
        currentDate = messageDate
        groups.push({ date: messageDate, messages: [message] })
      } else {
        groups[groups.length - 1].messages.push(message)
      }
    })

    return groups
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p>No messages yet</p>
          <p className="text-sm">Start a conversation!</p>
        </div>
      </div>
    )
  }

  const messageGroups = groupMessagesByDate(messages)

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messageGroups.map((group, groupIndex) => (
        <div key={groupIndex}>
          {/* Date separator */}
          <div className="flex justify-center my-4">
            <Badge variant="secondary" className="text-xs">
              {group.date}
            </Badge>
          </div>

          {/* Messages for this date */}
          {group.messages.map((message, index) => {
            const isOwn = message.senderId === currentUserId
            const showAvatar =
              !isOwn &&
              (index === group.messages.length - 1 || group.messages[index + 1]?.senderId !== message.senderId)

            return (
              <div key={message.id} className={cn("flex gap-2 group", isOwn ? "justify-end" : "justify-start")}>
                {!isOwn && (
                  <Avatar className={cn("h-8 w-8", !showAvatar && "invisible")}>
                    <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                    <AvatarFallback className="text-xs">{getInitials(message.senderName)}</AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={cn(
                    "max-w-[70%] rounded-lg px-3 py-2 relative",
                    isOwn
                      ? "bg-green-500 text-white"
                      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
                  )}
                >
                  {/* Reply indicator */}
                  {message.replyTo && (
                    <div
                      className={cn(
                        "border-l-4 pl-2 mb-2 text-xs opacity-70",
                        isOwn ? "border-green-300" : "border-gray-400",
                      )}
                    >
                      <div className="font-medium">{message.replyTo.senderName}</div>
                      <div className="truncate">{message.replyTo.content}</div>
                    </div>
                  )}

                  {/* Sender name for group chats */}
                  {!isOwn && showAvatar && (
                    <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                      {message.senderName}
                    </div>
                  )}

                  {/* Message content */}
                  <div className="break-words whitespace-pre-wrap">{message.content}</div>

                  {/* Attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {message.attachments.map((attachment, attachIndex) => (
                        <div
                          key={attachIndex}
                          className={cn(
                            "p-2 rounded border",
                            isOwn
                              ? "bg-green-400 border-green-300"
                              : "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600",
                          )}
                        >
                          <div className="text-sm font-medium">{attachment.name}</div>
                          <div className="text-xs opacity-70">{(attachment.size / 1024).toFixed(1)} KB</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Message time and status */}
                  <div
                    className={cn("flex items-center gap-1 mt-1 text-xs", isOwn ? "text-green-100" : "text-gray-500")}
                  >
                    <span>{formatTime(message.timestamp)}</span>
                    {isOwn && getStatusIcon(message.status)}
                  </div>

                  {/* Message actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity",
                          isOwn ? "bg-green-600 hover:bg-green-700 text-white" : "bg-gray-200 hover:bg-gray-300",
                        )}
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onReply && (
                        <DropdownMenuItem onClick={() => onReply(message)}>
                          <Reply className="mr-2 h-4 w-4" />
                          Reply
                        </DropdownMenuItem>
                      )}
                      {onForward && (
                        <DropdownMenuItem onClick={() => onForward(message)}>
                          <Forward className="mr-2 h-4 w-4" />
                          Forward
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleCopyMessage(message.content)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </DropdownMenuItem>
                      {isOwn && onDelete && (
                        <DropdownMenuItem onClick={() => onDelete(message.id)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )
          })}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}
