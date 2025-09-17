"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "@/components/link"
import { ThemeToggle } from "./theme-toggle"
import {
  Menu,
  X,
  User,
  Settings,
  LogOut,
  Bell,
  HelpCircle,
  Repeat,
  Home,
  FileText,
  ClipboardList,
  BookOpen,
  FileCheck,
  Users,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="relative flex items-center justify-between h-17">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 bg-primary rounded-sm flex items-center justify-center shadow-md border-2 border-primary/30">
                <span className="text-primary-foreground font-extrabold text-xl tracking-tight uppercase">
                  P
                </span>
              </div>
              <span className="text-xl font-extrabold text-foreground tracking-tight uppercase">
                Pipeway
              </span>
            </div>
          </div>

          {/* Desktop Navigation moved to subnavbar */}
          <div className="hidden md:block" />

          {/* User Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="relative">
              <Repeat className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="sm" className="relative">
              <HelpCircle className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge
                className="absolute -top-1 -right-1"
                variant="secondary"
              >
                3
              </Badge>
            </Button>

            <div className="hidden sm:inline-flex">
              <ThemeToggle />
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline font-bold">Sid</span>
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

            <Button
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex"
              onClick={() => {
                /* TODO: logout handler */
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-3">
              <Link
                href="/dashboard"
                onNavigate={() => setIsMobileMenuOpen(false)}
                className={mobileNavLink}
              >
                Dashboard
              </Link>
              <Link
                href="/setup"
                onNavigate={() => setIsMobileMenuOpen(false)}
                className={mobileNavLink}
              >
                Setup
              </Link>
              <Link
                href="/audit-management"
                onNavigate={() => setIsMobileMenuOpen(false)}
                className={mobileNavLink}
              >
                Audit Management
              </Link>
              <Link
                href="/policy-and-procedures"
                onNavigate={() => setIsMobileMenuOpen(false)}
                className={mobileNavLink}
              >
                Policy & Procedures
              </Link>
              <Link
                href="/policy-and-procedures/write-a-policy"
                onNavigate={() => setIsMobileMenuOpen(false)}
                className={mobileNavLink}
              >
                Write a Policy
              </Link>
              <Link
                href="/licence-and-certificates"
                onNavigate={() => setIsMobileMenuOpen(false)}
                className={mobileNavLink}
              >
                Licence & Certificates
              </Link>
              <Link
                href="/training-and-test"
                onNavigate={() => setIsMobileMenuOpen(false)}
                className={mobileNavLink}
              >
                Training & Test Management
              </Link>
            </div>
          </nav>
        )}

        {/* Sub-navbar */}
        <div className="w-full border-t border-border bg-muted/5">
          <div className="container mx-auto px-2">
            <div className="flex items-center justify-between h-11">
              <div className="flex items-center justify-center w-full">
                <nav className="hidden md:flex md:flex-wrap items-center gap-1 justify-center">
                  <Link href="/dashboard" className={navLink}>
                    <Home className="h-5 w-5 text-foreground" />
                    <span>Dashboard</span>
                  </Link>
                  <Link href="/setup" className={navLink}>
                    <FileText className="h-5 w-5 text-foreground" />
                    <span>Setup</span>
                  </Link>
                  <Link href="/audit-management" className={navLink}>
                    <ClipboardList className="h-5 w-5 text-foreground" />
                    <span>Managing Audit</span>
                  </Link>
                  <Link href="/policy-and-procedures" className={navLink}>
                    <FileCheck className="h-5 w-5 text-foreground" />
                    <span>Managing Policies </span>
                  </Link>
                  {/* <Link
                    href="/policy-and-procedures/write-a-policy"
                    className={navLink}
                  >
                    <FileText className="h-5 w-5 text-foreground" />
                    <span>Write a Policy</span>
                  </Link> */}
                  <Link href="/licence-and-certificates" className={navLink}>
                    <BookOpen className="h-5 w-5 text-foreground" />
                    <span>Licence & Certificates</span>
                  </Link>
                  <Link href="/training-and-test" className={navLink}>
                    <Users className="h-5 w-5 text-foreground" />
                    <span>Managing Training</span>
                  </Link>
                </nav>
                <div className="text-sm text-muted-foreground md:hidden font-bold">
                  Notifications
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

// Desktop nav link styles
const navLink =
  "flex items-center gap-2 px-4 py-1 rounded-sm font-semibold text-sm text-foreground hover:text-primary hover:bg-primary/5 transition-colors"

// Mobile nav link styles
const mobileNavLink =
  "text-foreground hover:text-primary transition-colors px-2 py-1 font-medium"
