"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileSpreadsheet, Download } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function ImportPlatesDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const extension = selectedFile.name.split(".").pop()?.toLowerCase()
      if (extension === "csv" || extension === "xlsx") {
        setFile(selectedFile)
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a CSV or XLSX file",
          variant: "destructive",
        })
      }
    }
  }

  const parseCSV = (text: string): any[] => {
    const lines = text.split("\n").filter((line) => line.trim())
    const headers = lines[0].split(",").map((h) => h.trim())

    return lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim())
      const obj: any = {}
      headers.forEach((header, index) => {
        obj[header] = values[index] || null
      })
      return obj
    })
  }

  const handleImport = async () => {
    if (!file) return

    setLoading(true)
    const supabase = getSupabaseBrowserClient()

    try {
      const text = await file.text()
      const extension = file.name.split(".").pop()?.toLowerCase()

      let plates: any[] = []

      if (extension === "csv") {
        plates = parseCSV(text)
      } else if (extension === "xlsx") {
        // For XLSX, we'd need a library like xlsx. For now, show error
        toast({
          title: "XLSX Support Coming Soon",
          description: "Please use CSV format for now",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Validate and insert plates
      const validPlates = plates
        .filter((p) => p.plate_id && p.experiment_id && p.plate_type)
        .map((p) => ({
          plate_id: p.plate_id,
          experiment_id: p.experiment_id,
          plate_type: p.plate_type,
          library_id: p.library_id || null,
          scientist_id: p.scientist_id || null,
          location: p.location || null,
          notes: p.notes || null,
          status: p.status || "available",
        }))

      if (validPlates.length === 0) {
        toast({
          title: "No valid plates found",
          description: "Please check your CSV format",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const { error } = await supabase.from("plates").insert(validPlates)

      if (error) {
        toast({
          title: "Import failed",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Import successful",
          description: `${validPlates.length} plates imported successfully`,
        })
        setOpen(false)
        setFile(null)
        router.refresh()
      }
    } catch (error) {
      toast({
        title: "Error parsing file",
        description: "Please check your file format",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  const downloadTemplate = () => {
    const template = `plate_id,experiment_id,plate_type,library_id,scientist_id,location,notes,status
PLT-001-001,exp-id-here,96-well,lib-id-here,sci-id-here,Freezer 1,Sample notes,available
PLT-001-002,exp-id-here,384-well,,,Freezer 2,,available`

    const blob = new Blob([template], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "plate_import_template.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Import Plates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Plates from File</DialogTitle>
          <DialogDescription>Upload a CSV or XLSX file to import multiple plates at once</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <FileSpreadsheet className="h-4 w-4" />
            <AlertDescription>
              Your file should include columns: plate_id, experiment_id, plate_type, library_id, scientist_id, location,
              notes, status
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="file">Select File</Label>
            <Input id="file" type="file" accept=".csv,.xlsx" onChange={handleFileChange} className="cursor-pointer" />
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          <Button type="button" variant="outline" onClick={downloadTemplate} className="w-full bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            Download CSV Template
          </Button>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={loading || !file}>
            {loading ? "Importing..." : "Import Plates"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
