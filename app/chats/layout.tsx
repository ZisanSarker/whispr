"use client"

import type React from "react"

import { useAuth } from "@/components/auth-provider"
import { LoadingScreen } from "@/components/loading-screen"
import { Sidebar } from "@/components/sidebar"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ChatsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  )
}
