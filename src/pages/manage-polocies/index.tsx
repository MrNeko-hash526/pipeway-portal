import React from "react"
import Link from "@/components/link"

type Policy = {
  id: number
  name: string
  version: string
  category: string
  title: string
  expDate?: string
  creator: string
  approver?: string
  status: "Draft" | "Published" | "Archived"
}

const seedPolicies: Policy[] = [
  {
    id: 1,
    name: "IPs Removal Policy",
    version: "1.1",
    category: "Data Security and Privacy",
    title: "Data Security Policy",
    expDate: "2026-03-31",
    creator: "Shirish",
    approver: "Tonia",
    status: "Published",
  },
  {
    id: 2,
    name: "Acceptable Use",
    version: "1.0",
    category: "IT Policy",
    title: "Acceptable Use Policy",
    expDate: "2025-12-31",
    creator: "Aisha",
    approver: "Cole",
    status: "Draft",
  },
]

export default function ManagePoliciesPage() {
  // UI state (static data for testing)
  const [policies, setPolicies] = React.useState<Policy[]>(() => [...seedPolicies])

  // filters
  const [categoryFilter, setCategoryFilter] = React.useState<string>("")
  const [titleFilter, setTitleFilter] = React.useState<string>("")
  const [statusFilter, setStatusFilter] = React.useState<string>("")
  const [query, setQuery] = React.useState<string>("")

  // sorting state
  const [sortKey, setSortKey] = React.useState<keyof Policy | null>(null)
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc")

  // confirmation and toasts
  const [confirm, setConfirm] = React.useState<{ id: number; message: string } | null>(null)
  const [toast, setToast] = React.useState<{ message: string; type?: "success" | "error" } | null>(null)
  const toastTimerRef = React.useRef<number | null>(null)
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type })
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current)
    toastTimerRef.current = window.setTimeout(() => setToast(null), 3000)
  }
  React.useEffect(() => () => { if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current) }, [])

  // filtering logic
  const filtered = React.useMemo(() => {
    return policies.filter((p) => {
      if (categoryFilter && p.category !== categoryFilter) return false
      if (titleFilter && p.title !== titleFilter) return false
      if (statusFilter && p.status !== statusFilter) return false
      const q = query.trim().toLowerCase()
      if (!q) return true
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.creator.toLowerCase().includes(q)
      )
    })
  }, [policies, categoryFilter, titleFilter, statusFilter, query])

  // sorting logic
  const sortedFiltered = React.useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      let cmp = 0
      if (sortKey === "expDate") {
        // date sort
        const aDate = aVal ? new Date(aVal as string) : new Date(0)
        const bDate = bVal ? new Date(bVal as string) : new Date(0)
        cmp = aDate.getTime() - bDate.getTime()
      } else if (typeof aVal === "string" && typeof bVal === "string") {
        cmp = aVal.localeCompare(bVal)
      } else {
        cmp = (aVal as any) - (bVal as any)
      }
      return sortDirection === "asc" ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDirection])

  // handle sort click
  const handleSort = (key: keyof Policy) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDirection("asc")
    }
  }

  // delete flow: show confirm panel (bottom-right), then delete on confirm
  const handleDelete = (id: number) => setConfirm({ id, message: "Delete this policy? This action cannot be undone." })
  const confirmDelete = (id: number) => {
    setPolicies(prev => prev.filter(p => p.id !== id))
    setConfirm(null)
    showToast("Policy deleted", "success")
  }
  const cancelDelete = () => setConfirm(null)

  // Apply filter (no backend; just kept for UI)
  const applyFilter = (e?: React.FormEvent) => {
    e?.preventDefault()
    showToast("Filter applied", "success")
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* top controls (no static breadcrumb) */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">List of Policies</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Search, filter and manage policies.</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/manage-policies/Policy-History"
            className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm text-slate-700 dark:text-slate-200 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-sky-400"
            aria-label="Add history"
          >
            <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Add History
          </Link>

          <button
            type="button"
            className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm text-slate-700 dark:text-slate-200 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-sky-400"
            aria-label="Report"
          >
            <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M3 7h18M7 3v4M17 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 21H3v-6a4 4 0 014-4h10a4 4 0 014 4v6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Report
          </button>

          <Link
            href="/manage-policies/add"
            className="inline-flex items-center gap-2 px-3 py-2 bg-sky-600 text-white rounded-md text-sm hover:bg-sky-700 shadow-md focus:outline-none focus:ring-2 focus:ring-sky-400"
            aria-label="Add policy"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Add Policy
          </Link>
        </div>
      </div>

      {/* filter area */}
      <form onSubmit={applyFilter} className="bg-white/5 border rounded-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-3">
            <label className="text-sm text-slate-600 dark:text-slate-300 mb-1 block">Category:</label>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="w-full border rounded px-2 py-2 bg-white dark:bg-slate-700">
              <option value="">All</option>
              <option>Data Security and Privacy</option>
              <option>IT Policy</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="text-sm text-slate-600 dark:text-slate-300 mb-1 block">Title:</label>
            <select value={titleFilter} onChange={e => setTitleFilter(e.target.value)} className="w-full border rounded px-2 py-2 bg-white dark:bg-slate-700">
              <option value="">All</option>
              <option>Data Security Policy</option>
              <option>Acceptable Use Policy</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="text-sm text-slate-600 dark:text-slate-300 mb-1 block">Search:</label>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search" className="w-full border rounded px-2 py-2 bg-white dark:bg-slate-700" />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-slate-600 dark:text-slate-300 mb-1 block">Status:</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full border rounded px-2 py-2 bg-white dark:bg-slate-700">
              <option value="">All</option>
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          <div className="md:col-span-1 flex justify-end">
            <button type="submit" className="px-3 py-2 bg-sky-600 text-white rounded hover:bg-sky-700">Apply Filter</button>
          </div>
        </div>
      </form>

      {/* table */}
      <div className="overflow-x-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
        <table className="min-w-full table-fixed">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-sm">
              <th className="p-3 text-left w-12">#</th>
              <th className="p-3 text-left cursor-pointer select-none" onClick={() => handleSort("name")}>
                Policy Name {sortKey === "name" && (sortDirection === "asc" ? '▲' : '▼')}
              </th>
              <th className="p-3 text-left w-20 cursor-pointer select-none" onClick={() => handleSort("version")}>
                Ver {sortKey === "version" && (sortDirection === "asc" ? '▲' : '▼')}
              </th>
              <th className="p-3 text-left cursor-pointer select-none" onClick={() => handleSort("category")}>
                Category {sortKey === "category" && (sortDirection === "asc" ? '▲' : '▼')}
              </th>
              <th className="p-3 text-left cursor-pointer select-none" onClick={() => handleSort("title")}>
                Title {sortKey === "title" && (sortDirection === "asc" ? '▲' : '▼')}
              </th>
              <th className="p-3 text-left cursor-pointer select-none" onClick={() => handleSort("expDate")}>
                Exp Date {sortKey === "expDate" && (sortDirection === "asc" ? '▲' : '▼')}
              </th>
              <th className="p-3 text-left cursor-pointer select-none" onClick={() => handleSort("creator")}>
                Creator {sortKey === "creator" && (sortDirection === "asc" ? '▲' : '▼')}
              </th>
              <th className="p-3 text-left cursor-pointer select-none" onClick={() => handleSort("approver")}>
                Approver {sortKey === "approver" && (sortDirection === "asc" ? '▲' : '▼')}
              </th>
              <th className="p-3 text-left w-24 cursor-pointer select-none" onClick={() => handleSort("status")}>
                Status {sortKey === "status" && (sortDirection === "asc" ? '▲' : '▼')}
              </th>
              <th className="p-3 text-left w-40">Action</th>
            </tr>
          </thead>

          <tbody>
            {sortedFiltered.map((p, idx) => (
              <tr key={p.id} className="border-t even:bg-white/2 dark:even:bg-slate-900/30">
                <td className="p-3 text-sm">{idx + 1}</td>
                <td className="p-3 text-sm text-sky-600">
                  <Link href={`/manage-policies/view?id=${p.id}`} className="hover:underline">{p.name}</Link>
                </td>
                <td className="p-3 text-sm">{p.version}</td>
                <td className="p-3 text-sm">{p.category}</td>
                <td className="p-3 text-sm">{p.title}</td>
                <td className="p-3 text-sm">{p.expDate ?? "—"}</td>
                <td className="p-3 text-sm">{p.creator}</td>
                <td className="p-3 text-sm">{p.approver ?? "—"}</td>
                <td className="p-3 text-sm">
                  <span className={`inline-block px-2 py-1 text-xs rounded ${p.status === "Published" ? "bg-emerald-100 text-emerald-800" : p.status === "Draft" ? "bg-yellow-100 text-yellow-800" : "bg-slate-100 text-slate-800"}`}>{p.status}</span>
                </td>
                <td className="p-3 text-sm">
                  <div className="flex items-center gap-2">
                    {/* View as text link */}
                    <Link
                      href={`/manage-policies/view?id=${p.id}`}
                      className="text-sky-600 hover:underline text-sm"
                      title="View"
                      aria-label={`View ${p.name}`}
                    >
                      View
                    </Link>

                    {/* Edit as text link */}
                    <Link
                      href={`/manage-policies/edit?id=${p.id}`}
                      className="text-slate-700 dark:text-slate-100 hover:underline text-sm"
                      title="Edit"
                      aria-label={`Edit ${p.name}`}
                    >
                      Edit
                    </Link>

                    {/* Notes icon only */}
                    <button
                      type="button"
                      onClick={() => { /* TODO: open comments modal */ }}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-100 shadow-sm"
                      title="Notes"
                      aria-label={`Notes ${p.name}`}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>

                    {/* Delete icon only */}
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-900/10 dark:hover:bg-rose-900/20 shadow-sm"
                      title="Delete"
                      aria-label={`Delete ${p.name}`}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M3 6h18M8 6v12a2 2 0 002 2h4a2 2 0 002-2V6M10 6V4a2 2 0 012-2h0a2 2 0 012 2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {sortedFiltered.length === 0 && (
              <tr>
                <td colSpan={10} className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">No policies found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* confirmation panel (fixed bottom-right) */}
      {confirm && (
        <div className="fixed right-4 bottom-4 z-50">
          <div className="bg-white dark:bg-slate-800 border rounded shadow p-3 text-sm w-80">
            <div className="mb-3 text-slate-800 dark:text-slate-200">{confirm.message}</div>
            <div className="flex justify-end gap-2">
              <button
                onClick={cancelDelete}
                className="px-3 py-1 rounded-md border border-slate-200 bg-white text-sm text-slate-700 hover:bg-slate-50 dark:bg-slate-700 dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(confirm.id)}
                className="px-3 py-1 rounded-md bg-rose-600 text-white text-sm hover:bg-rose-700 shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* transient toast (appears above confirmation panel when visible) */}
      {toast && (
        <div className="fixed right-4 z-50" style={{ bottom: confirm ? "10.5rem" : "1rem" }}>
          <div role="status" aria-live="polite" className={`px-4 py-2 rounded shadow-md text-sm ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}>
            {toast.message}
          </div>
        </div>
      )}

      <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">© 2025 CAM powered by Goolean Technologies NA LLC</div>
    </div>
  )
}