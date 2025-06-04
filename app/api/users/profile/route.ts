import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyAuth } from "@/lib/auth-utils"
import { uploadImage } from "@/lib/storage"

export async function PUT(request: Request) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const userId = authResult.userId
    const formData = await request.formData()

    const name = formData.get("name") as string
    const status = formData.get("status") as string
    const avatarFile = formData.get("avatar") as File | null

    let avatarUrl = undefined

    // Upload avatar if provided
    if (avatarFile) {
      avatarUrl = await uploadImage(avatarFile)
    }

    // Update user profile
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        name: name || undefined,
        status: status || undefined,
        avatar: avatarUrl || undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        status: true,
        settings: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
