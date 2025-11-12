"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import type { Experiment, Library, Scientist, Set } from "@/lib/types"

export function CreateStandalonePlateDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [plateType, setPlateType] = useState("96-well")
  const [experimentId, setExperimentId] = useState("")
  const [libraryId, setLibraryId] = useState("")
  const [scientistId, setScientistId] = useState("")
  const [setId, setSetId] = useState("")
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [libraries, setLibraries] = useState<Library[]>([])
  const [scientists, setScientists] = useState<Scientist[]>([])
  const [sets, setSets] = useState<Set[]>([])
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const loadData = async () => {
      const supabase = getSupabaseBrowserClient()

      const { data: expData } = await supabase
        .from("experiments")
        .select("*, project:projects(name)")
        .eq("status", "active")
        .order("name")

      const { data: libData } = await supabase.from("libraries").select("*").eq("active", true).order("name")

      const { data: sciData } = await supabase.from("scientists").select("*").eq("active", true).order("name")

      const { data: setData } = await supabase.from("sets").select("*").eq("active", true).order("name")

      if (expData) setExperiments(expData)
      if (libData) setLibraries(libData)
      if (sciData) setScientists(sciData)
      if (setData) setSets(setData)
    }

    if (open) {
      loadData()
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = getSupabaseBrowserClient()

    const { error } = await supabase.from("plates").insert({
      experiment_id: experimentId,
      plate_id: formData.get("plate_id") as string,
      plate_type: plateType,
      library_id: libraryId || null,
      scientist_id: scientistId || null,
      set_id: setId || null,
      location: (formData.get("location") as string) || null,
      notes: (formData.get("notes") as string) || null,
      status: "available",
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
        description: "Plate created successfully",
      })
      setOpen(false)
      router.refresh()
    }

    setLoading(false)
  }

  const getSetTypeLabel = (setType: string) => {
    const labels: Record<string, string> = {
      vendor: "Vendor",
      master: "Master (Mother)",
      screening: "Screening (Daughter)",
      hit_collection: "Hit Collection",
    }
    return labels[setType] || setType
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Plate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Plate</DialogTitle>
            <DialogDescription>Add a new plate to the system</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="experiment_id">Experiment *</Label>
              <Select value={experimentId} onValueChange={setExperimentId} required>
                <SelectTrigger id="experiment_id">
                  <SelectValue placeholder="Select experiment" />
                </SelectTrigger>
                <SelectContent>
                  {experiments.map((exp: any) => (
                    <SelectItem key={exp.id} value={exp.id}>
                      {exp.name} ({exp.project?.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plate_id">Plate ID *</Label>
              <Input id="plate_id" name="plate_id" required placeholder="e.g., PLT-001-001" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plate_type">Plate Type *</Label>
                <Select value={plateType} onValueChange={setPlateType}>
                  <SelectTrigger id="plate_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="96-well">96-well</SelectItem>
                    <SelectItem value="384-well">384-well</SelectItem>
                    <SelectItem value="1536-well">1536-well</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" placeholder="e.g., Freezer 1, Shelf A" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="set_id">Set</Label>
              <Select value={setId} onValueChange={setSetId}>
                <SelectTrigger id="set_id">
                  <SelectValue placeholder="Select set (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {sets.map((set) => (
                    <SelectItem key={set.id} value={set.id}>
                      {set.name} - {getSetTypeLabel(set.set_type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="library_id">Library</Label>
                <Select value={libraryId} onValueChange={setLibraryId}>
                  <SelectTrigger id="library_id">
                    <SelectValue placeholder="Select library (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {libraries.map((lib) => (
                      <SelectItem key={lib.id} value={lib.id}>
                        {lib.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scientist_id">Assigned Scientist</Label>
                <Select value={scientistId} onValueChange={setScientistId}>
                  <SelectTrigger id="scientist_id">
                    <SelectValue placeholder="Select scientist (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {scientists.map((sci) => (
                      <SelectItem key={sci.id} value={sci.id}>
                        {sci.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" placeholder="Optional notes about this plate" />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !experimentId}>
              {loading ? "Creating..." : "Create Plate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
