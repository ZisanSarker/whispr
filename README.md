# WhatsApp Clone with Mock Data

A fully functional WhatsApp clone built with Next.js, featuring real-time messaging, group chats, and comprehensive mock data implementation.

## Features

- 🔐 Authentication (Login/Signup)
- 💬 Real-time messaging
- 👥 Group chats with admin controls
- 📱 Responsive design
- 🌙 Dark mode support
- 📎 File attachments
- 🔔 Notification settings
- 👤 User profiles
- 🔍 Search functionality

## Mock Data Implementation

This project uses json-server to provide a complete mock backend with:

- User authentication
- Chat management
- Message handling
- Contact management
- Group operations
- Real-time features simulation

## Getting Started

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

This will start both the Next.js app (port 3000) and the json-server mock API (port 3001).

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Mock Data Structure

The mock data includes:
- 6 users with realistic profiles
- 5 chat conversations (individual and group)
- Multiple messages per chat
- Contact lists
- Group settings and permissions

## Default Login

You can use any email/password combination to log in, as the mock authentication accepts all credentials and returns the default user profile.

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
├── components/            # React components
├── lib/                   # Utility functions and API
├── mock/                  # Mock data and json-server config
├── types/                 # TypeScript type definitions
└── hooks/                 # Custom React hooks
\`\`\`

## Technologies Used

- Next.js 14
- TypeScript
- Tailwind CSS
- shadcn/ui components
- json-server (mock backend)
- Socket.io (mock real-time)
- Sonner (toast notifications)

## Mock Features

- **Authentication**: Simulated login/signup with localStorage tokens
- **Real-time**: Mock socket implementation for live messaging
- **File Uploads**: Client-side file handling with preview
- **Notifications**: Toast notifications for user feedback
- **Responsive**: Mobile-first design with desktop support

## Development Notes

- All API calls are mocked and return realistic data
- Socket events are simulated for real-time features
- File uploads are handled client-side only
- Database operations are simulated with json-server
- Authentication uses mock JWT tokens stored in localStorage
