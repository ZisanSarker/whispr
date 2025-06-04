import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyAuth } from "@/lib/auth-utils"

export async function PUT(request: Request) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const userId = authResult.userId
    const { messageNotifications, groupNotifications, callNotifications, soundEnabled } = await request.json()

    // Update user settings
    await db.userSettings.upsert({
      where: { userId },
      update: {
        messageNotifications,
        groupNotifications,
        callNotifications,
        soundEnabled,
      },
      create: {
        userId,
        messageNotifications,
        groupNotifications,
        callNotifications,
        soundEnabled,
      },
    })

    // Get updated user data
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        status: true,
        settings: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Settings update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
