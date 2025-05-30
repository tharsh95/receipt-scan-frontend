import { useState } from 'react'

interface UploadResponse {
  success: boolean
  message: string
  receipt?: {
    id: string
    fileName: string
    filePath: string
    status: {
      isValid: boolean | null
      isProcessed: boolean
      currentStage: 'pending_validation' | 'pending_processing' | 'final'
    }
  }
}
const API_URL = import.meta.env.VITE_BE_URL

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadFile = async (file: File): Promise<UploadResponse> => {
    try {
      setIsUploading(true)
      setError(null)

      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${API_URL}/receipts/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to upload file')
      }

      const data = await response.json()
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred during upload'
      setError(message)
      throw err
    } finally {
      setIsUploading(false)
    }
  }

  return {
    uploadFile,
    isUploading,
    error,
  }
} 