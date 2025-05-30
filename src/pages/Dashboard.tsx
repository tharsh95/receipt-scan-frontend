import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileCheck, Cog, Receipt, LogOut, User, DollarSign, CheckCircle, FileText } from "lucide-react"
import UploadTab from "@/components/upload-tab"
import { ReceiptList } from "@/components/ReceiptList"
import { useReceipts } from "@/hooks/useReceipts"
import type { ReceiptStatus } from "@/types/receipt"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from 'sonner'
const API_URL = import.meta.env.VITE_BE_URL

export default function DashboardPage() {
  const [user, setUser] = useState<{ name: string } | null>(null)
  const [activeTab, setActiveTab] = useState<ReceiptStatus>("uploaded")
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const navigate = useNavigate()

  const { receipts, stats, loading, error, refetch } = useReceipts({
    status: activeTab,
    sortBy,
    sortOrder,
    search,
  })

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login")
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/login")
  }

  const handleValidate = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/receipts/${id}/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to validate receipt')
      }

      toast.success('Receipt validated successfully')
      refetch()
      setActiveTab("processed")
    } catch (error) {
      toast.error('Failed to validate receipt')
      throw error
    }
  }

  const handleProcess = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/receipts/${id}/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to process receipt')
      }

      toast.success('Receipt processed successfully')
      setActiveTab("final")
      refetch()
    } catch (error) {
      toast.error('Failed to process receipt')
      throw error
    }
  }

  const handleUploadSuccess = () => {
    refetch()
    setActiveTab('validate')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Receipt className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Receipt Processor</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{user?.name}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Files</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalFiles}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Valid Files</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.validFiles}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Cog className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Processed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.processedFiles}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle>Receipt Management</CardTitle>
            <CardDescription>Upload, validate, and process your receipts</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ReceiptStatus)} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="uploaded" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Uploaded
                </TabsTrigger>
                <TabsTrigger value="validate" className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  Validate
                </TabsTrigger>
                <TabsTrigger value="processed" className="flex items-center gap-2">
                  <Cog className="h-4 w-4" />
                  Process
                </TabsTrigger>
                <TabsTrigger value="final" className="flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Receipts
                </TabsTrigger>
              </TabsList>

              <div className="mt-6 space-y-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="Search receipts..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                  />
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Created Date</SelectItem>
                      <SelectItem value="updatedAt">Updated Date</SelectItem>
                      <SelectItem value="fileName">File Name</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as "asc" | "desc")}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <TabsContent value="uploaded">
                  <UploadTab onUploadSuccess={handleUploadSuccess} />
                </TabsContent>

                <TabsContent value="validate">
                  <ReceiptList 
                    receipts={receipts} 
                    loading={loading} 
                    error={error}
                    onValidate={handleValidate}
                    currentTab="validate"
                  />
                </TabsContent>

                <TabsContent value="processed">
                  <ReceiptList 
                    receipts={receipts} 
                    loading={loading} 
                    error={error}
                    onProcess={handleProcess}
                    currentTab="processed"
                  />
                </TabsContent>

                <TabsContent value="final">
                  <ReceiptList 
                    receipts={receipts} 
                    loading={loading} 
                    error={error}
                    currentTab="final"
                  />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
