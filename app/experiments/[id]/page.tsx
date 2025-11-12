import { getSupabaseServerClient } from "@/lib/supabase-server"
import { NavBar } from "@/components/nav-bar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CreatePlateDialog } from "@/components/create-plate-dialog"
import { PlateCard } from "@/components/plate-card"

export default async function ExperimentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await getSupabaseServerClient()

  const { data: experiment } = await supabase.from("experiments").select("*, project:projects(*)").eq("id", id).single()

  if (!experiment) {
    notFound()
  }

  const { data: plates } = await supabase
    .from("plates")
    .select("*")
    .eq("experiment_id", id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href={`/projects/${experiment.project_id}`}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to {experiment.project?.name}
          </Link>
        </Button>

        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">{experiment.project?.name}</div>
              <h1 className="text-3xl font-bold mb-2">{experiment.name}</h1>
              <p className="text-muted-foreground">{experiment.description || "No description"}</p>
            </div>
            <Badge variant={experiment.status === "in_progress" ? "default" : "secondary"} className="text-sm">
              {experiment.status}
            </Badge>
          </div>

          <div className="flex gap-4 text-sm text-muted-foreground">
            {experiment.start_date && <div>Start: {new Date(experiment.start_date).toLocaleDateString()}</div>}
            {experiment.end_date && <div>End: {new Date(experiment.end_date).toLocaleDateString()}</div>}
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Plates ({plates?.length || 0})</h2>
          <CreatePlateDialog experimentId={id} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plates?.map((plate: any) => (
            <PlateCard key={plate.id} plate={plate} />
          ))}
        </div>

        {(!plates || plates.length === 0) && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No plates yet</p>
              <CreatePlateDialog experimentId={id} />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
