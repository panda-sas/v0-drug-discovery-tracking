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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export function CreateLibraryDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [libraryType, setLibraryType] = useState("compound")
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = getSupabaseBrowserClient()

    const { error } = await supabase.from("libraries").insert({
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
      library_type: libraryType,
      active: true,
    })

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Library created successfully",
      })
      setOpen(false)
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Library
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Library</DialogTitle>
            <DialogDescription>Add a new library to the system</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Library Name *</Label>
              <Input id="name" name="name" required placeholder="e.g., Kinase Inhibitors" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="library_type">Library Type *</Label>
              <Select value={libraryType} onValueChange={setLibraryType}>
                <SelectTrigger id="library_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compound">Compound</SelectItem>
                  <SelectItem value="peptide">Peptide</SelectItem>
                  <SelectItem value="protein">Protein</SelectItem>
                  <SelectItem value="dna">DNA</SelectItem>
                  <SelectItem value="rna">RNA</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" placeholder="Optional description of this library" />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Library"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
