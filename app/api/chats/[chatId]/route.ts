import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyAuth } from "@/lib/auth-utils"

export async function GET(request: Request, { params }: { params: { chatId: string } }) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const userId = authResult.userId
    const chatId = params.chatId

    // Get chat details
    const chat = await db.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                status: true,
              },
            },
          },
        },
      },
    })

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }

    // Check if user is a participant
    const isParticipant = chat.participants.some((p) => p.userId === userId)
    if (!isParticipant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get messages
    const messages = await db.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        attachments: true,
      },
    })

    // Format chat for the client
    const isGroup = chat.isGroup
    const otherParticipants = chat.participants.filter((p) => p.userId !== userId)

    const formattedChat = {
      id: chat.id,
      name: isGroup ? chat.name : otherParticipants[0]?.user.name || "Unknown",
      avatar: isGroup ? chat.avatar : otherParticipants[0]?.user.avatar || null,
      isGroup,
      description: chat.description,
      settings: chat.settings,
      participants: chat.participants.map((p) => ({
        id: p.userId,
        name: p.user.name,
        avatar: p.user.avatar,
        isAdmin: p.isAdmin,
        status: p.user.status,
      })),
    }

    // Format messages
    const formattedMessages = messages.map((message) => ({
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      senderName: message.sender.name,
      timestamp: message.createdAt.toISOString(),
      status: message.status,
      attachments: message.attachments.map((attachment) => ({
        id: attachment.id,
        name: attachment.name,
        type: attachment.type,
        url: attachment.url,
        size: attachment.size,
      })),
    }))

    // Mark messages as read
    await db.message.updateMany({
      where: {
        chatId,
        senderId: { not: userId },
        NOT: {
          readBy: {
            has: userId,
          },
        },
      },
      data: {
        readBy: {
          push: userId,
        },
      },
    })

    return NextResponse.json({
      chat: formattedChat,
      messages: formattedMessages,
    })
  } catch (error) {
    console.error("Chat fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
