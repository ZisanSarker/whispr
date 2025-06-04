"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowLeft, Phone, Video, MoreVertical, Search, UserPlus, Settings, Archive, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn, getInitials } from "@/lib/utils"
import type { Chat } from "@/types"

interface ChatHeaderProps {
  chat: Chat
  onBack?: () => void
  onCall?: () => void
  onVideoCall?: () => void
  onSearch?: () => void
  onAddParticipant?: () => void
  onSettings?: () => void
  onArchive?: () => void
  onDelete?: () => void
}

export function ChatHeader({
  chat,
  onBack,
  onCall,
  onVideoCall,
  onSearch,
  onAddParticipant,
  onSettings,
  onArchive,
  onDelete,
}: ChatHeaderProps) {
  const getStatusText = () => {
    if (chat.isGroup) {
      const participantCount = chat.participants?.length || 0
      return `${participantCount} participants`
    }

    if (chat.isOnline) {
      return "online"
    }

    return "last seen recently"
  }

  const getStatusColor = () => {
    if (chat.isGroup) return "text-gray-500"
    return chat.isOnline ? "text-green-500" : "text-gray-500"
  }

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}

        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={chat.avatar || "/placeholder.svg"} />
            <AvatarFallback>{getInitials(chat.name)}</AvatarFallback>
          </Avatar>
          {!chat.isGroup && chat.isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-gray-900 dark:text-white truncate">{chat.name}</h2>
            {chat.isGroup && (
              <Badge variant="secondary" className="text-xs">
                Group
              </Badge>
            )}
          </div>
          <p className={cn("text-sm truncate", getStatusColor())}>{getStatusText()}</p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {onCall && (
          <Button variant="ghost" size="icon" onClick={onCall}>
            <Phone className="h-5 w-5" />
          </Button>
        )}

        {onVideoCall && (
          <Button variant="ghost" size="icon" onClick={onVideoCall}>
            <Video className="h-5 w-5" />
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onSearch && (
              <DropdownMenuItem onClick={onSearch}>
                <Search className="mr-2 h-4 w-4" />
                Search
              </DropdownMenuItem>
            )}

            {chat.isGroup && onAddParticipant && (
              <DropdownMenuItem onClick={onAddParticipant}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add participant
              </DropdownMenuItem>
            )}

            {onSettings && (
              <DropdownMenuItem onClick={onSettings}>
                <Settings className="mr-2 h-4 w-4" />
                {chat.isGroup ? "Group settings" : "Contact info"}
              </DropdownMenuItem>
            )}

            {onArchive && (
              <DropdownMenuItem onClick={onArchive}>
                <Archive className="mr-2 h-4 w-4" />
                Archive chat
              </DropdownMenuItem>
            )}

            {onDelete && (
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete chat
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
