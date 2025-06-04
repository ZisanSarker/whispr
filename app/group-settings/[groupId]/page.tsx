"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Camera, Save, UserMinus, Crown, Trash2 } from "lucide-react"
import { fetchGroupById, updateGroupSettings, removeGroupParticipant, makeGroupAdmin, deleteGroup } from "@/lib/api"
import type { Group } from "@/types"
import { toast } from "sonner"
import { LoadingScreen } from "@/components/loading-screen"
import { useAuth } from "@/components/auth-provider"

export default function GroupSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const groupId = params.groupId as string

  const [group, setGroup] = useState<Group | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [groupName, setGroupName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")
  const [settings, setSettings] = useState({
    onlyAdminsCanMessage: false,
    onlyAdminsCanEditInfo: true,
    disappearingMessages: false,
  })

  useEffect(() => {
    const loadGroup = async () => {
      setIsLoading(true)
      try {
        const groupData = await fetchGroupById(groupId)
        setGroup(groupData)
        setGroupName(groupData.name)
        setGroupDescription(groupData.description || "")
        setSettings(groupData.settings || settings)
      } catch (error) {
        console.error("Failed to load group:", error)
        toast.error("Failed to load group")
      } finally {
        setIsLoading(false)
      }
    }

    if (groupId) {
      loadGroup()
    }
  }, [groupId])

  const handleBack = () => {
    router.push(`/chats/${groupId}`)
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const formData = new FormData()
      formData.append("name", groupName)
      formData.append("description", groupDescription)
      formData.append("settings", JSON.stringify(settings))

      const updatedGroup = await updateGroupSettings(groupId, formData)
      setGroup(updatedGroup)
      toast.success("Group settings updated successfully")
    } catch (error) {
      console.error("Failed to update group settings:", error)
      toast.error("Failed to update group settings")
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveParticipant = async (participantId: string) => {
    try {
      await removeGroupParticipant(groupId, participantId)
      setGroup((prev) =>
        prev
          ? {
              ...prev,
              participants: prev.participants.filter((p) => p.id !== participantId),
            }
          : null,
      )
      toast.success("Participant removed successfully")
    } catch (error) {
      console.error("Failed to remove participant:", error)
      toast.error("Failed to remove participant")
    }
  }

  const handleMakeAdmin = async (participantId: string) => {
    try {
      await makeGroupAdmin(groupId, participantId)
      setGroup((prev) =>
        prev
          ? {
              ...prev,
              participants: prev.participants.map((p) => (p.id === participantId ? { ...p, isAdmin: true } : p)),
            }
          : null,
      )
      toast.success("Participant is now an admin")
    } catch (error) {
      console.error("Failed to make admin:", error)
      toast.error("Failed to make admin")
    }
  }

  const handleDeleteGroup = async () => {
    if (!confirm("Are you sure you want to delete this group? This action cannot be undone.")) {
      return
    }

    try {
      await deleteGroup(groupId)
      toast.success("Group deleted successfully")
      router.push("/chats")
    } catch (error) {
      console.error("Failed to delete group:", error)
      toast.error("Failed to delete group")
    }
  }

  const isCurrentUserAdmin = group?.participants.find((p) => p.id === user?.id || p.id === "current-user")?.isAdmin

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Group not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Group Settings</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Group Info */}
        <Card>
          <CardHeader>
            <CardTitle>Group Information</CardTitle>
            <CardDescription>Update group details and settings</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveSettings} className="space-y-4">
              {/* Group Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={group.avatar || "/placeholder.svg"} alt={group.name} />
                  <AvatarFallback className="text-lg">{group.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {isCurrentUserAdmin && (
                  <Button variant="outline" size="sm" type="button">
                    <Camera className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                )}
              </div>

              {/* Group Name */}
              <div className="space-y-2">
                <Label htmlFor="groupName">Group Name</Label>
                <Input
                  id="groupName"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  disabled={!isCurrentUserAdmin}
                />
              </div>

              {/* Group Description */}
              <div className="space-y-2">
                <Label htmlFor="groupDescription">Description</Label>
                <Textarea
                  id="groupDescription"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  disabled={!isCurrentUserAdmin}
                  rows={3}
                />
              </div>

              {isCurrentUserAdmin && (
                <Button type="submit" disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Group Settings */}
        {isCurrentUserAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Group Settings</CardTitle>
              <CardDescription>Configure group permissions and features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="onlyAdminsCanMessage">Only Admins Can Send Messages</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Restrict messaging to group admins only</p>
                </div>
                <Switch
                  id="onlyAdminsCanMessage"
                  checked={settings.onlyAdminsCanMessage}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, onlyAdminsCanMessage: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="onlyAdminsCanEditInfo">Only Admins Can Edit Group Info</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Restrict group info editing to admins only</p>
                </div>
                <Switch
                  id="onlyAdminsCanEditInfo"
                  checked={settings.onlyAdminsCanEditInfo}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, onlyAdminsCanEditInfo: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="disappearingMessages">Disappearing Messages</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Messages will disappear after 24 hours</p>
                </div>
                <Switch
                  id="disappearingMessages"
                  checked={settings.disappearingMessages}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, disappearingMessages: checked }))}
                />
              </div>

              <Button onClick={handleSaveSettings} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Settings"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Participants */}
        <Card>
          <CardHeader>
            <CardTitle>Participants ({group.participants.length})</CardTitle>
            <CardDescription>Manage group members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {group.participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/placeholder.svg" alt={participant.name} />
                    <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{participant.name}</p>
                      {participant.isAdmin && (
                        <Badge variant="secondary" className="text-xs">
                          <Crown className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{participant.status || "No status"}</p>
                  </div>

                  {isCurrentUserAdmin && participant.id !== user?.id && participant.id !== "current-user" && (
                    <div className="flex gap-2">
                      {!participant.isAdmin && (
                        <Button variant="outline" size="sm" onClick={() => handleMakeAdmin(participant.id)}>
                          <Crown className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveParticipant(participant.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        {isCurrentUserAdmin && (
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={handleDeleteGroup} className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Group
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
