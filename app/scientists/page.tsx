import { getSupabaseServerClient } from "@/lib/supabase-server"
import { NavBar } from "@/components/nav-bar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreateScientistDialog } from "@/components/create-scientist-dialog"
import { Mail } from "lucide-react"

export default async function ScientistsPage() {
  const supabase = await getSupabaseServerClient()

  const { data: scientists } = await supabase.from("scientists").select("*").order("name", { ascending: true })

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Scientists</h1>
            <p className="text-muted-foreground">Manage lab personnel and their roles</p>
          </div>
          <CreateScientistDialog />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scientists?.map((scientist: any) => (
            <Card key={scientist.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="mb-2">{scientist.name}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {scientist.email}
                    </div>
                  </div>
                  {scientist.active ? (
                    <Badge variant="default">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="capitalize">
                  {scientist.role.replace("_", " ")}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {(!scientists || scientists.length === 0) && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No scientists yet</p>
              <CreateScientistDialog />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
