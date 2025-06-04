import { EmptyState } from "@/components/empty-state"

export default function ChatsPage() {
  return (
    <EmptyState
      title="Welcome to WhatsApp"
      description="Select a chat to start messaging or create a new conversation"
      icon="message-circle"
    />
  )
}
