import { useState, useEffect } from 'react'
import type { ReceiptFile, ReceiptStatus } from '@/types/receipt'

export type SortOrder = 'asc' | 'desc'

export interface ReceiptsResponse {
  receipts: ReceiptFile[]
  stats: {
    totalFiles: number
    validFiles: number
    processedFiles: number
    totalAmount: number
  }
}

interface UseReceiptsOptions {
  status?: ReceiptStatus
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
}

interface UseReceiptsResult {
  receipts: ReceiptFile[]
  stats: {
    totalFiles: number
    validFiles: number
    processedFiles: number
    totalAmount: number
  }
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}
const API_URL = import.meta.env.VITE_BE_URL

export function useReceipts({ status, sortBy = 'createdAt', sortOrder = 'desc', search = '' }: UseReceiptsOptions = {}): UseReceiptsResult {
  const [receipts, setReceipts] = useState<ReceiptFile[]>([])
  const [stats, setStats] = useState({
    totalFiles: 0,
    validFiles: 0,
    processedFiles: 0,
    totalAmount: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReceipts = async () => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams()
      if (status) queryParams.append('status', status)
      if (sortBy) queryParams.append('sortBy', sortBy)
      if (sortOrder) queryParams.append('sortOrder', sortOrder)
      if (search) queryParams.append('search', search)

      const response = await fetch(`${API_URL}/receipts?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch receipts')
      }

      const data = await response.json()
      setReceipts(data.receipts)
      setStats(data.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReceipts()
  }, [status, sortBy, sortOrder, search])

  return {
    receipts,
    stats,
    loading,
    error,
    refetch: fetchReceipts
  }
} 