"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FlaskConical, Home, FolderOpen, Microscope, Users, ClipboardList, Library, Layers } from "lucide-react"

export function NavBar() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/")

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">Lab Tracker</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button variant={isActive("/") && pathname === "/" ? "default" : "ghost"} size="sm" asChild>
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>

            <Button variant={isActive("/projects") ? "default" : "ghost"} size="sm" asChild>
              <Link href="/projects">
                <FolderOpen className="h-4 w-4 mr-2" />
                Projects
              </Link>
            </Button>

            <Button variant={isActive("/plates") ? "default" : "ghost"} size="sm" asChild>
              <Link href="/plates">
                <Microscope className="h-4 w-4 mr-2" />
                Plates
              </Link>
            </Button>

            <Button variant={isActive("/sets") ? "default" : "ghost"} size="sm" asChild>
              <Link href="/sets">
                <Layers className="h-4 w-4 mr-2" />
                Sets
              </Link>
            </Button>

            <Button variant={isActive("/libraries") ? "default" : "ghost"} size="sm" asChild>
              <Link href="/libraries">
                <Library className="h-4 w-4 mr-2" />
                Libraries
              </Link>
            </Button>

            <Button variant={isActive("/scientists") ? "default" : "ghost"} size="sm" asChild>
              <Link href="/scientists">
                <Users className="h-4 w-4 mr-2" />
                Scientists
              </Link>
            </Button>

            <Button variant={isActive("/transactions") ? "default" : "ghost"} size="sm" asChild>
              <Link href="/transactions">
                <ClipboardList className="h-4 w-4 mr-2" />
                Transactions
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
