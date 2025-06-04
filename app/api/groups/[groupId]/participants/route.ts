import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyAuth } from "@/lib/auth-utils"

export async function POST(request: Request, { params }: { params: { groupId: string } }) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const userId = authResult.userId
    const groupId = params.groupId

    // Check if group exists and user is an admin
    const group = await db.chat.findFirst({
      where: {
        id: groupId,
        isGroup: true,
        participants: {
          some: {
            userId,
            isAdmin: true,
          },
        },
      },
    })

    if (!group) {
      return NextResponse.json({ error: "Group not found or unauthorized" }, { status: 404 })
    }

    const { participantId } = await request.json()

    if (!participantId) {
      return NextResponse.json({ error: "Participant ID is required" }, { status: 400 })
    }

    // Check if user is already a participant
    const existingParticipant = await db.chatParticipant.findFirst({
      where: {
        chatId: groupId,
        userId: participantId,
      },
    })

    if (existingParticipant) {
      return NextResponse.json({ error: "User is already a participant" }, { status: 409 })
    }

    // Add participant
    await db.chatParticipant.create({
      data: {
        chatId: groupId,
        userId: participantId,
        isAdmin: false,
      },
    })

    // Create system message
    await db.message.create({
      data: {
        content: `User ${participantId} was added to the group`,
        chatId: groupId,
        senderId: userId,
        isSystemMessage: true,
        status: "sent",
        readBy: [userId],
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Add participant error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { groupId: string } }) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const userId = authResult.userId
    const groupId = params.groupId

    // Check if group exists and user is an admin
    const group = await db.chat.findFirst({
      where: {
        id: groupId,
        isGroup: true,
        participants: {
          some: {
            userId,
            isAdmin: true,
          },
        },
      },
    })

    if (!group) {
      return NextResponse.json({ error: "Group not found or unauthorized" }, { status: 404 })
    }

    const { participantId } = await request.json()

    if (!participantId) {
      return NextResponse.json({ error: "Participant ID is required" }, { status: 400 })
    }

    // Remove participant
    await db.chatParticipant.deleteMany({
      where: {
        chatId: groupId,
        userId: participantId,
      },
    })

    // Create system message
    await db.message.create({
      data: {
        content: `User ${participantId} was removed from the group`,
        chatId: groupId,
        senderId: userId,
        isSystemMessage: true,
        status: "sent",
        readBy: [userId],
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Remove participant error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
