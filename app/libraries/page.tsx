import { getSupabaseServerClient } from "@/lib/supabase-server"
import { NavBar } from "@/components/nav-bar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreateLibraryDialog } from "@/components/create-library-dialog"
import { EditLibraryDialog } from "@/components/edit-library-dialog"
import type { Library } from "@/lib/types"

export default async function LibrariesPage() {
  const supabase = await getSupabaseServerClient()

  const { data: libraries } = await supabase.from("libraries").select("*").order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Libraries</h1>
            <p className="text-muted-foreground">Manage compound and material libraries</p>
          </div>
          <CreateLibraryDialog />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {libraries?.map((library: Library) => (
            <Card key={library.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="mb-2">{library.name}</CardTitle>
                    <div className="flex gap-2 items-center">
                      <Badge variant="outline">{library.library_type}</Badge>
                      {library.active ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-500/10 text-gray-700 dark:text-gray-400">
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {library.description && <p className="text-sm text-muted-foreground mb-3">{library.description}</p>}
                <EditLibraryDialog library={library} />
              </CardContent>
            </Card>
          ))}
        </div>

        {(!libraries || libraries.length === 0) && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No libraries found. Create your first library!</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
