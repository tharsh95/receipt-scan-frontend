import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Cog, CheckCircle, AlertCircle, RefreshCw, FileText, DollarSign, Building, Calendar } from "lucide-react"

interface ProcessTabProps {
  onProcessSuccess: () => void
}

interface FileToProcess {
  id: string
  file_name: string
  file_path: string
  is_processed: boolean
  created_at: string
}

interface ProcessedReceipt {
  id: string
  file_name: string
  merchant_name: string
  total_amount: number
  purchased_at: string
  created_at: string
}

export default function ProcessTab({ onProcessSuccess }: ProcessTabProps) {
  const [unprocessedFiles, setUnprocessedFiles] = useState<FileToProcess[]>([])
  const [processedReceipts, setProcessedReceipts] = useState<ProcessedReceipt[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string[]>([])
  const [processingProgress, setProcessingProgress] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem("token")

      // Fetch unprocessed files
      const unprocessedResponse = await fetch("/api/files/unprocessed", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (unprocessedResponse.ok) {
        const unprocessedData = await unprocessedResponse.json()
        setUnprocessedFiles(unprocessedData.files)
      }

      // Fetch recent processed receipts
      const processedResponse = await fetch("/api/receipts?limit=5", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (processedResponse.ok) {
        const processedData = await processedResponse.json()
        setProcessedReceipts(processedData.receipts)
      }
    } catch (error) {
      console.error("Error fetching files:", error)
    } finally {
      setLoading(false)
    }
  }

  const processFile = async (fileId: string) => {
    setProcessing((prev) => [...prev, fileId])
    setProcessingProgress((prev) => ({ ...prev, [fileId]: 0 }))

    // Simulate processing progress
    const progressInterval = setInterval(() => {
      setProcessingProgress((prev) => ({
        ...prev,
        [fileId]: Math.min((prev[fileId] || 0) + 15, 90),
      }))
    }, 500)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ file_id: fileId }),
      })

      clearInterval(progressInterval)
      setProcessingProgress((prev) => ({ ...prev, [fileId]: 100 }))

      if (response.ok) {
        await fetchFiles()
        onProcessSuccess()
      }
    } catch (error) {
      console.error("Error processing file:", error)
      clearInterval(progressInterval)
    } finally {
      setProcessing((prev) => prev.filter((id) => id !== fileId))
      setTimeout(() => {
        setProcessingProgress((prev) => {
          const newProgress = { ...prev }
          delete newProgress[fileId]
          return newProgress
        })
      }, 2000)
    }
  }

  const processAllFiles = async () => {
    for (const file of unprocessedFiles) {
      await processFile(file.id)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p>Loading files...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Receipt Processing</h3>
          <p className="text-sm text-gray-600">Extract information from validated PDF receipts using OCR/AI</p>
        </div>
        {unprocessedFiles.length > 0 && (
          <Button onClick={processAllFiles} disabled={processing.length > 0}>
            <Cog className="h-4 w-4 mr-2" />
            Process All
          </Button>
        )}
      </div>

      {unprocessedFiles.length === 0 && processedReceipts.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No files available for processing. Upload and validate some PDF files first.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Unprocessed Files */}
          {unprocessedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  Pending Processing ({unprocessedFiles.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {unprocessedFiles.map((file) => (
                    <div key={file.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="font-medium">{file.file_name}</p>
                            <p className="text-sm text-gray-500">
                              Uploaded: {new Date(file.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => processFile(file.id)} disabled={processing.includes(file.id)}>
                          {processing.includes(file.id) ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Cog className="h-4 w-4 mr-2" />
                              Process
                            </>
                          )}
                        </Button>
                      </div>

                      {processing.includes(file.id) && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Extracting receipt data...</span>
                            <span>{processingProgress[file.id] || 0}%</span>
                          </div>
                          <Progress value={processingProgress[file.id] || 0} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recently Processed Receipts */}
          {processedReceipts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Recently Processed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {processedReceipts.map((receipt) => (
                    <div
                      key={receipt.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-green-50"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">{receipt.file_name}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <div className="flex items-center space-x-1">
                              <Building className="h-3 w-3" />
                              <span>{receipt.merchant_name}</span>
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
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Processed
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Alert>
        <Cog className="h-4 w-4" />
        <AlertDescription>
          <strong>Processing Details:</strong> Our AI system extracts merchant name, purchase date, total amount, and
          other relevant information from your receipts. Processing typically takes 10-30 seconds per file.
        </AlertDescription>
      </Alert>
    </div>
  )
}
