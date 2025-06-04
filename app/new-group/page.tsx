"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Users, Loader2, Camera } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { fetchContacts, createNewGroup } from "@/lib/mock-api"
import { useToast } from "@/hooks/use-toast"
import { getInitials } from "@/lib/utils"
import type { Contact } from "@/types"

export default function NewGroupPage() {
  const [groupName, setGroupName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login")
      return
    }

    loadContacts()
  }, [isAuthenticated, router])

  const loadContacts = async () => {
    try {
      const contactsData = await fetchContacts()
      setContacts(contactsData)
    } catch (error) {
      console.error("Failed to load contacts:", error)
      toast({
        title: "Error",
        description: "Failed to load contacts. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleContactToggle = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    )
  }

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast({
        title: "Error",
        description: "Group name is required",
        variant: "destructive",
      })
      return
    }

    if (selectedContacts.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one contact",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    try {
      const formData = new FormData()
      formData.append("name", groupName)
      formData.append("description", groupDescription)
      formData.append("participants", JSON.stringify(selectedContacts))

      const group = await createNewGroup(formData)
      
      toast({
        title: "Success",
        description: "Group created successfully",
      })
      
      router.push(`/chats/${group.id}`)
    } catch (error) {
      console.error("Failed to create group:", error)
      toast({
        title: "Error",
        description: "Failed to create group. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold">New Group</h1>
        </div>

        <div className="space-y-6">
          {/* Group Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Group Information
              </CardTitle>
              <CardDescription>
                Set up your group details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Group Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="/placeholder.svg?height=80&width=80" />
                    <AvatarFallback className="text-lg">
                      {getInitials(groupName || "Group")}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">
                    Add a group photo to help members identify your group
                  </p>
                </div>
              </div>

              {/* Group Name */}
              <div className="space-y-2">
                <Label htmlFor="groupName">Group Name *</Label>
                <Input
                  id="groupName"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name"
                  maxLength={50}
                />
                <p className="text-xs text-gray-500">
                  {groupName.length}/50 characters
                </p>
              </div>

              {/* Group Description */}
              <div className="space-y-2">
                <Label htmlFor="groupDescription">Description (Optional)</Label>
                <Textarea
                  id="groupDescription"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder="Add a group description"
                  rows={3}
                  maxLength={200}
                />
                <p className="text-xs text-gray-500">
                  {groupDescription.length}/200 characters
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Add Participants</CardTitle>
              <CardDescription>
                Select contacts to add to your group ({selectedContacts.length} selected)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : contacts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No contacts available
                </div>
              ) : (
                <ScrollArea className="h-80">
                  <div className="space-y-2">
                    {contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <Checkbox
                          id={contact.id}
                          checked={selectedContacts.includes(contact.id)}
                          onCheckedChange={() => handleContactToggle(contact.id)}
                        />
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={contact.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {getInitials(contact.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="\
