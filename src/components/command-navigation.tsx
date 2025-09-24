import React, { useEffect, useMemo, useRef, useState } from "react"
import { Home, FileText, ClipboardList, FileCheck, BookOpen, Users, X } from "lucide-react"
import Link from "@/components/link"

interface CommandNavigationProps {
  isOpen: boolean
  onClose: () => void
}

type NavItem = {
  id: string
  title: string
  href: string
  icon: React.ReactNode
  color?: string
  subtitle?: string
}

/* Items match the header navigation provided */
const ITEMS: NavItem[] = [
  { id: "dashboard", title: "Dashboard", href: "/dashboard", icon: <Home />, color: "bg-blue-500" },
  { id: "setup", title: "Setup", href: "/setup", icon: <FileText />, color: "bg-sky-500" },
  { id: "audit-management", title: "Manage Audit", href: "/audit-management", icon: <ClipboardList />, color: "bg-slate-500" },
  { id: "manage-policies", title: "Manage Policies", href: "/manage-policies", icon: <FileCheck />, color: "bg-emerald-600" },
  { id: "licence-and-certificates", title: "Licence & Certificates", href: "/licence-and-certificates", icon: <BookOpen />, color: "bg-cyan-500" },
  { id: "training-and-test", title: "Manage Training", href: "/training-and-test", icon: <Users />, color: "bg-teal-500" },
]

export function CommandNavigation({ isOpen, onClose }: CommandNavigationProps) {
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement | null>(null)
  const dialogRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 40)
    } else {
      setQuery("")
    }
  }, [isOpen])

  // close on escape / click outside
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    const onClick = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("mousedown", onClick)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("mousedown", onClick)
    }
  }, [isOpen, onClose])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ITEMS
    return ITEMS.filter(
      (it) =>
        it.title.toLowerCase().includes(q) ||
        (it.subtitle || "").toLowerCase().includes(q) ||
        it.href.toLowerCase().includes(q)
    )
  }, [query])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        className="w-full max-w-2xl bg-card dark:bg-[rgb(33,33,36)] rounded-lg shadow-lg border border-border overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-lg">⌘</span>
            <div>
              <h3 className="text-base font-semibold">Navigation Command Center</h3>
              <div className="text-xs text-muted-foreground">Quick jump to header pages</div>
            </div>
          </div>

          <button onClick={onClose} aria-label="Close" className="p-1 rounded hover:bg-muted/50 text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search menu (e.g., 'policies', 'audit')"
              className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {results.map((it) => (
              <Link
                key={it.id}
                href={it.href}
                onNavigate={() => onClose()}
                className="flex flex-col items-start gap-2 p-3 rounded-md border border-border hover:shadow-sm transition bg-background"
              >
                <div className={`w-8 h-8 flex items-center justify-center rounded-md text-white ${it.color ?? "bg-slate-500"}`}>
                  {it.icon}
                </div>
                <div className="text-sm font-medium text-foreground">{it.title}</div>
              </Link>
            ))}
            {results.length === 0 && (
              <div className="col-span-3 py-8 text-center text-sm text-muted-foreground">
                No results for <strong className="text-foreground">"{query}"</strong>
              </div>
            )}
          </div>

          <div className="mt-4 text-xs text-muted-foreground text-center">
            Tip: press <kbd className="px-2 py-0.5 bg-muted rounded border">⌘/Ctrl</kbd> + <kbd className="px-2 py-0.5 bg-muted rounded border">K</kbd>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommandNavigation