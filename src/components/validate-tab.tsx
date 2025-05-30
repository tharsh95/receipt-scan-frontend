"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileCheck, CheckCircle, XCircle, AlertCircle, RefreshCw, FileText } from "lucide-react"

interface ValidationTabProps {
  onValidationSuccess: () => void
}

interface FileToValidate {
  id: string
  file_name: string
  file_path: string
  is_valid: boolean | null
  invalid_reason: string | null
  created_at: string
}

export default function ValidateTab({ onValidationSuccess }: ValidationTabProps) {
  const [files, setFiles] = useState<FileToValidate[]>([])
  const [loading, setLoading] = useState(true)
  const [validating, setValidating] = useState<string[]>([])

  useEffect(() => {
    fetchUnvalidatedFiles()
  }, [])

  const fetchUnvalidatedFiles = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/files/unvalidated", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setFiles(data.files)
      }
    } catch (error) {
      console.error("Error fetching files:", error)
    } finally {
      setLoading(false)
    }
  }

  const validateFile = async (fileId: string) => {
    setValidating((prev) => [...prev, fileId])

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ file_id: fileId }),
      })

      if (response.ok) {
        await fetchUnvalidatedFiles()
        onValidationSuccess()
      }
    } catch (error) {
      console.error("Error validating file:", error)
    } finally {
      setValidating((prev) => prev.filter((id) => id !== fileId))
    }
  }

  const validateAllFiles = async () => {
    const unvalidatedFiles = files.filter((file) => file.is_valid === null)

    for (const file of unvalidatedFiles) {
      await validateFile(file.id)
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

  const unvalidatedFiles = files.filter((file) => file.is_valid === null)
  const validatedFiles = files.filter((file) => file.is_valid !== null)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">File Validation</h3>
          <p className="text-sm text-gray-600">Validate uploaded PDF files to ensure they can be processed</p>
        </div>
        {unvalidatedFiles.length > 0 && (
          <Button onClick={validateAllFiles} disabled={validating.length > 0}>
            <FileCheck className="h-4 w-4 mr-2" />
            Validate All
          </Button>
        )}
      </div>

      {unvalidatedFiles.length === 0 && validatedFiles.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No files available for validation. Upload some PDF files first.</AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Unvalidated Files */}
          {unvalidatedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  Pending Validation ({unvalidatedFiles.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {unvalidatedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">{file.file_name}</p>
                          <p className="text-sm text-gray-500">
                            Uploaded: {new Date(file.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => validateFile(file.id)} disabled={validating.includes(file.id)}>
                        {validating.includes(file.id) ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Validating...
                          </>
                        ) : (
                          <>
                            <FileCheck className="h-4 w-4 mr-2" />
                            Validate
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Validated Files */}
          {validatedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Validation Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {validatedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">{file.file_name}</p>
                          <p className="text-sm text-gray-500">
                            Uploaded: {new Date(file.created_at).toLocaleDateString()}
                          </p>
                          {file.invalid_reason && <p className="text-sm text-red-600 mt-1">{file.invalid_reason}</p>}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {file.is_valid ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Valid
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Invalid
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Alert>
        <FileCheck className="h-4 w-4" />
        <AlertDescription>
          <strong>Validation Process:</strong> Files are checked for PDF format compliance, readability, and basic
          structure. Only valid files can proceed to processing.
        </AlertDescription>
      </Alert>
    </div>
  )
}
