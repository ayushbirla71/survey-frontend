"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

interface ImportDialogProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete: (file: File) => Promise<void>
}

export default function ImportDialog({ isOpen, onClose, onImportComplete }: ImportDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const validTypes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ]

      if (!validTypes.includes(file.type) && !file.name.endsWith(".csv") && !file.name.endsWith(".xlsx")) {
        setError("Please select a CSV or Excel file")
        return
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB")
        return
      }

      setSelectedFile(file)
      setError(null)
      setSuccess(null)
    }
  }

  const handleImport = async () => {
    if (!selectedFile) {
      setError("Please select a file first")
      return
    }

    try {
      setImporting(true)
      setError(null)
      setSuccess(null)

      await onImportComplete(selectedFile)

      setSuccess("Import completed successfully!")
      setTimeout(() => {
        onClose()
        setSelectedFile(null)
        setSuccess(null)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed")
    } finally {
      setImporting(false)
    }
  }

  const handleClose = () => {
    if (!importing) {
      onClose()
      setSelectedFile(null)
      setError(null)
      setSuccess(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Audience Data</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Select File</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                disabled={importing}
                className="flex-1"
              />
              <Upload className="h-4 w-4 text-slate-400" />
            </div>
            <p className="text-xs text-slate-500">Supported formats: CSV, Excel (.xlsx). Maximum file size: 10MB</p>
          </div>

          {/* Selected File Info */}
          {selectedFile && (
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
              <FileText className="h-4 w-4 text-slate-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
          )}

          {/* Required Fields Info */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Required columns:</strong> firstName, lastName, email
              <br />
              <strong>Optional columns:</strong> phone, ageGroup, gender, city, state, country, industry, jobTitle,
              education, income
            </AlertDescription>
          </Alert>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose} disabled={importing}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={!selectedFile || importing}>
              {importing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                "Import Data"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
