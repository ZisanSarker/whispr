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

    // Get all users except the current user as contacts
    const contacts = await db.user.findMany({
      where: {
        id: { not: userId },
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        status: true,
        email: true,
      },
    })

    return NextResponse.json(contacts)
  } catch (error) {
    console.error("Contacts fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
