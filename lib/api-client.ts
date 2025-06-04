import type { ApiResponse } from "@/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

// Helper function to get auth headers
const getAuthHeaders = () => {
  if (typeof window === "undefined") return {}

  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// Generic fetch function with error handling
export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`
    const headers = {
      ...getAuthHeaders(),
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        data: {} as T,
        status: response.status,
        message: errorData.message || `Error: ${response.status} ${response.statusText}`,
      }
    }

    const data = await response.json()
    return {
      data,
      status: response.status,
      message: "Success",
    }
  } catch (error: any) {
    console.error("API request failed:", error)
    return {
      data: {} as T,
      status: 500,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Convenience methods for common HTTP verbs
export const apiClient = {
  get: <T>(endpoint: string) => fetchApi<T>(endpoint),

  post: <T>(endpoint: string, data: any) =>
    fetchApi<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data: any) =>
    fetchApi<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  
  delete: <T>(endpoint: string) =>
    fetchApi<T>(endpoint, {
      method: "DELETE",
    }),
  
  // For form data (file uploads, etc.)
  postForm: <T>(endpoint: string, formData: FormData) =>
    fetchApi<T>(endpoint, {
      method: "POST",
      body: formData,
      headers: {}, // Let browser set content-type with boundary
    }),
  
  putForm: <T>(endpoint: string, formData: FormData) =>
    fetchApi<T>(endpoint, {
      method: "PUT",
      body: formData,
      headers: {}, // Let browser set content-type with boundary
    }),
}
