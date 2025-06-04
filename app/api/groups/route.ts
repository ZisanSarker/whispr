import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyAuth } from "@/lib/auth-utils"
import { uploadImage } from "@/lib/storage"

export async function POST(request: Request) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const userId = authResult.userId
    const formData = await request.formData()

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const participantsData = formData.get("participants") as string
    const avatarFile = formData.get("avatar") as File | null

    if (!name) {
      return NextResponse.json({ error: "Group name is required" }, { status: 400 })
    }

    let participants: string[] = []
    try {
      participants = JSON.parse(participantsData)
    } catch (e) {
      return NextResponse.json({ error: "Invalid participants data" }, { status: 400 })
    }

    if (!participants.length) {
      return NextResponse.json({ error: "At least one participant is required" }, { status: 400 })
    }

    let avatarUrl = null
    if (avatarFile) {
      avatarUrl = await uploadImage(avatarFile)
    }

    // Create group chat
    const group = await db.chat.create({
      data: {
        name,
        description,
        avatar: avatarUrl,
        isGroup: true,
        settings: {
          onlyAdminsCanMessage: false,
          onlyAdminsCanEditInfo: true,
          disappearingMessages: false,
        },
        participants: {
          create: [
            // Current user as admin
            { userId, isAdmin: true },
            // Other participants
            ...participants.map((participantId) => ({
              userId: participantId,
              isAdmin: false,
            })),
          ],
        },
      },
    })

    // Create system message
    await db.message.create({
      data: {
        content: `Group "${name}" created by ${userId}`,
        chatId: group.id,
        senderId: userId,
        isSystemMessage: true,
        status: "sent",
        readBy: [userId],
      },
    })

    return NextResponse.json({
      id: group.id,
      name: group.name,
      description: group.description,
      avatar: group.avatar,
    })
  } catch (error) {
    console.error("Group creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
