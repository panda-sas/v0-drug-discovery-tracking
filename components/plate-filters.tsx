"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"

export function PlateFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/plates?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push("/plates")
  }

  const hasFilters = searchParams.has("status") || searchParams.has("type") || searchParams.has("search")

  return (
    <div className="flex gap-4 items-center flex-wrap">
      <div className="flex-1 min-w-[200px]">
        <Input
          placeholder="Search by plate ID..."
          defaultValue={searchParams.get("search") || ""}
          onChange={(e) => {
            const value = e.target.value
            setTimeout(() => handleFilterChange("search", value), 300)
          }}
        />
      </div>

      <Select
        value={searchParams.get("status") || "all"}
        onValueChange={(value) => handleFilterChange("status", value === "all" ? "" : value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="available">Available</SelectItem>
          <SelectItem value="checked_out">Checked Out</SelectItem>
          <SelectItem value="in_use">In Use</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="archived">Archived</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("type") || "all"}
        onValueChange={(value) => handleFilterChange("type", value === "all" ? "" : value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="96-well">96-well</SelectItem>
          <SelectItem value="384-well">384-well</SelectItem>
          <SelectItem value="1536-well">1536-well</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  )
}
