import { getSupabaseServerClient } from "@/lib/supabase-server"
import { NavBar } from "@/components/nav-bar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Microscope, FlaskConical, Users, FolderOpen } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient()

  // Get plate status counts
  const { data: platesByStatus } = await supabase.from("plates").select("status")

  const statusCounts = {
    available: platesByStatus?.filter((p) => p.status === "available").length || 0,
    checked_out: platesByStatus?.filter((p) => p.status === "checked_out").length || 0,
    in_use: platesByStatus?.filter((p) => p.status === "in_use").length || 0,
    completed: platesByStatus?.filter((p) => p.status === "completed").length || 0,
    archived: platesByStatus?.filter((p) => p.status === "archived").length || 0,
  }

  // Get counts
  const { count: projectCount } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")

  const { count: experimentCount } = await supabase
    .from("experiments")
    .select("*", { count: "exact", head: true })
    .in("status", ["planning", "in_progress"])

  const { count: scientistCount } = await supabase
    .from("scientists")
    .select("*", { count: "exact", head: true })
    .eq("active", true)

  // Get recent transactions
  const { data: recentTransactions } = await supabase
    .from("plate_transactions")
    .select(`
      *,
      scientist:scientists(name),
      plate:plates(plate_id)
    `)
    .order("transaction_date", { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Platrix: Plate management for drug discovery. </h1>
          <p className="text-muted-foreground">Monitor plate status, experiments, and lab activities</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectCount || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Experiments</CardTitle>
              <FlaskConical className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{experimentCount || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Scientists</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scientistCount || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Plates</CardTitle>
              <Microscope className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.values(statusCounts).reduce((a, b) => a + b, 0)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Plate Status Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Plate Status Overview</CardTitle>
            <CardDescription>Current distribution of plates by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Available</span>
                  <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400">
                    {statusCounts.available}
                  </Badge>
                </div>
                <div className="text-2xl font-bold">{statusCounts.available}</div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Checked Out</span>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400">
                    {statusCounts.checked_out}
                  </Badge>
                </div>
                <div className="text-2xl font-bold">{statusCounts.checked_out}</div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">In Use</span>
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
                    {statusCounts.in_use}
                  </Badge>
                </div>
                <div className="text-2xl font-bold">{statusCounts.in_use}</div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Completed</span>
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-700 dark:text-purple-400">
                    {statusCounts.completed}
                  </Badge>
                </div>
                <div className="text-2xl font-bold">{statusCounts.completed}</div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Archived</span>
                  <Badge variant="outline" className="bg-gray-500/10 text-gray-700 dark:text-gray-400">
                    {statusCounts.archived}
                  </Badge>
                </div>
                <div className="text-2xl font-bold">{statusCounts.archived}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest plate check-in/check-out activity</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTransactions && recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {recentTransactions.map((transaction: any) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={transaction.action === "check_out" ? "default" : "secondary"}>
                          {transaction.action === "check_out" ? "Check Out" : "Check In"}
                        </Badge>
                        <span className="font-medium">{transaction.plate?.plate_id}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {transaction.scientist?.name} • {new Date(transaction.transaction_date).toLocaleString()}
                      </div>
                      {transaction.notes && (
                        <div className="text-sm text-muted-foreground mt-1">{transaction.notes}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm">
                        <span className="text-muted-foreground">{transaction.previous_status}</span>
                        {" → "}
                        <span className="font-medium">{transaction.new_status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No transactions yet</div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
