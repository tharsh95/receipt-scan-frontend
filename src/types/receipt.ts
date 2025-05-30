export type ReceiptStatus = 'uploaded' | 'validate' | 'processed' | 'final'

export interface ReceiptItem {
  id: string
  name: string
  price: number
  quantity: number
}

export interface Receipt {
  id: string
  merchantName: string
  totalAmount: number
  purchasedAt: string
  confidence: number
  items: ReceiptItem[]
}

export interface ReceiptFile {
  id: string
  fileName: string
  filePath: string
  fileUrl: string
  createdAt: string
  updatedAt: string
  status: {
    currentStage: 'pending_validation' | 'pending_processing' | 'final'
    isValid: boolean
    isProcessed: boolean
  }
  receipt: Receipt | null
} 