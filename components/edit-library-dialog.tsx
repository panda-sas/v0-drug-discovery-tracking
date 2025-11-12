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
import { Switch } from "@/components/ui/switch"
import { Pencil } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import type { Library } from "@/lib/types"

export function EditLibraryDialog({ library }: { library: Library }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [libraryType, setLibraryType] = useState(library.library_type)
  const [active, setActive] = useState(library.active)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = getSupabaseBrowserClient()

    const { error } = await supabase
      .from("libraries")
      .update({
        name: formData.get("name") as string,
        description: (formData.get("description") as string) || null,
        library_type: libraryType,
        active: active,
      })
      .eq("id", library.id)

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Library updated successfully",
      })
      setOpen(false)
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Library</DialogTitle>
            <DialogDescription>Update library information</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Library Name *</Label>
              <Input id="name" name="name" required defaultValue={library.name} />
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
              <Textarea id="description" name="description" defaultValue={library.description || ""} />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="active">Active Status</Label>
              <Switch id="active" checked={active} onCheckedChange={setActive} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Library"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
