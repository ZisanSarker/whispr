"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Smile, Paperclip, Mic, Send, ImageIcon, FileText, Camera, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import data from "@emoji-mart/data"
import Picker from "@emoji-mart/react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"

interface MessageInputProps {
  onSendMessage: (content: string, attachments?: File[]) => void
  onTyping?: (isTyping: boolean) => void
  disabled?: boolean
}

export function MessageInput({ onSendMessage, onTyping, disabled = false }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [attachments, setAttachments] = useState<File[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [message])

  const handleSend = () => {
    if (message.trim() || attachments.length > 0) {
      onSendMessage(message.trim(), attachments.length > 0 ? attachments : undefined)
      setMessage("")
      setAttachments([])
      onTyping?.(false)
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (value: string) => {
    setMessage(value)

    // Handle typing indicator
    if (onTyping) {
      onTyping(value.length > 0)

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      // Set new timeout to stop typing indicator
      if (value.length > 0) {
        typingTimeoutRef.current = setTimeout(() => {
          onTyping(false)
        }, 1000)
      }
    }
  }

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording)
    // In a real app, this would start/stop voice recording
  }

  const handleAttachment = (type: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachments(Array.from(e.target.files))
    }
  }

  const handleEmojiSelect = (emoji: any) => {
    setMessage((prev) => prev + emoji.native)
  }

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachments.map((file, index) => (
            <div key={index} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded p-2">
              {file.type.startsWith("image/") ? (
                <ImageIcon className="h-4 w-4 text-blue-500" />
              ) : (
                <FileText className="h-4 w-4 text-orange-500" />
              )}
              <span className="text-sm truncate max-w-[150px]">{file.name}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== index))}
              >
                &times;
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full shrink-0" disabled={disabled}>
              <Smile className="h-5 w-5 text-gray-500" />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="top" align="start" className="w-auto p-0 border-none">
            <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="light" set="apple" />
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full shrink-0" disabled={disabled}>
              <Paperclip className="h-5 w-5 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top">
            <DropdownMenuItem onClick={() => handleAttachment("image")}>
              <ImageIcon className="mr-2 h-4 w-4" />
              <span>Photo</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAttachment("camera")}>
              <Camera className="mr-2 h-4 w-4" />
              <span>Camera</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAttachment("document")}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Document</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAttachment("location")}>
              <MapPin className="mr-2 h-4 w-4" />
              <span>Location</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} multiple />

        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message"
            className="resize-none py-3 pr-4 max-h-32 min-h-[44px] rounded-2xl"
            rows={1}
            disabled={disabled}
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-full shrink-0 transition-colors",
            message.trim() || attachments.length > 0 ? "text-green-500 hover:text-green-600" : "text-gray-500",
            isRecording && "bg-red-500 text-white hover:bg-red-600",
          )}
          onClick={message.trim() || attachments.length > 0 ? handleSend : handleVoiceRecord}
          disabled={disabled}
        >
          {message.trim() || attachments.length > 0 ? <Send className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  )
}
