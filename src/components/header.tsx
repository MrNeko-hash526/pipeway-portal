"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { CommandNavigation } from "@/components/command-navigation"
import { Menu, X, User, Settings, LogOut, Bell, Command } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import Link from "@/components/link"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCommandOpen, setIsCommandOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setIsCommandOpen(true)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <>
      <header className="header-sharp-border border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
                  C
                </div>
                <div className="hidden sm:block">
                  <span className="text-lg font-extrabold text-foreground dark:text-card-foreground">CAM</span>
                </div>
              </Link>
            </div>

            {/* Command / quick nav (desktop) */}
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="outline" onClick={() => setIsCommandOpen(true)} className="flex items-center space-x-2">
                <Command className="h-4 w-4" />
                <span className="text-sm">Navigation</span>
                <Badge variant="secondary" className="ml-2 text-xs">⌘K</Badge>
              </Button>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>

              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">3</Badge>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline text-sm font-medium">Sid</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Mobile navigation */}
          {isMobileMenuOpen && (
            <nav className="md:hidden py-4 border-t border-border">
              <div className="flex flex-col space-y-3">
                <Button variant="ghost" className="justify-start" onClick={() => { setIsCommandOpen(true); setIsMobileMenuOpen(false) }}>
                  <Command className="h-4 w-4 mr-2" /> Open Navigation
                </Button>

                <Link href="/dashboard" className="px-2 py-2 rounded hover:bg-muted/50">Dashboard</Link>
                <Link href="/setup" className="px-2 py-2 rounded hover:bg-muted/50">Setup</Link>
                <Link href="/manage-policies" className="px-2 py-2 rounded hover:bg-muted/50">Manage Policies</Link>
                <Link href="/manage-policies/add" className="px-2 py-2 rounded hover:bg-muted/50">Add Policy</Link>
              </div>
            </nav>
          )}
        </div>
      </header>

      <CommandNavigation isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </>
  )
}
