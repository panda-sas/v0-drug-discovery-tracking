import { getSupabaseServerClient } from "@/lib/supabase-server"
import { NavBar } from "@/components/nav-bar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function TransactionsPage() {
  const supabase = await getSupabaseServerClient()

  const { data: transactions } = await supabase
    .from("plate_transactions")
    .select(`
      *,
      scientist:scientists(name, email),
      plate:plates(plate_id, plate_type)
    `)
    .order("transaction_date", { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Transaction History</h1>
          <p className="text-muted-foreground">Complete log of all plate check-in/check-out activities</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions && transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((transaction: any) => (
                  <div key={transaction.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={transaction.action === "check_out" ? "default" : "secondary"}>
                          {transaction.action === "check_out" ? "Check Out" : "Check In"}
                        </Badge>
                        <span className="font-medium">{transaction.plate?.plate_id}</span>
                        <Badge variant="outline" className="text-xs">
                          {transaction.plate?.plate_type}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(transaction.transaction_date).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Scientist:</span>{" "}
                        <span className="font-medium">{transaction.scientist?.name}</span>
                        <span className="text-muted-foreground ml-2">({transaction.scientist?.email})</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">{transaction.previous_status}</span>
                        {" → "}
                        <span className="font-medium">{transaction.new_status}</span>
                      </div>
                    </div>

                    {transaction.notes && (
                      <div className="text-sm text-muted-foreground mt-2 bg-muted/50 rounded p-2">
                        {transaction.notes}
                      </div>
                    )}
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
