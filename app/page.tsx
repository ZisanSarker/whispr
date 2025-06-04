"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { LoadingScreen } from "@/components/loading-screen"

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace("/chats")
      } else {
        router.replace("/login")
      }
    }
  }, [isAuthenticated, isLoading, router])

  return <LoadingScreen />
}
