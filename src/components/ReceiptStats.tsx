import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { BarChart, DollarSign, Receipt, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'

interface ReceiptStats {
  totalSpent: number
  averageAmount: number
  totalReceipts: number
  monthlyBreakdown: Record<string, number>
  categoryBreakdown: Record<string, number>
}

interface ReceiptStatsProps {
  stats: ReceiptStats
}

export function ReceiptStats({ stats }: ReceiptStatsProps) {
  const [showDialog, setShowDialog] = useState(false)

  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split('-')
    return format(new Date(parseInt(year), parseInt(month) - 1), 'MMMM yyyy')
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalSpent.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Amount</p>
                <p className="text-2xl font-bold text-gray-900">${stats.averageAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Receipt className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Receipts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReceipts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <BarChart className="h-4 w-4 mr-2" />
            View Detailed Breakdown
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Receipt Statistics Breakdown</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Monthly Breakdown */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Monthly Breakdown</h3>
              <div className="space-y-2">
                {Object.entries(stats.monthlyBreakdown)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([month, amount]) => (
                    <div key={month} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                      <span className="font-medium">{formatMonth(month)}</span>
                      <span className="text-green-600">${amount.toFixed(2)}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Category Breakdown */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Category Breakdown</h3>
              <div className="space-y-2">
                {Object.entries(stats.categoryBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, amount]) => (
                    <div key={category} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                      <span className="font-medium">{category}</span>
                      <span className="text-green-600">${amount.toFixed(2)}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 