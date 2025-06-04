import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyAuth } from "@/lib/auth-utils"

export async function GET(request: Request) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const userId = authResult.userId

    // Get all chats where the user is a participant
    const chats = await db.chat.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
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
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    // Format chats for the client
    const formattedChats = chats.map((chat) => {
      const isGroup = chat.isGroup
      const otherParticipants = chat.participants.filter((p) => p.userId !== userId)

      // For direct chats, use the other user's info
      const name = isGroup ? chat.name : otherParticipants[0]?.user.name || "Unknown"

      const avatar = isGroup ? chat.avatar : otherParticipants[0]?.user.avatar || null

      // Count unread messages
      const unreadCount = chat.messages.filter((m) => m.senderId !== userId && !m.readBy.includes(userId)).length

      // Format last message
      const lastMessage = chat.messages[0]
        ? {
            content: chat.messages[0].content,
            senderId: chat.messages[0].senderId,
            senderName: chat.messages[0].sender.name,
            timestamp: chat.messages[0].createdAt.toISOString(),
          }
        : null

      return {
        id: chat.id,
        name,
        avatar,
        isGroup,
        unreadCount,
        lastMessage,
        participants: chat.participants.map((p) => ({
          id: p.userId,
          name: p.user.name,
          avatar: p.user.avatar,
          isAdmin: p.isAdmin,
          status: p.user.status,
        })),
        updatedAt: chat.updatedAt,
      }
    })

    return NextResponse.json(formattedChats)
  } catch (error) {
    console.error("Chats fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const userId = authResult.userId
    const { participantId } = await request.json()

    if (!participantId) {
      return NextResponse.json({ error: "Participant ID is required" }, { status: 400 })
    }

    // Check if chat already exists
    const existingChat = await db.chat.findFirst({
      where: {
        isGroup: false,
        AND: [
          {
            participants: {
              some: {
                userId,
              },
            },
          },
          {
            participants: {
              some: {
                userId: participantId,
              },
            },
          },
        ],
      },
    })

    if (existingChat) {
      return NextResponse.json({ chatId: existingChat.id })
    }

    // Create new chat
    const newChat = await db.chat.create({
      data: {
        isGroup: false,
        participants: {
          create: [
            { userId, isAdmin: true },
            { userId: participantId, isAdmin: false },
          ],
        },
      },
    })

    return NextResponse.json({ chatId: newChat.id })
  } catch (error) {
    console.error("Chat creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
