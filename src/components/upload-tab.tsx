"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { uploadReceipt } from "@/services/receipts"

interface UploadTabProps {
  onUploadSuccess: () => void
}

interface UploadedFile {
  file: File
  status: "uploading" | "success" | "error"
  progress: number
  message?: string
  id?: string
}

export default function UploadTab({ onUploadSuccess }: UploadTabProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const uploadMutation = useMutation({
    mutationFn: uploadReceipt,
    onSuccess: (data, variables) => {
      setUploadedFiles((prev) =>
        prev.map((file) =>
          file.file === variables
            ? {
                ...file,
                status: "success",
                progress: 100,
                message: data.message,
                id: data.id,
              }
            : file
        )
      );
      onUploadSuccess();
    },
    onError: (error, variables) => {
      setUploadedFiles((prev) =>
        prev.map((file) =>
          file.file === variables
            ? {
                ...file,
                status: "error",
                progress: 100,
                message: error instanceof Error ? error.message : "Upload failed",
              }
            : file
        )
      );
    },
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
        file,
        status: "uploading",
        progress: 0,
      }));

      setUploadedFiles((prev) => [...prev, ...newFiles]);

      for (const file of newFiles) {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.file === file.file
                ? { ...f, progress: Math.min(f.progress + 10, 90) }
                : f
            )
          );
        }, 100);

        try {
          await uploadMutation.mutateAsync(file.file);
        } finally {
          clearInterval(progressInterval);
        }
      }
    },
    [uploadMutation]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: true,
    disabled: uploadMutation.isPending,
  });

  const clearFiles = () => {
    setUploadedFiles([]);
  };

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
        } ${uploadMutation.isPending ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        {isDragActive ? (
          <p className="text-lg text-blue-600">Drop the PDF files here...</p>
        ) : (
          <div>
            <p className="text-lg text-gray-600 mb-2">Drag & drop PDF receipts here, or click to select files</p>
            <p className="text-sm text-gray-500">Only PDF files are accepted</p>
          </div>
        )}
      </div>

      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Upload Progress</h3>
              <Button variant="outline" size="sm" onClick={clearFiles} disabled={uploadMutation.isPending}>
                Clear All
              </Button>
            </div>

            <div className="space-y-4">
              {uploadedFiles.map((uploadedFile, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium truncate max-w-xs">{uploadedFile.file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {uploadedFile.status === "uploading" && (
                        <AlertCircle className="h-4 w-4 text-blue-500 animate-spin" />
                      )}
                      {uploadedFile.status === "success" && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {uploadedFile.status === "error" && <XCircle className="h-4 w-4 text-red-500" />}
                    </div>
                  </div>

                  <Progress value={uploadedFile.progress} className="mb-2" />

                  {uploadedFile.message && (
                    <p
                      className={`text-xs ${
                        uploadedFile.status === "success"
                          ? "text-green-600"
                          : uploadedFile.status === "error"
                            ? "text-red-600"
                            : "text-blue-600"
                      }`}
                    >
                      {uploadedFile.message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Note:</strong> Only PDF files are accepted. Files will be stored securely and processed for receipt
          information extraction.
        </AlertDescription>
      </Alert>
    </div>
  );
}
