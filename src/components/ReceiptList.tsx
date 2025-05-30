import type { ReceiptFile } from '@/types/receipt'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { AlertCircle, CheckCircle, Clock, FileText, Check, Play, Eye, Loader2 } from 'lucide-react'
import { useState } from 'react'

interface ReceiptListProps {
  receipts: ReceiptFile[]
  loading: boolean
  error: string | null
  onValidate?: (id: string) => Promise<void>
  onProcess?: (id: string) => Promise<void>
  currentTab: 'uploaded' | 'validate' | 'processed' | 'final'
}

const getStatusColor = (stage: ReceiptFile['status']['currentStage']) => {
  switch (stage) {
    case 'pending_validation':
      return 'bg-yellow-100 text-yellow-800'
    case 'pending_processing':
      return 'bg-blue-100 text-blue-800'
    case 'final':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusIcon = (stage: ReceiptFile['status']['currentStage']) => {
  switch (stage) {
    case 'pending_validation':
      return <Clock className="h-4 w-4" />
    case 'pending_processing':
      return <AlertCircle className="h-4 w-4" />
    case 'final':
      return <CheckCircle className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

const getDisplayStatus = (receipt: ReceiptFile, currentTab: ReceiptListProps['currentTab']) => {
  if (currentTab === 'final') {
    return 'Completed'
  }
  
  if (receipt.status.isValid) {
    if (receipt.status.isProcessed) {
      return 'Processed'
    }
    return 'Validated'
  }
  
  return 'Pending Validation'
}

interface ReceiptCardProps {
  receipt: ReceiptFile
  onValidate?: (id: string) => Promise<void>
  onProcess?: (id: string) => Promise<void>
  currentTab: ReceiptListProps['currentTab']
}

function ReceiptCard({ receipt, onValidate, onProcess, currentTab }: ReceiptCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleValidate = async () => {
    if (!onValidate) return
    setIsLoading(true)
    try {
      await onValidate(receipt.id)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProcess = async () => {
    if (!onProcess) return
    setIsLoading(true)
    try {
      await onProcess(receipt.id)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="border rounded-lg p-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{receipt.fileName}</h3>
            <Badge className={getStatusColor(receipt.status.currentStage)}>
              <span className="flex items-center gap-1">
                {getStatusIcon(receipt.status.currentStage)}
                {getDisplayStatus(receipt, currentTab)}
              </span>
            </Badge>
          </div>
          {showDetails && receipt.receipt && (
            <div className="text-sm text-gray-500 mt-2 space-y-1">
              <p>Merchant: {receipt.receipt.merchantName}</p>
              <p>Amount: ${receipt.receipt.totalAmount.toFixed(2)}</p>
              <p>Date: {format(new Date(receipt.receipt.purchasedAt), 'PPP')}</p>
              {receipt.receipt.items.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Items:</p>
                  <ul className="list-disc list-inside">
                    {receipt.receipt.items.map((item) => (
                      <li key={item.id}>
                        {item.name} - ${item.price.toFixed(2)} x {item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-sm text-gray-500">
            <p>Created: {format(new Date(receipt.createdAt), 'PP')}</p>
            <p>Updated: {format(new Date(receipt.updatedAt), 'PP')}</p>
          </div>
          <div className="flex gap-2">
            {currentTab === 'validate' && !receipt.status.isValid && !receipt.status.isProcessed && onValidate && (
              <Button 
                size="sm" 
                onClick={handleValidate}
                disabled={isLoading}
                className="flex items-center gap-1"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                {isLoading ? 'Validating...' : 'Validate'}
              </Button>
            )}
            {currentTab === 'processed' && receipt.status.isValid && !receipt.status.isProcessed && onProcess && (
              <Button 
                size="sm" 
                onClick={handleProcess}
                disabled={isLoading}
                className="flex items-center gap-1"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {isLoading ? 'Processing...' : 'Process'}
              </Button>
            )}
            {currentTab === 'final' && receipt.receipt && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-1"
              >
                <Eye className="h-4 w-4" />
                {showDetails ? 'Hide Details' : 'View Details'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ReceiptList({ receipts, loading, error, onValidate, onProcess, currentTab }: ReceiptListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        <p className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      </div>
    )
  }

  if (receipts.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        No receipts found
      </div>
    )
  }

  const pendingReceipts = receipts.filter(receipt => !receipt.status.isValid)
  const validatedReceipts = receipts.filter(receipt => receipt.status.isValid && !receipt.status.isProcessed)
  const processedReceipts = receipts.filter(receipt => receipt.status.isValid && receipt.status.isProcessed)

  return (
    <div className="space-y-6">
      {currentTab === 'validate' && (
        <>
          {pendingReceipts.length > 0 && (
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-lg">Pending Validation</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {pendingReceipts.map((receipt) => (
                  <ReceiptCard
                    key={receipt.id}
                    receipt={receipt}
                    onValidate={onValidate}
                    currentTab={currentTab}
                  />
                ))}
              </CardContent>
            </Card>
          )}
          {validatedReceipts.length > 0 && (
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-lg">Validated Receipts</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {validatedReceipts.map((receipt) => (
                  <ReceiptCard
                    key={receipt.id}
                    receipt={receipt}
                    currentTab={currentTab}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {currentTab === 'processed' && (
        <>
          {validatedReceipts.length > 0 && (
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-lg">Pending Processing</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {validatedReceipts.map((receipt) => (
                  <ReceiptCard
                    key={receipt.id}
                    receipt={receipt}
                    onProcess={onProcess}
                    currentTab={currentTab}
                  />
                ))}
              </CardContent>
            </Card>
          )}
          {processedReceipts.length > 0 && (
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-lg">Processed Receipts</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {processedReceipts.map((receipt) => (
                  <ReceiptCard
                    key={receipt.id}
                    receipt={receipt}
                    currentTab={currentTab}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {currentTab === 'final' && processedReceipts.length > 0 && (
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-lg">Completed Receipts</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {processedReceipts.map((receipt) => (
              <ReceiptCard
                key={receipt.id}
                receipt={receipt}
                currentTab={currentTab}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
} 