
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileCheck, Cog, Receipt, LogOut, User, DollarSign, CheckCircle, FileText } from "lucide-react"
import UploadTab from "@/components/upload-tab"
import ValidateTab from "@/components/validate-tab"
import ProcessTab from "@/components/process-tab"
import ReceiptsTab from "@/components/receipts-tab"

interface DashboardStats {
  totalFiles: number
  validFiles: number
  processedFiles: number
  totalAmount: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<{ name: string } | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalFiles: 0,
    validFiles: 0,
    processedFiles: 0,
    totalAmount: 0,
  })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // useEffect(() => {
  //   const token = localStorage.getItem("token")
  //   if (!token) {
  //     navigate("/login")
  //     return
  //   }

  //   fetchUserData()
  //   fetchStats()
  // }, [])

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        localStorage.removeItem("token")
        navigate("/login")
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/stats", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const statsData = await response.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/login")
  }

  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
  //         <p>Loading dashboard...</p>
  //       </div>
  //     </div>
  //   )
  // }

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
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload
                </TabsTrigger>
                <TabsTrigger value="validate" className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  Validate
                </TabsTrigger>
                <TabsTrigger value="process" className="flex items-center gap-2">
                  <Cog className="h-4 w-4" />
                  Process
                </TabsTrigger>
                <TabsTrigger value="receipts" className="flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Receipts
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="mt-6">
                <UploadTab onUploadSuccess={fetchStats} />
              </TabsContent>

              <TabsContent value="validate" className="mt-6">
                <ValidateTab onValidationSuccess={fetchStats} />
              </TabsContent>

              <TabsContent value="process" className="mt-6">
                <ProcessTab onProcessSuccess={fetchStats} />
              </TabsContent>

              <TabsContent value="receipts" className="mt-6">
                <ReceiptsTab />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
