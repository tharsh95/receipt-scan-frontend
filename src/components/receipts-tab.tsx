import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Eye, Download, Calendar, DollarSign, Building, FileText, SortAsc, SortDesc } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Receipt {
  id: string
  file_name: string
  merchant_name: string
  total_amount: number
  purchased_at: string
  file_path: string
  created_at: string
}

export default function ReceiptsTab() {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [filteredReceipts, setFilteredReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null)

  const filterAndSortReceipts = useCallback(() => {
    const filtered = receipts.filter(
      (receipt) =>
        receipt.merchant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.file_name.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    filtered.sort((a, b) => {
      let aValue: string | number | Date = a[sortBy as keyof Receipt]
      let bValue: string | number | Date = b[sortBy as keyof Receipt]

      if (sortBy === "total_amount") {
        aValue = Number.parseFloat(aValue as string)
        bValue = Number.parseFloat(bValue as string)
      } else if (sortBy === "purchased_at" || sortBy === "created_at") {
        aValue = new Date(aValue)
        bValue = new Date(bValue)
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredReceipts(filtered)
  }, [receipts, searchTerm, sortBy, sortOrder])

  useEffect(() => {
    fetchReceipts()
  }, [])

  useEffect(() => {
    filterAndSortReceipts()
  }, [receipts, searchTerm, sortBy, sortOrder, filterAndSortReceipts])

  const fetchReceipts = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/receipts", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setReceipts(data.receipts)
      }
    } catch (error) {
      console.error("Error fetching receipts:", error)
    } finally {
      setLoading(false)
    }
  }

  const downloadReceipt = async (receipt: Receipt) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/receipts/${receipt.id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.style.display = "none"
        a.href = url
        a.download = receipt.file_name
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Error downloading receipt:", error)
    }
  }

  const totalAmount = filteredReceipts.reduce((sum, receipt) => sum + receipt.total_amount, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Loading receipts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Receipts</p>
                <p className="text-xl font-bold">{filteredReceipts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-xl font-bold">${totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Unique Merchants</p>
                <p className="text-xl font-bold">{new Set(filteredReceipts.map((r) => r.merchant_name)).size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by merchant name or file name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Date Added</SelectItem>
                  <SelectItem value="purchased_at">Purchase Date</SelectItem>
                  <SelectItem value="merchant_name">Merchant</SelectItem>
                  <SelectItem value="total_amount">Amount</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Receipts List */}
      {filteredReceipts.length === 0 ? (
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            {receipts.length === 0
              ? "No receipts found. Upload and process some PDF files to get started."
              : "No receipts match your search criteria."}
          </AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Receipts ({filteredReceipts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredReceipts.map((receipt) => (
                <div key={receipt.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{receipt.file_name}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center space-x-1">
                            <Building className="h-3 w-3" />
                            <span className="truncate max-w-32">{receipt.merchant_name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-3 w-3" />
                            <span>${receipt.total_amount.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(receipt.purchased_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedReceipt(receipt)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Receipt Details</DialogTitle>
                            <DialogDescription>
                              Extracted information from {selectedReceipt?.file_name}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedReceipt && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-gray-600">Merchant</p>
                                  <p className="text-sm">{selectedReceipt.merchant_name}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-600">Amount</p>
                                  <p className="text-sm font-bold text-green-600">
                                    ${selectedReceipt.total_amount.toFixed(2)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-600">Purchase Date</p>
                                  <p className="text-sm">
                                    {new Date(selectedReceipt.purchased_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-600">Processed</p>
                                  <p className="text-sm">{new Date(selectedReceipt.created_at).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600 mb-2">File Name</p>
                                <p className="text-sm bg-gray-100 p-2 rounded break-all">{selectedReceipt.file_name}</p>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Button variant="outline" size="sm" onClick={() => downloadReceipt(receipt)}>
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
