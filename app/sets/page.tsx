import { getSupabaseServer } from "@/lib/supabase-server"
import type { Set } from "@/lib/types"
import { CreateSetDialog } from "@/components/create-set-dialog"
import { EditSetDialog } from "@/components/edit-set-dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function SetsPage() {
  const supabase = await getSupabaseServer()

  const { data: sets, error } = await supabase.from("sets").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error loading sets:", error)
  }

  const setTypes = {
    vendor: { label: "Vendor", color: "bg-purple-500/10 text-purple-700 dark:text-purple-400" },
    master: { label: "Master (Mother)", color: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
    screening: { label: "Screening (Daughter)", color: "bg-green-500/10 text-green-700 dark:text-green-400" },
    hit_collection: { label: "Hit Collection", color: "bg-amber-500/10 text-amber-700 dark:text-amber-400" },
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Plate Sets</h1>
            <p className="text-muted-foreground">Manage sets of plates organized by type</p>
          </div>
          <CreateSetDialog />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sets?.map((set: Set) => (
            <Card key={set.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{set.name}</CardTitle>
                    <Badge className={setTypes[set.set_type].color}>{setTypes[set.set_type].label}</Badge>
                  </div>
                  <EditSetDialog set={set} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{set.description || "No description"}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Status</span>
                  <Badge variant={set.active ? "default" : "secondary"}>{set.active ? "Active" : "Inactive"}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {(!sets || sets.length === 0) && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>No sets found. Create your first set to get started.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
