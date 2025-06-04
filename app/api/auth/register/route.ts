import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { hashPassword, generateToken } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create new user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        status: "Hey there! I'm using WhatsApp Enterprise.",
        settings: {
          create: {
            messageNotifications: true,
            groupNotifications: true,
            callNotifications: true,
            soundEnabled: true,
          },
        },
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

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
    })

    return NextResponse.json({
      user,
      token,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
