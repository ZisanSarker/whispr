import { MessageSquare, Users, Settings } from "lucide-react"

interface EmptyStateProps {
  title: string
  description?: string
  icon?: string
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  const getIcon = () => {
    switch (icon) {
      case "users":
        return Users
      case "settings":
        return Settings
      default:
        return MessageSquare
    }
  }

  const Icon = getIcon()

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-12">
      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-6">
        <Icon className="h-16 w-16 text-gray-500 dark:text-gray-400" />
      </div>
      <h3 className="text-2xl font-medium text-gray-900 dark:text-gray-100 mb-3">{title}</h3>
      {description && <p className="text-gray-500 dark:text-gray-400 max-w-md leading-relaxed">{description}</p>}
    </div>
  )
}
