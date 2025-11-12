import { getSupabaseServerClient } from "@/lib/supabase-server"
import { NavBar } from "@/components/nav-bar"
import { Card, CardContent } from "@/components/ui/card"
import { PlateCard } from "@/components/plate-card"
import { PlateFilters } from "@/components/plate-filters"

export default async function PlatesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string; search?: string }>
}) {
  const params = await searchParams
  const supabase = await getSupabaseServerClient()

  let query = supabase
    .from("plates")
    .select("*, experiment:experiments(name, project:projects(name))")
    .order("created_at", { ascending: false })

  if (params.status) {
    query = query.eq("status", params.status)
  }

  if (params.type) {
    query = query.eq("plate_type", params.type)
  }

  if (params.search) {
    query = query.ilike("plate_id", `%${params.search}%`)
  }

  const { data: plates } = await query

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">All Plates</h1>
          <p className="text-muted-foreground">Browse and filter all plates in the system</p>
        </div>

        <PlateFilters />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {plates?.map((plate: any) => (
            <PlateCard key={plate.id} plate={plate} showExperiment />
          ))}
        </div>

        {(!plates || plates.length === 0) && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No plates found</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
