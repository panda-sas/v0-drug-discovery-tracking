import { getSupabaseServerClient } from "@/lib/supabase-server"
import { NavBar } from "@/components/nav-bar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CreateExperimentDialog } from "@/components/create-experiment-dialog"

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await getSupabaseServerClient()

  const { data: project } = await supabase.from("projects").select("*").eq("id", id).single()

  if (!project) {
    notFound()
  }

  const { data: experiments } = await supabase
    .from("experiments")
    .select(`
      *,
      plates:plates(count)
    `)
    .eq("project_id", id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/projects">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Projects
          </Link>
        </Button>

        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
              <p className="text-muted-foreground">{project.description || "No description"}</p>
            </div>
            <Badge variant={project.status === "active" ? "default" : "secondary"} className="text-sm">
              {project.status}
            </Badge>
          </div>

          <div className="flex gap-4 text-sm text-muted-foreground">
            <div>Created: {new Date(project.created_at).toLocaleDateString()}</div>
            <div>Updated: {new Date(project.updated_at).toLocaleDateString()}</div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Experiments</h2>
          <CreateExperimentDialog projectId={id} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiments?.map((experiment: any) => (
            <Card key={experiment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="mb-2">{experiment.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {experiment.description || "No description"}
                    </CardDescription>
                  </div>
                  <Badge variant={experiment.status === "in_progress" ? "default" : "secondary"}>
                    {experiment.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {experiment.start_date && (
                    <div className="text-sm text-muted-foreground">
                      Start: {new Date(experiment.start_date).toLocaleDateString()}
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">{experiment.plates[0]?.count || 0} plates</div>
                </div>
                <Button variant="ghost" size="sm" asChild className="w-full">
                  <Link href={`/experiments/${experiment.id}`}>
                    View Plates
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {(!experiments || experiments.length === 0) && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No experiments yet</p>
              <CreateExperimentDialog projectId={id} />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
