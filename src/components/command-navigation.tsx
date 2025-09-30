import React, { useEffect, useMemo, useRef, useState } from "react"
import { Home, FileText, ClipboardList, FileCheck, BookOpen, Users, X, Plus, Edit, Upload, FileSearch, Database, List } from "lucide-react"
import Link from "./link"

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
  parent?: string // only set for subpages
}

// --- Hardcoded Pages ---
const ITEMS: NavItem[] = [
  // 🔹 MAIN SECTIONS (always visible at popup open)
  { id: "dashboard", title: "Dashboard", href: "/dashboard", icon: <Home />, color: "bg-blue-500" },
  { id: "setup", title: "Setup", href: "/setup", icon: <FileText />, color: "bg-sky-500" },
  { id: "audit-management", title: "Manage Audit", href: "/audit-management", icon: <ClipboardList />, color: "bg-slate-500" },
  { id: "manage-policies", title: "Manage Policies", href: "/manage-policies", icon: <FileCheck />, color: "bg-emerald-600" },
  { id: "licence-and-certificates", title: "Licence & Certificates", href: "/licence-and-certificates", icon: <BookOpen />, color: "bg-cyan-500" },
  { id: "training-and-test", title: "Manage Training", href: "/training-and-test", icon: <Users />, color: "bg-teal-500" },

  // 🔹 SETUP SUBPAGES
  { id: "vendor-setup", title: "Vendor Setup", href: "/setup/vendor-setup", icon: <Users />, color: "bg-sky-400", parent: "setup" },
  { id: "add-vendor", title: "Add Vendor", href: "/setup/vendor-setup/add", icon: <Plus />, color: "bg-sky-500", parent: "setup" },
  { id: "edit-vendor", title: "Edit Vendor", href: "/setup/vendor-setup/edit", icon: <Edit />, color: "bg-sky-600", parent: "setup" },

  { id: "user-setup", title: "User Setup", href: "/setup/user-setup", icon: <Users />, color: "bg-sky-600", parent: "setup" },
  { id: "add-user", title: "Add User", href: "/setup/user-setup/add", icon: <Plus />, color: "bg-sky-700", parent: "setup" },
  { id: "edit-user", title: "Edit User", href: "/setup/user-setup/edit", icon: <Edit />, color: "bg-sky-800", parent: "setup" },

  { id: "user-groups", title: "User Groups", href: "/setup/user-groups-setup", icon: <Users />, color: "bg-sky-300", parent: "setup" },
  { id: "add-group", title: "Add Group", href: "/setup/user-groups-setup/add", icon: <Plus />, color: "bg-sky-400", parent: "setup" },
  { id: "edit-group", title: "Edit Group", href: "/setup/user-groups-setup/edit", icon: <Edit />, color: "bg-sky-500", parent: "setup" },

  { id: "risk-management", title: "Risk Management", href: "/setup/risk-management", icon: <ClipboardList />, color: "bg-red-500", parent: "setup" },
  { id: "standards", title: "Standards & Citation", href: "/setup/standards-and-citation-management", icon: <ClipboardList />, color: "bg-indigo-500", parent: "setup" },

  // 🔹 AUDIT MANAGEMENT SUBPAGES
  { id: "questions", title: "Questions Setup", href: "/audit-management/questions-setup", icon: <ClipboardList />, color: "bg-slate-600", parent: "audit-management" },
  { id: "add-audit-questions", title: "Add Audit Questions", href: "/audit-management/questions-setup/add", icon: <Plus />, color: "bg-slate-700", parent: "audit-management" },
  { id: "upload-questions", title: "Upload Questions", href: "/audit-management/questions-setup/upload", icon: <Upload />, color: "bg-slate-800", parent: "audit-management" },

  { id: "create-assignments", title: "Create Assignment", href: "/audit-management/create-assignments", icon: <Plus />, color: "bg-slate-500", parent: "audit-management" },
  { id: "assignments", title: "Audit Assignments", href: "/audit-management/assignments", icon: <ClipboardList />, color: "bg-slate-700", parent: "audit-management" },

  { id: "question-groups", title: "Question Groups", href: "/audit-management/question-groups-setup", icon: <ClipboardList />, color: "bg-slate-400", parent: "audit-management" },
  { id: "vendor-responses", title: "Vendor Responses", href: "/audit-management/vendor-responses", icon: <ClipboardList />, color: "bg-slate-300", parent: "audit-management" },
  { id: "respond-vendor", title: "Respond to Vendor", href: "/audit-management/respond-vendor", icon: <ClipboardList />, color: "bg-slate-200", parent: "audit-management" },
  { id: "create-summary", title: "Create Summary", href: "/audit-management/create-summary", icon: <ClipboardList />, color: "bg-slate-500", parent: "audit-management" },
  { id: "create-report", title: "Create Report", href: "/audit-management/create-summary/create-report", icon: <FileSearch />, color: "bg-slate-600", parent: "audit-management" },

  // 🔹 MANAGE POLICIES SUBPAGES
  { id: "add-policy", title: "Add Policy", href: "/manage-policies/add", icon: <Plus />, color: "bg-emerald-500", parent: "manage-policies" },
  { id: "policy-history", title: "Policy History", href: "/manage-policies/Policy-History", icon: <FileCheck />, color: "bg-emerald-400", parent: "manage-policies" },
  { id: "policy-report", title: "Policy Report", href: "/manage-policies/report", icon: <FileSearch />, color: "bg-emerald-600", parent: "manage-policies" },

  // 🔹 LICENCE & CERTIFICATES SUBPAGES
  { id: "add-certificate", title: "Add Certificate", href: "/licence-and-certificates/add", icon: <Plus />, color: "bg-cyan-400", parent: "licence-and-certificates" },

  // 🔹 TRAINING & TEST SUBPAGES
  { id: "training-sop", title: "Training & SOP", href: "/training-and-test/training-sop", icon: <BookOpen />, color: "bg-teal-400", parent: "training-and-test" },
  { id: "add-training-sop", title: "Add Training SOP", href: "/training-and-test/training-sop/add", icon: <Plus />, color: "bg-teal-500", parent: "training-and-test" },
  { id: "training-sop-report", title: "Training SOP Report", href: "/training-and-test/training-sop/report", icon: <FileSearch />, color: "bg-teal-600", parent: "training-and-test" },

  // Question Bank vs Question Set - Different icons and clearer names
  { id: "question-bank-setup", title: "Question Bank Setup", href: "/training-and-test/question-bank-setup", icon: <Database />, color: "bg-teal-700", parent: "training-and-test" },
  { id: "create-question-bank", title: "Create Training Question Bank", href: "/training-and-test/question-bank-setup/add", icon: <Plus />, color: "bg-teal-800", parent: "training-and-test" },

  { id: "question-set-setup", title: "Question Set Setup", href: "/training-and-test/question-setup", icon: <List />, color: "bg-teal-300", parent: "training-and-test" },
  { id: "create-question-set", title: "Create Training Question Set", href: "/training-and-test/question-setup/add", icon: <Plus />, color: "bg-teal-400", parent: "training-and-test" },

  { id: "tests-setup", title: "Tests Setup", href: "/training-and-test/tests-setup", icon: <ClipboardList />, color: "bg-teal-200", parent: "training-and-test" },
  { id: "create-test-parameter", title: "Create Test Parameter", href: "/training-and-test/tests-setup/create-test-parameter", icon: <Plus />, color: "bg-teal-300", parent: "training-and-test" },

  { id: "view-tests", title: "View Tests", href: "/training-and-test/view-tests-setup", icon: <FileSearch />, color: "bg-teal-100", parent: "training-and-test" },
]

export function CommandNavigation({ isOpen, onClose }: CommandNavigationProps) {
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement | null>(null)
  const dialogRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 40)
    else setQuery("")
  }, [isOpen])

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

  // --- Search logic ---
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) {
      return ITEMS.filter((it) => !it.parent) // Only 6 main sections
    }
    return ITEMS.filter((it) => it.title.toLowerCase().includes(q)) // Search shows everything
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
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-lg">⌘</span>
            <div>
              <h3 className="text-base font-semibold">Navigation Command Center</h3>
              <div className="text-xs text-muted-foreground">Quick jump to pages</div>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1 rounded hover:bg-muted/50 text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages... (e.g. 'question bank', 'question set', 'add audit questions')"
            className="w-full mb-4 rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />

          {/* Results */}
          <div className="grid grid-cols-3 gap-3">
            {results.map((it) => (
              <Link
                key={it.id}
                href={it.href}
                onNavigate={onClose}
                className="flex flex-col items-start gap-2 p-3 rounded-md border border-border hover:shadow-sm transition bg-background"
              >
                <div className={`w-8 h-8 flex items-center justify-center rounded-md text-white ${it.color}`}>
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
