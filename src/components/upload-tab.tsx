import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload } from "lucide-react"
import { useUpload } from "@/hooks/useUpload"
import { toast } from "sonner"

interface UploadTabProps {
  onUploadSuccess?: () => void
}

export default function UploadTab({ onUploadSuccess }: UploadTabProps) {
  const { uploadFile, isUploading, error } = useUpload()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      for (const file of acceptedFiles) {
        await uploadFile(file)
      }
      toast.success("Files uploaded successfully")
      onUploadSuccess?.()
    } catch  {
      toast.error("Failed to upload files")
    }
  }, [uploadFile, error, onUploadSuccess])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    disabled: isUploading
  })

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
        } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        {isDragActive ? (
          <p className="text-lg text-blue-600">Drop the PDF files here...</p>
        ) : (
          <div>
            <p className="text-lg text-gray-600 mb-2">Drag & drop PDF/JPG/PNG receipts here, or click to select files</p>
            {/* <p className="text-sm text-gray-500">Only PDF files are accepted</p> */}
          </div>
        )}
      </div>

      {isUploading && (
        <div className="text-center text-gray-600">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Uploading files...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          <p>{error}</p>
        </div>
      )}
    </div>
  )
}
