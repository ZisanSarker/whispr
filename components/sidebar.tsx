"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { MessageCircle, Users, Settings, LogOut, Search, Plus, Archive, Star } from "lucide-react"
import { cn, formatRelativeTime, truncateText, getInitials } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"
import { fetchChats, fetchContacts, createChat } from "@/lib/mock-api"
import type { Chat, Contact } from "@/types"

export function Sidebar() {
  const [chats, setChats] = useState<Chat[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [showNewChatDialog, setShowNewChatDialog] = useState(false)
  const [activeTab, setActiveTab] = useState<"chats" | "archived" | "starred">("chats")

  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    loadChats()
    loadContacts()
  }, [])

  const loadChats = async () => {
    try {
      const chatsData = await fetchChats()
      setChats(chatsData)
    } catch (error) {
      console.error("Failed to load chats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadContacts = async () => {
    try {
      const contactsData = await fetchContacts()
      setContacts(contactsData)
    } catch (error) {
      console.error("Failed to load contacts:", error)
    }
  }

  const handleChatClick = (chatId: string) => {
    router.push(`/chats/${chatId}`)
  }

  const handleNewChat = async (contactId: string) => {
    try {
      const { chatId } = await createChat(contactId)
      setShowNewChatDialog(false)
      router.push(`/chats/${chatId}`)
      // Refresh chats
      loadChats()
    } catch (error) {
      console.error("Failed to create chat:", error)
    }
  }

  const handleNewGroup = () => {
    setShowNewChatDialog(false)
    router.push("/new-group")
  }

  const filteredChats = chats.filter(
    (chat) =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredContacts = contacts.filter(
    (contact) => contact.name.toLowerCase().includes(searchQuery.toLowerCase()) || contact.phone.includes(searchQuery),
  )

  return (
    <div className="w-80 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">WhatsApp</h1>

          <div className="flex items-center gap-2">
            <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Plus className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start a new conversation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Button onClick={handleNewGroup} className="w-full justify-start" variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    New Group
                  </Button>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Contacts</h4>
                    <ScrollArea className="h-60">
                      {filteredContacts.map((contact) => (
                        <Button
                          key={contact.id}
                          variant="ghost"
                          className="w-full justify-start p-2 h-auto"
                          onClick={() => handleNewChat(contact.id)}
                        >
                          <Avatar className="h-8 w-8 mr-3">
                            <AvatarImage src={contact.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">{getInitials(contact.name)}</AvatarFallback>
                          </Avatar>
                          <div className="text-left">
                            <div className="font-medium">{contact.name}</div>
                            <div className="text-xs text-gray-500">{contact.phone}</div>
                          </div>
                        </Button>
                      ))}
                    </ScrollArea>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">{getInitials(user?.name || "")}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <Button
          variant={activeTab === "chats" ? "default" : "ghost"}
          size="sm"
          className="flex-1 rounded-none"
          onClick={() => setActiveTab("chats")}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Chats
        </Button>
        <Button
          variant={activeTab === "archived" ? "default" : "ghost"}
          size="sm"
          className="flex-1 rounded-none"
          onClick={() => setActiveTab("archived")}
        >
          <Archive className="mr-2 h-4 w-4" />
          Archived
        </Button>
        <Button
          variant={activeTab === "starred" ? "default" : "ghost"}
          size="sm"
          className="flex-1 rounded-none"
          onClick={() => setActiveTab("starred")}
        >
          <Star className="mr-2 h-4 w-4" />
          Starred
        </Button>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">Loading chats...</div>
        ) : filteredChats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">{searchQuery ? "No chats found" : "No chats yet"}</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredChats.map((chat) => {
              const isActive = pathname === `/chats/${chat.id}`

              return (
                <div
                  key={chat.id}
                  className={cn(
                    "p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors",
                    isActive && "bg-green-50 dark:bg-green-900/20 border-r-2 border-green-500",
                  )}
                  onClick={() => handleChatClick(chat.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={chat.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{getInitials(chat.name)}</AvatarFallback>
                      </Avatar>
                      {!chat.isGroup && chat.isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">{chat.name}</h3>
                        <div className="flex items-center gap-2">
                          {chat.lastMessageTime && (
                            <span className="text-xs text-gray-500">{formatRelativeTime(chat.lastMessageTime)}</span>
                          )}
                          {chat.unreadCount > 0 && (
                            <Badge className="bg-green-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
                              {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-500 truncate">
                          {chat.lastMessage ? truncateText(chat.lastMessage, 40) : "No messages yet"}
                        </p>
                        {chat.isGroup && (
                          <Badge variant="secondary" className="text-xs ml-2">
                            {chat.participants?.length || 0}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
