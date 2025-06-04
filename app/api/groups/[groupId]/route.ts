import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyAuth } from "@/lib/auth-utils"
import { uploadImage } from "@/lib/storage"

export async function GET(request: Request, { params }: { params: { groupId: string } }) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const userId = authResult.userId
    const groupId = params.groupId

    // Get group details
    const group = await db.chat.findFirst({
      where: {
        id: groupId,
        isGroup: true,
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
      },
    })

    if (!group) {
      return NextResponse.json({ error: "Group not found or unauthorized" }, { status: 404 })
    }

    // Format group for response
    const formattedGroup = {
      id: group.id,
      name: group.name,
      description: group.description,
      avatar: group.avatar,
      settings: group.settings,
      participants: group.participants.map((p) => ({
        id: p.userId,
        name: p.user.name,
        avatar: p.user.avatar,
        isAdmin: p.isAdmin,
        status: p.user.status,
      })),
      createdAt: group.createdAt,
    }

    return NextResponse.json(formattedGroup)
  } catch (error) {
    console.error("Group fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { groupId: string } }) {
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

    const formData = await request.formData()

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const settingsData = formData.get("settings") as string
    const avatarFile = formData.get("avatar") as File | null

    let settings = {}
    if (settingsData) {
      try {
        settings = JSON.parse(settingsData)
      } catch (e) {
        return NextResponse.json({ error: "Invalid settings data" }, { status: 400 })
      }
    }

    let avatarUrl = undefined
    if (avatarFile) {
      avatarUrl = await uploadImage(avatarFile)
    }

    // Update group
    const updatedGroup = await db.chat.update({
      where: { id: groupId },
      data: {
        name: name || undefined,
        description: description || undefined,
        avatar: avatarUrl || undefined,
        settings: settings || undefined,
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
      },
    })

    // Format group for response
    const formattedGroup = {
      id: updatedGroup.id,
      name: updatedGroup.name,
      description: updatedGroup.description,
      avatar: updatedGroup.avatar,
      settings: updatedGroup.settings,
      participants: updatedGroup.participants.map((p) => ({
        id: p.userId,
        name: p.user.name,
        avatar: p.user.avatar,
        isAdmin: p.isAdmin,
        status: p.user.status,
      })),
    }

    return NextResponse.json(formattedGroup)
  } catch (error) {
    console.error("Group update error:", error)
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

    // Delete group (cascade will delete participants and messages)
    await db.chat.delete({
      where: { id: groupId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Group deletion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
