import React from "react"
import Link from "@/components/link"

type Group = {
  id: number
  name: string
  dateCreated: string // ISO date
  approver: string
  status: "Active" | "Inactive"
}

const SAMPLE: Group[] = [
  { id: 1, name: "2024 New Firm Due Diligence", dateCreated: "2024-06-17", approver: "Tonia", status: "Active" },
  { id: 2, name: "2024 Reg-F Questionnaire", dateCreated: "2024-05-29", approver: "Shirish", status: "Active" },
  { id: 3, name: "2024 Physical Security Audit", dateCreated: "2024-04-16", approver: "Shirish", status: "Active" },
  { id: 4, name: "2024 Data Security and Privacy", dateCreated: "2024-04-09", approver: "Shirish", status: "Active" },
  { id: 5, name: "Velocity 2024 FDCPA Reg F", dateCreated: "2024-01-31", approver: "Shirish", status: "Active" },
  { id: 6, name: "2024 Due Diligence Questionnaire for Accessibility", dateCreated: "2024-01-17", approver: "Tonia", status: "Active" },
  { id: 7, name: "2023 Data Security and Privacy", dateCreated: "2023-04-12", approver: "Piyalee", status: "Active" },
  { id: 8, name: "Physical Security Audit_202208", dateCreated: "2022-07-16", approver: "Piyalee", status: "Inactive" },
]

export default function QuestionGroupsSetupPage() {
  const [name, setName] = React.useState("")
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<"All" | "Active" | "Inactive">("All")
  const [items, setItems] = React.useState<Group[]>(() => [...SAMPLE])

  const [sort, setSort] = React.useState<{ key: keyof Group | null; dir: "asc" | "desc" | null }>({
    key: null,
    dir: null,
  })

  const toggleSort = (key: keyof Group) => {
    if (sort.key !== key) return setSort({ key, dir: "asc" })
    if (sort.dir === "asc") setSort({ key, dir: "desc" })
    else setSort({ key: null, dir: null })
  }

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    let arr = items.filter((it) => {
      if (statusFilter !== "All" && it.status !== statusFilter) return false
      if (!q) return true
      return it.name.toLowerCase().includes(q) || String(it.id) === q || it.approver.toLowerCase().includes(q)
    })

    if (!sort.key || !sort.dir) return arr

    const dir = sort.dir === "asc" ? 1 : -1
    arr = [...arr].sort((a: any, b: any) => {
      const k = sort.key as keyof Group
      if (k === "id") return (a.id - b.id) * dir
      if (k === "dateCreated") {
        const da = new Date(a.dateCreated).getTime()
        const db = new Date(b.dateCreated).getTime()
        return (da - db) * dir
      }
      const va = String(a[k] ?? "").toLowerCase()
      const vb = String(b[k] ?? "").toLowerCase()
      return va.localeCompare(vb) * dir
    })

    return arr
  }, [items, search, statusFilter, sort])

  const createGroup = (e?: React.FormEvent) => {
    e?.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return alert("Question Group is required")
    const next: Group = {
      id: Date.now(),
      name: trimmed,
      dateCreated: new Date().toISOString().slice(0, 10),
      approver: "You",
      status: "Active",
    }
    setItems((p) => [next, ...p])
    setName("")
  }

  const resetForm = () => setName("")

  const toggleStatus = (id: number) => {
    setItems((p) =>
      p.map((it) =>
        it.id === id ? { ...it, status: it.status === "Active" ? "Inactive" : "Active" } : it
      )
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="mb-4 bg-white dark:bg-[rgb(33,33,36)] border border-border rounded">
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-lg font-medium">List of Question Groups</h2>
          <div>
            <Link href="/audit-management" className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300">
              Back
            </Link>
          </div>
        </div>

        <form onSubmit={createGroup} className="p-4 border-t border-border">
          <div className="grid grid-cols-12 gap-4 items-center">
            <label className="col-span-2 text-sm">Question Group:*</label>
            <div className="col-span-8">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Question Group"
                className="w-full h-10 border rounded px-3 bg-white dark:bg-[rgb(33,33,36)] dark:text-[#e6e6e6]"
              />
            </div>
            <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-2">
              <button
                type="submit"
                disabled={!name.trim()}
                aria-disabled={!name.trim()}
                title="Create Question Group"
                className={`inline-flex items-center gap-2 h-10 px-4 rounded text-sm font-medium transition ${
                  !name.trim()
                    ? "bg-slate-300 text-slate-700 cursor-not-allowed"
                    : "bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Create</span>
              </button>

              <button
                type="button"
                onClick={resetForm}
                title="Reset Question Group"
                className="inline-flex items-center gap-2 h-10 px-3 rounded text-sm font-medium bg-rose-400 text-white hover:bg-rose-500 dark:bg-rose-500 dark:hover:bg-rose-600 transition"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M21 12a9 9 0 10-3 6.7L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M21 3v6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Reset</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="mb-4 bg-white dark:bg-[rgb(33,33,36)] border border-border rounded p-4">
        <div className="grid grid-cols-12 gap-4 items-center">
          <div className="col-span-8">
            <label className="text-sm block mb-1">Search:</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="w-full h-10 border rounded px-3 bg-white dark:bg-[rgb(33,33,36)] dark:text-[#e6e6e6]"
            />
          </div>
          <div className="col-span-4">
            <label className="text-sm block mb-1">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full h-10 border rounded px-3 bg-white dark:bg-[rgb(33,33,36)] dark:text-[#e6e6e6]"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[rgb(33,33,36)] border border-border rounded overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-slate-50 dark:bg-[rgba(255,255,255,0.03)]">
            <tr>
              {[
                { key: "id", label: "#", sortable: false },
                { key: "name", label: "Question Group Name", sortable: true },
                { key: "dateCreated", label: "Date Created", sortable: true },
                { key: "approver", label: "Approver", sortable: true },
                { key: "status", label: "Status", sortable: true },
                { key: "action", label: "Action", sortable: false },
              ].map((col) => {
                const colKey = col.key as keyof Group | "action"
                const isSorted = sort.key === colKey && !!sort.dir
                const arrow = isSorted ? (sort.dir === "asc" ? "▲" : "▼") : null
                
                return (
                  <th
                    key={col.key}
                    className={`p-3 text-left border-b border-border ${col.sortable ? "cursor-pointer select-none" : ""}`}
                    onClick={() => col.sortable && toggleSort(colKey as keyof Group)}
                    role={col.sortable ? "button" : undefined}
                    tabIndex={col.sortable ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (col.sortable && (e.key === "Enter" || e.key === " ")) toggleSort(colKey as keyof Group)
                    }}
                  >
                    {col.sortable ? (
                      <button className="flex items-center justify-between gap-2 w-full cursor-pointer select-none">
                        <span className="flex-1 text-left">{col.label}</span>
                        <span className="text-xs text-slate-400">{arrow}</span>
                      </button>
                    ) : (
                      col.label
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500 dark:text-[#e6e6e6]">
                  No question groups found.
                </td>
              </tr>
            )}

            {filtered.map((g, i) => (
              <tr key={g.id} className="odd:bg-white even:bg-slate-50 dark:odd:bg-[rgba(255,255,255,0.02)] dark:even:bg-transparent">
                <td className="p-3 border-b border-border align-top">{i + 1}</td>
                <td className="p-3 border-b border-border align-top">{g.name}</td>
                <td className="p-3 border-b border-border align-top">{new Date(g.dateCreated).toLocaleDateString()}</td>
                <td className="p-3 border-b border-border align-top">{g.approver}</td>
                <td className="p-3 border-b border-border align-top">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                      g.status === "Active"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-700 dark:bg-[rgba(255,255,255,0.03)] dark:text-[#e6e6e6]"
                    }`}
                  >
                    {g.status}
                  </span>
                </td>
                <td className="p-3 border-b border-border align-top">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/audit-management/question-groups/view?id=${g.id}`}
                      className="text-sky-600 hover:underline"
                      title="View"
                    >
                      View
                    </Link>
                    <Link
                      href={`/audit-management/question-groups/edit?id=${g.id}`}
                      className="text-amber-600 hover:underline"
                      title="Edit"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => toggleStatus(g.id)}
                      className="text-gray-600 hover:underline"
                      title={g.status === "Active" ? "Disable" : "Enable"}
                    >
                      {g.status === "Active" ? "Disable" : "Enable"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
