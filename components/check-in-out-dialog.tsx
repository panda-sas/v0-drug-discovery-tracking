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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSupabaseBrowserClient } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import type { Plate } from "@/lib/types"

interface CheckInOutDialogProps {
  plate: Plate
}

export function CheckInOutDialog({ plate }: CheckInOutDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [scientistId, setScientistId] = useState("")
  const [newStatus, setNewStatus] = useState("")
  const [notes, setNotes] = useState("")
  const [scientists, setScientists] = useState<any[]>([])
  const router = useRouter()
  const { toast } = useToast()

  const handleOpen = async () => {
    setOpen(true)
    const supabase = getSupabaseBrowserClient()
    const { data } = await supabase.from("scientists").select("*").eq("active", true).order("name")
    setScientists(data || [])

    // Set default new status based on current status
    if (plate.status === "available") {
      setNewStatus("checked_out")
    } else if (plate.status === "checked_out") {
      setNewStatus("in_use")
    } else {
      setNewStatus("available")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!scientistId || !newStatus) return

    setLoading(true)
    const supabase = getSupabaseBrowserClient()

    try {
      // Determine action based on status change
      const action = newStatus === "checked_out" ? "check_out" : "check_in"

      // Insert transaction
      const { error: transactionError } = await supabase.from("plate_transactions").insert({
        plate_id: plate.id,
        scientist_id: scientistId,
        action,
        previous_status: plate.status,
        new_status: newStatus,
        notes: notes || null,
      })

      if (transactionError) throw transactionError

      // Update plate status
      const { error: plateError } = await supabase.from("plates").update({ status: newStatus }).eq("id", plate.id)

      if (plateError) throw plateError

      toast({
        title: "Success",
        description: `Plate ${action === "check_out" ? "checked out" : "checked in"} successfully`,
      })

      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("[v0] Error updating plate:", error)
      toast({
        title: "Error",
        description: "Failed to update plate status",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="w-full" onClick={handleOpen}>
          Update Status
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Update Plate Status</DialogTitle>
            <DialogDescription>Check in or check out plate {plate.plate_id}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Status</Label>
              <div className="text-sm text-muted-foreground capitalize">{plate.status.replace("_", " ")}</div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scientist">Scientist *</Label>
              <Select value={scientistId} onValueChange={setScientistId} required>
                <SelectTrigger id="scientist">
                  <SelectValue placeholder="Select scientist" />
                </SelectTrigger>
                <SelectContent>
                  {scientists.map((scientist) => (
                    <SelectItem key={scientist.id} value={scientist.id}>
                      {scientist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">New Status *</Label>
              <Select value={newStatus} onValueChange={setNewStatus} required>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="checked_out">Checked Out</SelectItem>
                  <SelectItem value="in_use">In Use</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Optional notes about this transaction"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !scientistId || !newStatus}>
              {loading ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
