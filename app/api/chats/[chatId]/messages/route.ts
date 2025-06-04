import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyAuth } from "@/lib/auth-utils"
import { uploadFile } from "@/lib/storage"

export async function POST(request: Request, { params }: { params: { chatId: string } }) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const userId = authResult.userId
    const chatId = params.chatId

    // Check if chat exists and user is a participant
    const chat = await db.chat.findFirst({
      where: {
        id: chatId,
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        participants: {
          select: {
            userId: true,
          },
        },
      },
    })

    if (!chat) {
      return NextResponse.json({ error: "Chat not found or unauthorized" }, { status: 404 })
    }

    const formData = await request.formData()
    const content = formData.get("content") as string
    const attachmentsData = formData.get("attachments") as string | null

    let attachments = []
    if (attachmentsData) {
      try {
        attachments = JSON.parse(attachmentsData)
      } catch (e) {
        console.error("Failed to parse attachments:", e)
      }
    }

    // Process file attachments
    const fileAttachments = []
    for (let i = 0; i < formData.getAll("files").length; i++) {
      const file = formData.getAll("files")[i] as File
      if (file) {
        const url = await uploadFile(file)
        fileAttachments.push({
          name: file.name,
          type: file.type,
          size: file.size,
          url,
        })
      }
    }

    // Combine parsed attachments and file attachments
    const allAttachments = [...attachments, ...fileAttachments]

    // Create message
    const message = await db.message.create({
      data: {
        content,
        chatId,
        senderId: userId,
        status: "sent",
        readBy: [userId],
        attachments: {
          create: allAttachments.map((attachment) => ({
            name: attachment.name,
            type: attachment.type,
            size: attachment.size,
            url: attachment.url,
          })),
        },
      },
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

    // Update chat's updatedAt
    await db.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    })

    // Format message for response
    const formattedMessage = {
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
    }

    return NextResponse.json(formattedMessage)
  } catch (error) {
    console.error("Message send error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
