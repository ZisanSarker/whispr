// Group management service

interface Group {
  id: string
  name: string
  description?: string
  avatar?: string
  participants: Array<{
    id: string
    name: string
    avatar?: string
    isAdmin: boolean
    status?: string
  }>
  settings: {
    onlyAdminsCanMessage: boolean
    onlyAdminsCanEditInfo: boolean
    disappearingMessages: boolean
  }
  createdAt: string
  createdBy: string
}

interface CreateGroupData {
  name: string
  description?: string
  participants: string[]
}

// Mock groups data
const MOCK_GROUPS: Record<string, Group> = {
  "3": {
    id: "3",
    name: "Family Group",
    description: "Our lovely family chat",
    avatar: "/placeholder.svg?height=40&width=40",
    participants: [
      { id: "current-user", name: "John Doe", isAdmin: true, status: "Hey there! I'm using WhatsApp Enterprise." },
      { id: "mom", name: "Mom", isAdmin: true, status: "Love you all ❤️" },
      { id: "dad", name: "Dad", isAdmin: false, status: "Working hard" },
      { id: "sister", name: "Sister", isAdmin: false, status: "Living my best life" },
    ],
    settings: {
      onlyAdminsCanMessage: false,
      onlyAdminsCanEditInfo: true,
      disappearingMessages: false,
    },
    createdAt: "2024-01-01T00:00:00Z",
    createdBy: "current-user",
  },
  "4": {
    id: "4",
    name: "Work Team",
    description: "Project collaboration and updates",
    avatar: "/placeholder.svg?height=40&width=40",
    participants: [
      { id: "current-user", name: "John Doe", isAdmin: false, status: "Hey there! I'm using WhatsApp Enterprise." },
      { id: "manager", name: "Manager", isAdmin: true, status: "Leading the team" },
      { id: "colleague1", name: "Colleague 1", isAdmin: false, status: "Developer" },
      { id: "colleague2", name: "Colleague 2", isAdmin: false, status: "Designer" },
    ],
    settings: {
      onlyAdminsCanMessage: false,
      onlyAdminsCanEditInfo: true,
      disappearingMessages: true,
    },
    createdAt: "2024-01-05T00:00:00Z",
    createdBy: "manager",
  },
}

export async function createGroup(data: CreateGroupData): Promise<Group> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const groupId = `group-${Date.now()}`
      const newGroup: Group = {
        id: groupId,
        name: data.name,
        description: data.description,
        avatar: "/placeholder.svg?height=40&width=40",
        participants: [
          {
            id: "current-user",
            name: "John Doe",
            isAdmin: true,
            status: "Hey there! I'm using WhatsApp Enterprise.",
          },
          ...data.participants.map((participantId) => ({
            id: participantId,
            name: `User ${participantId}`,
            isAdmin: false,
            status: "Hey there! I'm using WhatsApp Enterprise.",
          })),
        ],
        settings: {
          onlyAdminsCanMessage: false,
          onlyAdminsCanEditInfo: true,
          disappearingMessages: false,
        },
        createdAt: new Date().toISOString(),
        createdBy: "current-user",
      }

      MOCK_GROUPS[groupId] = newGroup
      resolve(newGroup)
    }, 500)
  })
}

export async function getGroupById(groupId: string): Promise<Group> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const group = MOCK_GROUPS[groupId]
      if (group) {
        resolve(group)
      } else {
        reject(new Error("Group not found"))
      }
    }, 300)
  })
}

export async function updateGroup(
  groupId: string,
  updates: Partial<Pick<Group, "name" | "description" | "settings">>,
): Promise<Group> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const group = MOCK_GROUPS[groupId]
      if (group) {
        MOCK_GROUPS[groupId] = { ...group, ...updates }
        resolve(MOCK_GROUPS[groupId])
      } else {
        reject(new Error("Group not found"))
      }
    }, 500)
  })
}

export async function removeParticipant(groupId: string, participantId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const group = MOCK_GROUPS[groupId]
      if (group) {
        group.participants = group.participants.filter((p) => p.id !== participantId)
        resolve()
      } else {
        reject(new Error("Group not found"))
      }
    }, 300)
  })
}

export async function makeAdmin(groupId: string, participantId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const group = MOCK_GROUPS[groupId]
      if (group) {
        const participant = group.participants.find((p) => p.id === participantId)
        if (participant) {
          participant.isAdmin = true
          resolve()
        } else {
          reject(new Error("Participant not found"))
        }
      } else {
        reject(new Error("Group not found"))
      }
    }, 300)
  })
}
