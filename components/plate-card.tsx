"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckInOutDialog } from "./check-in-out-dialog"
import { EditPlateDialog } from "./edit-plate-dialog"
import { MapPin, LibraryIcon, User } from "lucide-react"
import type { Plate } from "@/lib/types"

interface PlateCardProps {
  plate: Plate & { experiment?: any }
  showExperiment?: boolean
}

const statusColors = {
  available: "bg-green-500/10 text-green-700 dark:text-green-400",
  checked_out: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  in_use: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  completed: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  archived: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
}

export function PlateCard({ plate, showExperiment = false }: PlateCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="mb-2">{plate.plate_id}</CardTitle>
            {showExperiment && plate.experiment && (
              <div className="text-sm text-muted-foreground mb-2">
                {plate.experiment.project?.name} / {plate.experiment.name}
              </div>
            )}
            <Badge variant="outline">{plate.plate_type}</Badge>
          </div>
          <Badge variant="outline" className={statusColors[plate.status]}>
            {plate.status.replace("_", " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {plate.library && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <LibraryIcon className="h-4 w-4" />
            <span className="font-medium">{plate.library.name}</span>
          </div>
        )}

        {plate.scientist && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <User className="h-4 w-4" />
            <span className="font-medium">{plate.scientist.name}</span>
          </div>
        )}

        {plate.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <MapPin className="h-4 w-4" />
            {plate.location}
          </div>
        )}
        {plate.notes && <div className="text-sm text-muted-foreground mb-3 bg-muted/50 rounded p-2">{plate.notes}</div>}

        <div className="flex gap-2 w-full">
          <div className="flex-1">
            <EditPlateDialog plate={plate} />
          </div>
          <div className="flex-1">
            <CheckInOutDialog plate={plate} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
