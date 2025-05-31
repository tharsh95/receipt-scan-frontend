import type { ReceiptFile } from '@/types/receipt'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { AlertCircle, CheckCircle, Clock, FileText, Check, Play, Eye, Loader2, Trash2, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ReceiptStats } from './ReceiptStats'

interface ReceiptListProps {
  receipts: ReceiptFile[]
  loading: boolean
  error: string | null
  onValidate?: (id: string) => Promise<void>
  onProcess?: (id: string) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  currentTab: 'uploaded' | 'validate' | 'processed' | 'final'
}

interface ReceiptStatsData {
  totalSpent: number
  averageAmount: number
  totalReceipts: number
  monthlyBreakdown: Record<string, number>
  categoryBreakdown: Record<string, number>
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
  onDelete?: (id: string) => Promise<void>
  currentTab: ReceiptListProps['currentTab']
}

function ReceiptCard({ receipt, onValidate, onProcess, onDelete, currentTab }: ReceiptCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const handleDelete = async () => {
    if (!onDelete) return
    setIsDeleting(true)
    try {
      await onDelete(receipt.id)
      toast.success('Receipt deleted successfully')
    } catch (error) {
      toast.error('Failed to delete receipt')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex flex-col gap-3">
        {/* Header with actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900">{receipt.fileName}</h3>
            <Badge className={getStatusColor(receipt.status.currentStage)}>
              <span className="flex items-center gap-1">
                {getStatusIcon(receipt.status.currentStage)}
                {getDisplayStatus(receipt, currentTab)}
              </span>
            </Badge>
          </div>
          <div className="flex gap-2">
            {currentTab === 'validate' && !receipt.status.isValid && !receipt.status.isProcessed && onValidate && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost"
                      size="sm" 
                      onClick={handleValidate}
                      disabled={isLoading}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Validate Receipt</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {currentTab === 'processed' && receipt.status.isValid && !receipt.status.isProcessed && onProcess && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost"
                      size="sm" 
                      onClick={handleProcess}
                      disabled={isLoading}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Process Receipt</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {currentTab === 'final' && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost"
                      size="sm" 
                      onClick={() => setShowDetails(!showDetails)}
                      className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                    >
                      {showDetails ? (
                        <X className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{showDetails ? 'Hide Details' : 'View Details'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {onDelete && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost"
                      size="sm" 
                      onClick={handleDelete}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete Receipt</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        {/* Created date */}
        <div className="text-sm text-gray-500">
          Created: {format(new Date(receipt.createdAt), 'PP')}
        </div>

        {/* Details section */}
        {showDetails && receipt.receipt && (
          <div className="mt-2 p-3 bg-gray-50 rounded-md space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Merchant</p>
                <p className="text-sm text-gray-600">{receipt.receipt.merchantName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Amount</p>
                <p className="text-sm text-gray-600">${receipt.receipt.totalAmount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Date</p>
                <p className="text-sm text-gray-600">{format(new Date(receipt.receipt.purchasedAt), 'PPP')}</p>
              </div>
            </div>
            {receipt.receipt.items.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Items</p>
                <div className="bg-white rounded-md p-2">
                  <ul className="space-y-1">
                    {receipt.receipt.items.map((item) => (
                      <li key={item.id} className="text-sm text-gray-600 flex justify-between">
                        <span>{item.name}</span>
                        <span>${item.price.toFixed(2)} x {item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function ReceiptList({ receipts, loading, error, onValidate, onProcess, onDelete, currentTab }: ReceiptListProps) {
  const [stats, setStats] = useState<ReceiptStatsData | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true)
        const token = localStorage.getItem('token')
        const response = await fetch(`${import.meta.env.VITE_BE_URL}/receipts/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch stats')
        }

        const data = await response.json()
        setStats(data)
      } catch (error) {
        toast.error('Failed to load receipt statistics')
      } finally {
        setStatsLoading(false)
      }
    }

    if (currentTab === 'final') {
      fetchStats()
    }
  }, [currentTab, receipts]) // Refetch stats when tab changes or receipts change

  if (loading || (currentTab === 'final' && statsLoading)) {
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
      {/* Stats Section - Only show in final tab */}
      {currentTab === 'final' && stats && <ReceiptStats stats={stats} />}

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
                    onDelete={onDelete}
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
                    onDelete={onDelete}
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
                    onDelete={onDelete}
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
                    onProcess={onProcess}
                    onDelete={onDelete}
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
            {receipts.map((receipt) => (
              <ReceiptCard
                key={receipt.id}
                receipt={receipt}
                onDelete={onDelete}
                currentTab={currentTab}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
} 